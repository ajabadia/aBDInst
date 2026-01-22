'use server';

import dbConnect from '@/lib/db';
import Instrument from '@/models/Instrument';
import PriceHistory from '@/models/PriceHistory';
import { marketIntelligence } from '@/lib/api/MarketIntelligenceService';

/**
 * Weekly Market Synchronization Engine
 * Iterates through instruments and updates their market intelligence stats.
 * To avoid rate limits, it processes instruments in batches.
 */
export async function syncMarketDataBatch(limit: number = 20) {
    await dbConnect();

    // Find instruments that haven't been updated in more than 6 days 
    // or have never been updated.
    const SIX_DAYS_AGO = new Date(Date.now() - 6 * 24 * 60 * 60 * 1000);

    const staleInstruments = await Instrument.find({
        status: 'published',
        $or: [
            { 'marketValue.current.lastUpdated': { $lt: SIX_DAYS_AGO } },
            { 'marketValue.current.lastUpdated': { $exists: false } }
        ]
    }).limit(limit);

    console.log(`[SYNC-MARKET] Starting sync for ${staleInstruments.length} instruments.`);

    const results = [];

    for (const instrument of staleInstruments) {
        const query = `${instrument.brand} ${instrument.model}`;
        console.log(`[SYNC-MARKET] Fetching data for: ${query}`);

        try {
            const allListings = await marketIntelligence.fetchAllListings(query);
            const metrics = marketIntelligence.calculateMetrics(allListings);

            if (metrics) {
                // Update Instrument with latest metrics
                await Instrument.findByIdAndUpdate(instrument._id, {
                    $set: {
                        'marketValue.current': {
                            value: metrics.avg,
                            min: metrics.min,
                            max: metrics.max,
                            currency: metrics.currency,
                            lastUpdated: new Date(),
                            source: 'Weekly Auto-Sync'
                        }
                    },
                    $push: {
                        'marketValue.history': {
                            $each: [{
                                date: new Date(),
                                value: metrics.avg,
                                min: metrics.min,
                                max: metrics.max,
                                currency: metrics.currency,
                                source: 'Weekly Auto-Sync'
                            }],
                            $slice: -20 // Keep last 20 records
                        }
                    }
                });

                // Also record in independent PriceHistory for global analytics
                await PriceHistory.create({
                    instrument: instrument._id,
                    platform: allListings[0]?.source || 'reverb',
                    avgPrice: metrics.avg,
                    minPrice: metrics.min,
                    maxPrice: metrics.max,
                    currency: metrics.currency,
                    listingCount: metrics.count,
                    timestamp: new Date()
                });

                results.push({ id: instrument._id, name: query, success: true });
            } else {
                results.push({ id: instrument._id, name: query, success: false, reason: 'No listings found' });
            }
        } catch (error: any) {
            console.error(`[SYNC-MARKET] Error syncing ${query}:`, error);
            results.push({ id: instrument._id, name: query, success: false, error: error.message });
        }

        // Small delay to prevent hitting API rate limits too hard
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    return {
        success: true,
        processedCount: results.length,
        details: results
    };
}
