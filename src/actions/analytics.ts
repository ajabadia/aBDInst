'use server';

import { auth } from '@/auth';
import dbConnect from '@/lib/db';
import ScrapedListing from '@/models/ScrapedListing';
import Instrument from '@/models/Instrument';
import User from '@/models/User';

export async function getMarketTrends(query: string) {
    try {
        const session = await auth();
        if (!session?.user) return { success: false, error: 'Unauthorized' };

        await dbConnect();

        // Fetch scraped listings for this query
        // Sort by date ascending for charts
        const listings = await ScrapedListing.find({
            query: { $regex: query, $options: 'i' },
            price: { $gt: 0 }
        })
            .select('price date source title url')
            .sort({ date: 1 })
            .limit(200); // Limit data points for performance

        // Calculate Trend Line (Simple Moving Average or Linear Regression)
        // For now, let's just return raw points, UI can calculate trend

        return {
            success: true,
            data: JSON.parse(JSON.stringify(listings))
        };

    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function getPortfolioMovers() {
    try {
        const session = await auth();
        if (!session?.user) return { success: false, error: 'Unauthorized' };

        await dbConnect();

        // Get user's collection with instrument details
        const limit = 100; // Analize top 100 instruments

        // This aggregation is complex because user collection is inside User model (usually) 
        // OR we have a separate Collection model. 
        // Based on previous files, it seems we might handle collection in User or separate.
        // Let's assume we fetch standard instruments for now or check User model structure.
        // Wait, 'instrument-collector' usually implies User has a 'collection' field.

        const user = await User.findById(session.user.id).populate({
            path: 'collection.instrument',
            select: 'brand model marketValue images'
        });

        if (!user || !user.collection) return { success: true, data: [] };

        const movers = user.collection.map((item: any) => {
            const bought = item.acquisition?.price || 0;
            const current = item.instrument?.marketValue?.current?.value || bought;
            const openParams = item.instrument?.marketValue?.current;

            if (bought === 0) return null; // Ignore gifts/unknowns for ROI

            const diff = current - bought;
            const percent = (diff / bought) * 100;

            return {
                id: item.instrument?._id,
                name: `${item.instrument?.brand} ${item.instrument?.model}`,
                image: item.instrument?.images?.[0] || '/placeholder.png',
                bought,
                current,
                diff,
                percent,
                isProfitable: diff >= 0
            };
        }).filter(Boolean);

        // Sort by Absolute Profit (or Percent? User said "Top Movers")
        // Let's return sorted by percent magnitude
        movers.sort((a: any, b: any) => Math.abs(b.percent) - Math.abs(a.percent));

        return {
            success: true,
            data: JSON.parse(JSON.stringify(movers.slice(0, 5)))
        };

    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
