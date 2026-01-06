'use server';

import dbConnect from '@/lib/db';
import UserCollection from '@/models/UserCollection';
import Instrument from '@/models/Instrument';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';
import { logActivity } from './social';

/* --- COLLECTION MANAGEMENT --- */

export async function getUserCollection() {
    const session = await auth();
    if (!session?.user?.id) return [];
    await dbConnect();
    const collection = await UserCollection.find({ userId: session.user.id, deletedAt: null })
        .populate({ path: 'instrumentId', select: 'brand model type genericImages' })
        .sort({ createdAt: -1 }).lean();
    return JSON.parse(JSON.stringify(collection));
}

export async function addToCollection(instrumentId: string) {
    const session = await auth();
    if (!session?.user?.id) throw new Error('Unauthorized');
    await dbConnect();
    const newItem = await UserCollection.create({ userId: session.user.id, instrumentId, status: 'active' });
    revalidatePath('/dashboard');
    return { success: true, id: newItem._id.toString() };
}

export async function updateCollectionItem(id: string, data: any) {
    const session = await auth();
    await dbConnect();
    await UserCollection.findOneAndUpdate({ _id: id, userId: session?.user?.id }, { $set: data });
    revalidatePath(`/dashboard/collection/${id}`);
    return { success: true };
}

export async function deleteCollectionItem(id: string) {
    const session = await auth();
    await dbConnect();
    await UserCollection.findOneAndUpdate({ _id: id, userId: session?.user?.id }, { deletedAt: new Date() });
    revalidatePath('/dashboard');
    return { success: true };
}

/* --- WISHLIST --- */

export async function toggleWishlist(instrumentId: string) {
    const session = await auth();
    if (!session?.user?.id) return { success: false };
    await dbConnect();
    const existing = await UserCollection.findOne({ userId: session.user.id, instrumentId, status: 'wishlist' });
    if (existing) {
        await UserCollection.findByIdAndDelete(existing._id);
        return { success: true, action: 'removed' };
    }
    await UserCollection.create({ userId: session.user.id, instrumentId, status: 'wishlist' });
    return { success: true, action: 'added' };
}

/* --- MAINTENANCE --- */

export async function addMaintenanceRecord(collectionId: string, record: any) {
    const session = await auth();
    await dbConnect();
    await UserCollection.findOneAndUpdate(
        { _id: collectionId, userId: session?.user?.id },
        { $push: { maintenanceHistory: record } }
    );
    revalidatePath(`/dashboard/collection/${collectionId}`);
    return { success: true };
}
