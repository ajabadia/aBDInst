'use server';

import dbConnect from '@/lib/db';
import UserCollection from '@/models/UserCollection';
import Instrument from '@/models/Instrument';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';
import { logActivity } from './social';

export async function toggleWishlist(instrumentId: string) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: 'No autorizado' };
        }

        const userId = session.user.id;
        await dbConnect();

        // 1. Check if the user already owns this instrument in their active collection
        const ownedItem = await UserCollection.findOne({
            userId,
            instrumentId,
            status: { $ne: 'wishlist' }
        }).select('_id status').lean();

        if (ownedItem) {
            return { 
                success: false, 
                error: 'Ya tienes este instrumento en tu colección',
                action: 'owned' 
            };
        }

        // 2. Check if it's already in the wishlist
        const wishlistItem = await UserCollection.findOne({
            userId,
            instrumentId,
            status: 'wishlist'
        }).select('_id').lean();

        if (wishlistItem) {
            await UserCollection.findByIdAndDelete(wishlistItem._id);
            revalidatePath('/dashboard/wishlist');
            revalidatePath('/instruments');
            return { success: true, action: 'removed' };
        }

        // 3. Create new wishlist item
        await UserCollection.create({
            userId,
            instrumentId,
            status: 'wishlist',
            condition: 'good'
        });

        // Revalidate relevant paths
        revalidatePath('/dashboard/wishlist');
        revalidatePath('/instruments');

        // 4. Log activity (non-blocking)
        Instrument.findById(instrumentId).select('brand model').lean().then(async (instrument) => {
            if (instrument) {
                await logActivity('add_wishlist', {
                    instrumentId,
                    instrumentName: `${instrument.brand} ${instrument.model}`
                });
            }
        }).catch(err => console.error("Wishlist Activity Log Error:", err));

        return { success: true, action: 'added' };

    } catch (error: any) {
        console.error('Toggle Wishlist Error:', error);
        return { success: false, error: error.message };
    }
}

export async function getWishlist() {
    try {
        const session = await auth();
        if (!session?.user?.id) return { success: false, error: 'No autorizado' };

        await dbConnect();

        // Optimized populate: only fetch necessary fields for the grid
        const items = await UserCollection.find({
            userId: session.user.id,
            status: 'wishlist'
        })
            .populate({
                path: 'instrumentId',
                select: 'brand model type genericImages years'
            })
            .sort({ createdAt: -1 })
            .lean();

        return { success: true, data: JSON.parse(JSON.stringify(items)) };
    } catch (error: any) {
        console.error('Get Wishlist Error:', error);
        return { success: false, error: error.message };
    }
}

export async function checkWishlistStatus(instrumentId: string): Promise<boolean> {
    try {
        const session = await auth();
        if (!session?.user?.id) return false;

        await dbConnect();
        const item = await UserCollection.findOne({
            userId: session.user.id,
            instrumentId: instrumentId,
            status: 'wishlist'
        }).select('_id').lean();

        return !!item;
    } catch (error) {
        return false;
    }
}
