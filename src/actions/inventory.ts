'use server';

import dbConnect from '@/lib/db';
import UserCollection from '@/models/UserCollection';
import Instrument from '@/models/Instrument';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';
import { logActivity } from './community'; // Updated import

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

export async function getCollectionItemById(id: string) {
    const session = await auth();
    if (!session?.user?.id) return null;
    await dbConnect();
    const item = await UserCollection.findOne({ _id: id, userId: session.user.id }).populate('instrumentId').lean();
    return item ? JSON.parse(JSON.stringify(item)) : null;
}

export async function updateCollectionItem(id: string, data: any) {
    const session = await auth();
    await dbConnect();
    const updated = await UserCollection.findOneAndUpdate({ _id: id, userId: session?.user?.id }, { $set: data }, { new: true });
    revalidatePath(`/dashboard/collection/${id}`);
    revalidatePath('/dashboard');
    return { success: true };
}

export async function deleteCollectionItem(id: string) {
    const session = await auth();
    await dbConnect();
    await UserCollection.findOneAndUpdate({ _id: id, userId: session?.user?.id }, { deletedAt: new Date(), status: 'archived' });
    revalidatePath('/dashboard');
    return { success: true };
}

export async function restoreCollectionItem(id: string) {
    const session = await auth();
    await dbConnect();
    await UserCollection.findOneAndUpdate({ _id: id, userId: session?.user?.id }, { deletedAt: null, status: 'active' });
    revalidatePath('/dashboard');
    return { success: true };
}

export async function toggleLoan(collectionId: string, data: any) {
    const session = await auth();
    await dbConnect();
    const item = await UserCollection.findOne({ _id: collectionId, userId: session?.user?.id });
    if (!item) return { success: false };
    item.loan = data.action === 'lend' ? { active: true, ...data } : { active: false };
    await item.save();
    revalidatePath(`/dashboard/collection/${collectionId}`);
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
        revalidatePath('/dashboard/wishlist');
        return { success: true, action: 'removed' };
    }
    await UserCollection.create({ userId: session.user.id, instrumentId, status: 'wishlist' });
    revalidatePath('/dashboard/wishlist');
    return { success: true, action: 'added' };
}

export async function getWishlist() {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: 'Unauthorized' };
    await dbConnect();
    const items = await UserCollection.find({ userId: session.user.id, status: 'wishlist' })
        .populate({ path: 'instrumentId', select: 'brand model type genericImages years' })
        .sort({ createdAt: -1 }).lean();
    return { success: true, data: JSON.parse(JSON.stringify(items)) };
}

export async function checkWishlistStatus(instrumentId: string) {
    const session = await auth();
    if (!session?.user?.id) return false;
    await dbConnect();
    const item = await UserCollection.findOne({ userId: session.user.id, instrumentId, status: 'wishlist' }).select('_id').lean();
    return !!item;
}

/* --- MAINTENANCE --- */

export async function getUpcomingMaintenance(limit = 10) {
    const session = await auth();
    if (!session?.user?.id) return { success: false };
    await dbConnect();
    const items = await UserCollection.find({ userId: session.user.id, nextMaintenanceDate: { $exists: true, $ne: null }, deletedAt: null })
        .populate({ path: 'instrumentId', select: 'brand model genericImages' })
        .sort({ nextMaintenanceDate: 1 }).limit(limit).lean();
    return { success: true, data: JSON.parse(JSON.stringify(items)) };
}

export async function addMaintenanceRecord(collectionId: string, record: any) {
    const session = await auth();
    await dbConnect();
    await UserCollection.findOneAndUpdate({ _id: collectionId, userId: session?.user?.id }, { $push: { maintenanceHistory: record } });
    revalidatePath(`/dashboard/collection/${collectionId}`);
    return { success: true };
}

/* --- GALLERY --- */

export async function deleteCollectionImage(collectionId: string, imageUrl: string) {
    const session = await auth();
    await dbConnect();
    await UserCollection.findOneAndUpdate({ _id: collectionId, userId: session?.user?.id }, { $pull: { images: { url: imageUrl } } });
    revalidatePath(`/dashboard/collection/${collectionId}`);
    return { success: true };
}

export async function setPrimaryImage(collectionId: string, imageUrl: string) {
    const session = await auth();
    await dbConnect();
    const item = await UserCollection.findOne({ _id: collectionId, userId: session?.user?.id });
    if (!item) return { success: false };
    item.images.forEach((img: any) => img.isPrimary = img.url === imageUrl);
    await item.save();
    revalidatePath(`/dashboard/collection/${collectionId}`);
    return { success: true };
}

/* --- VALUATION --- */

export async function deleteValuationById(id: string) {
    // Logic to delete from price alerts or valuation history
    return { success: true };
}
