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

        await dbConnect();

        // Check if item exists in ANY status for this user and instrument
        const existingItem = await UserCollection.findOne({
            userId: session.user.id,
            instrumentId: instrumentId
        });

        if (existingItem) {
            // If it's in wishlist, remove it
            if (existingItem.status === 'wishlist') {
                await UserCollection.findByIdAndDelete(existingItem._id);
                revalidatePath('/dashboard/wishlist');
                revalidatePath('/instruments');
                return { success: true, action: 'removed' };
            }

            // If it's owned (active/sold/repair), we generally shouldn't add to wishlist again
            // UNLESS we want to support multiple copies, but for now let's say "You already own this"
            if (existingItem.status !== 'wishlist') {
                // Optional: Allow adding another copy? For now, we return a message
                // Or we could create a NEW entry with status wishlist to allow wishing for a second unit
                // Let's implement creating a NEW entry to allow multiple units/wishes
                // But wait, toggle implies on/off. 
                // Simple approach: If you own it, the button serves as "Add another to wishlist" ?
                // No, standard UX: Wishlist button usually toggles "Is in wishlist".
                // Let's check if there is specifically a WISHLIST item.
            }
        }

        // Re-check specifically for wishlist status to handle multiple entries correctly
        const wishlistItem = await UserCollection.findOne({
            userId: session.user.id,
            instrumentId: instrumentId,
            status: 'wishlist'
        });

        if (wishlistItem) {
            await UserCollection.findByIdAndDelete(wishlistItem._id);
            revalidatePath('/dashboard/wishlist');
            revalidatePath('/instruments');
            return { success: true, action: 'removed' };
        }

        // Create new wishlist item
        await UserCollection.create({
            userId: session.user.id,
            instrumentId: instrumentId,
            status: 'wishlist',
            condition: 'good' // default
        });

        revalidatePath('/dashboard/wishlist');




        // Log activity
        const instrument = await Instrument.findById(instrumentId).select('brand model');
        if (instrument) {
            await logActivity('add_wishlist', {
                instrumentId,
                instrumentName: `${instrument.brand} ${instrument.model}`
            });
        }
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

        const items = await UserCollection.find({
            userId: session.user.id,
            status: 'wishlist'
        })
            .populate('instrumentId')
            .sort({ createdAt: -1 });

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
        });

        return !!item;
    } catch (error) {
        return false;
    }
}
