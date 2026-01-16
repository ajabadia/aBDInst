'use server';

import { auth } from '@/auth';
import dbConnect from '@/lib/db';
import ScrapedListing from '@/models/ScrapedListing';
import Instrument from '@/models/Instrument';
import UserCollection from '@/models/UserCollection';

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
        if (!session?.user?.id) return { success: false, error: 'Unauthorized' };

        await dbConnect();

        // Get user's active instruments with populated instrument data
        const collection = await UserCollection.find({
            userId: session.user.id,
            deletedAt: null,
            'acquisition.price': { $gt: 0 } // Only items with price can be 'movers' in ROI terms
        })
            .populate({
                path: 'instrumentId',
                select: 'brand model marketValue images'
            })
            .lean();

        if (!collection || collection.length === 0) return { success: true, data: [] };

        const movers = collection.map((item: any) => {
            const bought = item.acquisition?.price || 0;
            // Use specific item market value history if available, else master instrument
            const current = item.marketValue?.current || item.instrumentId?.marketValue?.current?.value || bought;

            const diff = current - bought;
            const percent = (diff / bought) * 100;

            return {
                id: item._id.toString(),
                name: `${item.instrumentId?.brand} ${item.instrumentId?.model}`,
                image: item.images?.find((img: any) => img.isPrimary)?.url || item.instrumentId?.images?.[0] || '/placeholder.png',
                bought,
                current,
                diff,
                percent,
                isProfitable: diff >= 0
            };
        });

        // Sort by Absolute Profit Magnitude
        movers.sort((a: any, b: any) => Math.abs(b.percent) - Math.abs(a.percent));

        return {
            success: true,
            data: JSON.parse(JSON.stringify(movers.slice(0, 5)))
        };

    } catch (error: any) {
        console.error('Portfolio Movers Error:', error);
        return { success: false, error: error.message };
    }
}
