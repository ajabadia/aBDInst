'use server';

import dbConnect from '@/lib/db';
import FeaturedContent from '@/models/FeaturedContent';
import Exhibition from '@/models/Exhibition';
import { auth } from '@/auth';

/**
 * Returns the comprehensive agenda for a given date range.
 * Used by Admin Timeline and Public Agenda.
 */
export async function getTimeline(start: Date, end: Date) {
    await dbConnect();

    const [slots, exhibitions] = await Promise.all([
        FeaturedContent.find({
            startDate: { $lte: end },
            $or: [{ endDate: { $gte: start } }, { endDate: null }]
        }).populate('referenceId', 'title brand model name slug').lean(),

        Exhibition.find({
            startDate: { $lte: end },
            $or: [{ endDate: { $gte: start } }, { endDate: null }]
        }).lean()
    ]);

    return {
        slots: JSON.parse(JSON.stringify(slots)),
        exhibitions: JSON.parse(JSON.stringify(exhibitions))
    };
}

/**
 * Checks if a specific entity (Instrument/Article) is currently active in any special context.
 * Useful for "Anti-Island" integration: Show badges on Detail pages.
 */
export async function getEntityStatus(type: 'Instrument' | 'Article', id: string) {
    await dbConnect();
    const now = new Date();

    // Check Featured Content (Hero/Spotlight)
    const featured = await FeaturedContent.findOne({
        modelType: type,
        referenceId: id,
        active: true,
        startDate: { $lte: now },
        $or: [{ endDate: { $gt: now } }, { endDate: null }]
    }).select('slot startDate endDate').lean();

    // Check Exhibitions (If Instrument)
    let activeExhibitions: any[] = [];
    if (type === 'Instrument') {
        // Find active exhibitions where this instrument is featured (Curated)
        // TODO: Also check User Submissions when that model exists
        activeExhibitions = await Exhibition.find({
            featuredInstruments: id,
            status: 'active',
            startDate: { $lte: now },
            $or: [{ endDate: { $gt: now } }, { endDate: null }]
        }).select('title slug type').lean();
    }

    return {
        isFeatured: !!featured,
        featuredContext: featured ? JSON.parse(JSON.stringify(featured)) : null,
        activeExhibitions: JSON.parse(JSON.stringify(activeExhibitions))
    };
}
