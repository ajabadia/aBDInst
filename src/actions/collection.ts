'use server';

import dbConnect from '@/lib/db';
import UserCollection from '@/models/UserCollection';
import Instrument from '@/models/Instrument';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';

export async function getUserCollection() {
    try {
        const session = await auth();
        if (!session?.user) return [];

        await dbConnect();

        // Populate instrument details
        const collection = await UserCollection.find({ userId: (session.user as any).id })
            .populate('instrumentId')
            .sort({ createdAt: -1 });

        return collection.map(doc => {
            const obj = doc.toObject();
            return {
                ...obj,
                _id: obj._id.toString(),
                userId: obj.userId.toString(),
                instrumentId: {
                    ...obj.instrumentId,
                    _id: obj.instrumentId._id.toString(),
                    // sanitize other objectIds in instrument if needed
                },
                acquisition: {
                    ...obj.acquisition,
                    date: obj.acquisition?.date ? obj.acquisition.date.toISOString() : null
                }
            };
        });
    } catch (error) {
        console.error('Get Collection Error:', error);
        return [];
    }
}

export async function addToCollection(instrumentId: string) {
    try {
        const session = await auth();
        if (!session?.user) throw new Error('Unauthorized');

        await dbConnect();

        // Check if already in collection? (Optional: allow duplicates)

        const newItem = await UserCollection.create({
            userId: (session.user as any).id,
            instrumentId: instrumentId,
            status: 'active',
            acquisition: { date: new Date() } // Default to now
        });

        revalidatePath('/dashboard');
        return { success: true, id: newItem._id.toString() };
    } catch (error: any) {
        console.error('Add to Collection Error:', error);
        return { success: false, error: error.message };
    }
}

export async function getCollectionItemById(id: string) {
    try {
        const session = await auth();
        if (!session?.user) return null;

        await dbConnect();

        const item = await UserCollection.findOne({
            _id: id,
            userId: (session.user as any).id
        }).populate('instrumentId');

        if (!item) return null;

        const obj = item.toObject();
        return {
            ...obj,
            _id: obj._id.toString(),
            userId: obj.userId.toString(),
            instrumentId: {
                ...obj.instrumentId,
                _id: obj.instrumentId._id.toString(),
                // genericImages included in populate
            },
            acquisition: {
                ...obj.acquisition,
                date: obj.acquisition?.date ? obj.acquisition.date.toISOString().split('T')[0] : ''
            }
        };

    } catch (error) {
        console.error('Get Collection Item Error:', error);
        return null;
    }
}

export async function updateCollectionItem(id: string, formData: FormData) {
    try {
        const session = await auth();
        if (!session?.user) throw new Error('Unauthorized');

        await dbConnect();

        const data = {
            status: formData.get('status'),
            condition: formData.get('condition'),
            serialNumber: formData.get('serialNumber'),
            acquisition: {
                date: formData.get('acquisition.date') ? new Date(formData.get('acquisition.date') as string) : undefined,
                price: Number(formData.get('acquisition.price')) || undefined,
                currency: formData.get('acquisition.currency'),
                seller: formData.get('acquisition.seller'),
                source: formData.get('acquisition.source'),
            },
            customNotes: formData.get('customNotes'),
        };

        const updated = await UserCollection.findOneAndUpdate(
            { _id: id, userId: (session.user as any).id },
            { $set: data },
            { new: true }
        );

        if (!updated) throw new Error('Item not found or unauthorized');

        revalidatePath('/dashboard');
        revalidatePath(`/dashboard/collection/${id}`);
        return { success: true };
    } catch (error: any) {
        console.error('Update Collection Item Error:', error);
        return { success: false, error: error.message };
    }
}
