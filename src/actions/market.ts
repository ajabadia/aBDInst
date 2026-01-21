'use server';

import dbConnect from '@/lib/db';
import MarketListing from '@/models/MarketListing';
import UserCollection from '@/models/UserCollection';
import Instrument from '@/models/Instrument'; // Populate dependency
import { reverbService } from '@/lib/api/reverb';


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

export async function getMarketInsights(query: string, instrumentId?: string) {
    if (!query) return { listings: [], priceGuide: null, technicalSpecs: null };

    await dbConnect();

    // 1. Check Cache at Instrument Level
    let instrument = null;
    if (instrumentId) {
        instrument = await Instrument.findById(instrumentId).lean();

        // Cache TTL: 12 hours
        const CACHE_TTL = 12 * 60 * 60 * 1000;
        const now = new Date().getTime();
        const lastUpdate = (instrument as any)?.marketValue?.current?.lastUpdated
            ? new Date((instrument as any).marketValue.current.lastUpdated).getTime()
            : 0;

        const CACHE_SUSPICIOUS_PRICE = 10;
        const isSuspicious = (instrument as any).marketValue?.current?.value < CACHE_SUSPICIOUS_PRICE;

        if (instrument && !Array.isArray(instrument) && (now - lastUpdate < CACHE_TTL) && (instrument as any).marketValue?.current?.value && !isSuspicious) {
            console.log(`[MarketInsights] Serving cache for ${query}`);

            // Return cached metrics + standard technical specs
            return JSON.parse(JSON.stringify({
                listings: [], // We don't cache full listings currently to save DB space
                priceGuide: {
                    min: instrument.marketValue.current.min,
                    max: instrument.marketValue.current.max,
                    avg: instrument.marketValue.current.value,
                    currency: instrument.marketValue.current.currency,
                    lastUpdated: instrument.marketValue.current.lastUpdated
                },
                technicalSpecs: (instrument as any).specs
            }));
        }
    }

    console.log(`[MarketInsights] Fetching fresh data for ${query}`);

    // Extract potential Reverb ID from instrument or query
    const reverbUrl = (instrument as any)?.reverbUrl || (query.includes('reverb.com') ? query : null);
    const reverbIdMatch = reverbUrl?.match(/item\/(\d+)/);
    const reverbListingId = reverbIdMatch ? reverbIdMatch[1] : null;

    // 2. Fetch from all market sources via Unified Service
    const { marketIntelligence } = await import('@/lib/api/MarketIntelligenceService');

    // If we have a specific listing ID, we can try to get its product details for better price guide
    let targetedQuery = query;
    if (reverbListingId) {
        const listing = await reverbService.getListingById(reverbListingId);
        if (listing) {
            targetedQuery = `${listing.make} ${listing.model}`;
            console.log(`[MarketInsights] Targeted query from URL: ${targetedQuery}`);
        }
    }

    let [allListings, reverbGuide] = await Promise.all([
        marketIntelligence.fetchAllListings(targetedQuery),
        reverbService.getPriceGuide(targetedQuery)
    ]);

    // Fallback: If no results, try with hyphen/space variation
    if (allListings.length === 0 && !reverbGuide) {
        const hyphenated = query.includes(' ') ? query.replace(' ', '-') : query;
        if (hyphenated !== query) {
            console.log(`[MarketInsights] Retrying with variation: ${hyphenated}`);
            const [fallbackListings, fallbackGuide] = await Promise.all([
                marketIntelligence.fetchAllListings(hyphenated),
                reverbService.getPriceGuide(hyphenated)
            ]);
            if (fallbackListings.length > 0 || fallbackGuide) {
                allListings = fallbackListings;
                reverbGuide = fallbackGuide;
            }
        }
    }

    const metrics = marketIntelligence.calculateMetrics(allListings);

    // 3. Technical specs enrichment logic (if missing)
    let technicalSpecs = (instrument as any)?.specs || null;
    if (instrument && (!(instrument as any).specs || (instrument as any).specs.length === 0)) {
        console.log(`[MarketInsights] Triggering silent deep enrichment for ${query}`);
        const { getDeepEnrichment } = await import('@/actions/enrichment');
        const enrichment = await getDeepEnrichment((instrument as any).brand, (instrument as any).model);

        if (enrichment.success && enrichment.data.specs.length > 0) {
            technicalSpecs = enrichment.data.specs;
            await Instrument.findByIdAndUpdate(instrumentId, {
                $set: {
                    specs: technicalSpecs,
                    description: enrichment.data.description || (instrument as any).description
                }
            });
        }
    }

    // 4. Update the Instrument Cache
    if (instrumentId && metrics) {
        await Instrument.findByIdAndUpdate(instrumentId, {
            $set: {
                'marketValue.current': {
                    value: metrics.avg,
                    min: metrics.min,
                    max: metrics.max,
                    currency: metrics.currency,
                    lastUpdated: new Date(),
                    source: 'Market API'
                }
            },
            $push: {
                'marketValue.history': {
                    date: new Date(),
                    value: metrics.avg,
                    min: metrics.min,
                    max: metrics.max,
                    currency: metrics.currency,
                    source: 'Market API'
                }
            }
        });
    }

    return JSON.parse(JSON.stringify({
        listings: allListings,
        priceGuide: reverbGuide || (metrics ? {
            min: metrics.min,
            max: metrics.max,
            avg: metrics.avg,
            currency: metrics.currency,
            lastUpdated: metrics.lastUpdated
        } : null),
        technicalSpecs: technicalSpecs
    }));
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
