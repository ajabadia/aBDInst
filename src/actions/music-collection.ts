'use server';

import dbConnect from '@/lib/db';
import UserMusicCollection from '@/models/UserMusicCollection';
import { revalidatePath } from 'next/cache';

export async function removeFromMusicCollection(userCollectionId: string) {
    const session = await (await import('@/auth')).auth();
    if (!session) return { success: false, error: 'Unauthorized' };

    await dbConnect();

    try {
        const deleted = await UserMusicCollection.findOneAndDelete({
            _id: userCollectionId,
            userId: session.user.id // Security: only delete own items
        });

        if (!deleted) {
            return { success: false, error: 'Item not found or unauthorized' };
        }

        revalidatePath('/dashboard/music');
        return { success: true };
    } catch (error: any) {
        console.error('Remove from collection error:', error);
        return { success: false, error: error.message };
    }
}
