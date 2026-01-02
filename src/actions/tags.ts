'use server';

import { auth } from '@/auth';
import dbConnect from '@/lib/db';
import UserCollection from '@/models/UserCollection';
import { revalidatePath } from 'next/cache';

export async function updateCollectionTags(collectionId: string, tags: string[]) {
    try {
        const session = await auth();
        if (!session?.user?.id) throw new Error('No autorizado');

        await dbConnect();

        // Verify ownership
        const item = await UserCollection.findOne({
            _id: collectionId,
            userId: session.user.id
        });

        if (!item) {
            return { success: false, error: 'Item not found' };
        }

        // Update tags
        await UserCollection.findByIdAndUpdate(collectionId, {
            $set: { tags: tags.map(t => t.toLowerCase().trim()) }
        });

        revalidatePath('/dashboard');
        revalidatePath(`/dashboard/collection/${collectionId}`);

        return { success: true };
    } catch (error: any) {
        console.error('Update tags error:', error);
        return { success: false, error: error.message };
    }
}

export async function getAllUserTags() {
    try {
        const session = await auth();
        if (!session?.user?.id) return [];

        await dbConnect();

        // Get all unique tags from user's collection
        const result = await UserCollection.aggregate([
            { $match: { userId: session.user.id } },
            { $unwind: '$tags' },
            { $group: { _id: '$tags', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 50 }
        ]);

        return result.map(r => r._id);
    } catch (error) {
        console.error('Get user tags error:', error);
        return [];
    }
}
