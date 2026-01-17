'use server';

import dbConnect from '@/lib/db';
import MarketListing from '@/models/MarketListing';
import UserCollection from '@/models/UserCollection';
import Instrument from '@/models/Instrument'; // Populate dependency

// --- READ ---
export async function getMarketListings(filters: any = {}) {
    await dbConnect();

    const query: any = { status: 'active' };

    // Basic filters
    if (filters.minPrice) query.price = { ...query.price, $gte: filters.minPrice };
    if (filters.maxPrice) query.price = { ...query.price, $lte: filters.maxPrice };

    const listings = await MarketListing.find(query)
        .sort({ createdAt: -1 })
        .populate('instrument')
        .populate('user', 'name image location')
        .lean();

    return JSON.parse(JSON.stringify(listings));
}

export async function getMarketListingById(id: string) {
    await dbConnect();

    // Increment views atomically
    const listing = await MarketListing.findByIdAndUpdate(id, { $inc: { views: 1 } }, { new: true })
        .populate('instrument')
        .populate({
            path: 'user',
            select: 'name image location badges createdAt',
            // select badges to show reputation
        })
        .lean();

    if (!listing) return null;

    return JSON.parse(JSON.stringify(listing));
}

// --- WRITE ---
export async function createListing(data: any) {
    const session = await (await import('@/auth')).auth();
    if (!session) return { success: false, error: 'Unauthorized' };

    await dbConnect();

    // Verify ownership of the collection item
    const item = await UserCollection.findOne({
        _id: data.collectionId,
        userId: session.user.id
    });

    if (!item) return { success: false, error: 'Item not found in your collection' };

    try {
        await MarketListing.create({
            user: session.user.id,
            instrument: item.instrumentId,
            collectionItem: item._id,
            price: data.price,
            condition: data.condition || item.condition, // Default to collection condition
            description: data.description,
            status: 'active'
        });

        const { revalidatePath } = await import('next/cache');
        revalidatePath('/marketplace');
        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}
