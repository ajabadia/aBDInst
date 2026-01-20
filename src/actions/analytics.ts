'use server';

import dbConnect from '@/lib/db';
import Instrument from '@/models/Instrument';
import UserCollection from '@/models/UserCollection';
import ScrapedListing from '@/models/ScrapedListing';
import { auth } from '@/auth';

/**
 * Get distribution of instruments by a specific criteria
 */
export async function getInstrumentDistribution(criteria: 'brand' | 'type' | 'artist' | 'decade') {
    try {
        const session = await auth();
        if (!session || !['admin', 'editor'].includes((session.user as any).role)) {
            throw new Error('Unauthorized');
        }

        await dbConnect();

        let pipeline: any[] = [];

        switch (criteria) {
            case 'brand':
                pipeline = [
                    { $group: { _id: "$brand", count: { $sum: 1 } } },
                    { $sort: { count: -1 } }
                ];
                break;
            case 'type':
                pipeline = [
                    { $group: { _id: "$type", count: { $sum: 1 } } },
                    { $sort: { count: -1 } }
                ];
                break;
            case 'artist':
                pipeline = [
                    { $unwind: "$artists" },
                    { $group: { _id: "$artists.name", count: { $sum: 1 } } },
                    { $sort: { count: -1 } }
                ];
                break;
            case 'decade':
                pipeline = [
                    { $unwind: "$years" },
                    {
                        $project: {
                            decade: {
                                $concat: [
                                    { $substr: ["$years", 0, 3] },
                                    "0s"
                                ]
                            }
                        }
                    },
                    { $group: { _id: "$decade", count: { $sum: 1 } } },
                    { $sort: { _id: 1 } }
                ];
                break;
        }

        const results = await Instrument.aggregate(pipeline);
        return results.map(r => ({ label: r._id, count: r.count }));
    } catch (error) {
        console.error(`Error fetching distribution for ${criteria}:`, error);
        return [];
    }
}

/**
 * Get overview stats for the entire catalog
 */
export async function getCatalogOverview() {
    try {
        const session = await auth();
        if (!session || !['admin', 'editor'].includes((session.user as any).role)) {
            throw new Error('Unauthorized');
        }

        await dbConnect();

        const totalInstruments = await Instrument.countDocuments();
        const brandsCount = (await Instrument.distinct('brand')).length;
        const typesCount = (await Instrument.distinct('type')).length;
        const artistsCountResult = await Instrument.aggregate([
            { $unwind: "$artists" },
            { $group: { _id: "$artists.name" } },
            { $count: "total" }
        ]);

        return {
            totalInstruments,
            totalBrands: brandsCount,
            totalTypes: typesCount,
            totalArtists: artistsCountResult[0]?.total || 0,
        };
    } catch (error) {
        console.error('Error fetching catalog overview:', error);
        return null;
    }
}

/**
 * Get market trends based on a search query (Scraped Listings)
 */
export async function getMarketTrends(query: string) {
    try {
        await dbConnect();

        // Find recent scraped listings for this query
        const listings = await ScrapedListing.find({
            $or: [
                { query: { $regex: query, $options: 'i' } },
                { title: { $regex: query, $options: 'i' } }
            ]
        }).sort({ date: -1 }).limit(100);

        return {
            success: true,
            data: listings.map(l => ({
                id: l._id.toString(),
                price: l.price,
                currency: l.currency,
                title: l.title,
                date: l.date.toISOString(),
                source: l.source,
                url: l.url,
                condition: l.condition,
                location: l.location,
                imageUrl: l.imageUrl
            }))
        };
    } catch (error: any) {
        console.error('getMarketTrends Error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Get user's portfolio movers (ROI based on acquisition vs current market value)
 */
export async function getPortfolioMovers() {
    try {
        const session = await auth();
        if (!session || !session.user) throw new Error('Unauthorized');

        await dbConnect();

        const userId = (session.user as any).id;

        // Get active items with acquisition price and current market value
        const collection = await UserCollection.find({
            userId,
            status: 'active',
            'acquisition.price': { $exists: true, $gt: 0 },
            'marketValue.current': { $exists: true, $gt: 0 }
        }).populate('instrumentId');

        const movers = collection.map(item => {
            const bought = item.acquisition?.price || 0;
            const current = item.marketValue?.current || 0;
            const instrument = item.instrumentId as any;

            const diff = current - bought;
            const percent = (diff / bought) * 100;

            return {
                id: item._id.toString(),
                name: `${instrument.brand} ${instrument.model}`,
                image: item.images?.[0]?.url || instrument.genericImages?.[0] || '/instrument-placeholder.png',
                bought,
                current,
                percent,
                isProfitable: diff >= 0
            };
        }).sort((a, b) => Math.abs(b.percent) - Math.abs(a.percent)).slice(0, 5);

        return { success: true, data: movers };
    } catch (error: any) {
        console.error('getPortfolioMovers Error:', error);
        return { success: false, error: error.message };
    }
}
