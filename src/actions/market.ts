'use server';

import dbConnect from '@/lib/db';
import MarketListing from '@/models/MarketListing';
import UserCollection from '@/models/UserCollection';
import Instrument from '@/models/Instrument'; // Populate dependency

// --- READ ---
// --- READ ---
export async function getMarketListings(filters: any = {}) {
    await dbConnect();

    const query: any = { status: 'active' };

    // Price
    if (filters.minPrice) query.price = { ...query.price, $gte: Number(filters.minPrice) };
    if (filters.maxPrice) query.price = { ...query.price, $lte: Number(filters.maxPrice) };

    // Condition
    if (filters.condition) query.condition = filters.condition;

    // Text Search (Brand/Model)
    if (filters.q) {
        // Find instruments matching query first
        const Instrument = (await import('@/models/Instrument')).default;
        const matchedInstruments = await Instrument.find({
            $or: [
                { brand: { $regex: filters.q, $options: 'i' } },
                { model: { $regex: filters.q, $options: 'i' } }
            ]
        }).select('_id');

        query.instrument = { $in: matchedInstruments };
    }

    const listings = await MarketListing.find(query)
        .sort({ createdAt: -1 })
        .populate('instrument')
        .populate('user', 'name image location badges')
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
