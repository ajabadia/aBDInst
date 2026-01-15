// src/actions/analytics.ts
import Instrument from '@/models/Instrument';
import dbConnect from '@/lib/db';

/**
 * Get overall instrument statistics.
 * Returns total count, breakdown by type, and condition distribution.
 */
export async function getInstrumentStats() {
    await dbConnect();
    const total = await Instrument.countDocuments();
    const byType = await Instrument.aggregate([
        { $group: { _id: '$type', count: { $sum: 1 } } },
        { $project: { type: '$_id', count: 1, _id: 0 } },
    ]);
    const byCondition = await Instrument.aggregate([
        { $group: { _id: '$condition', count: { $sum: 1 } } },
        { $project: { condition: '$_id', count: 1, _id: 0 } },
    ]);
    return { total, byType, byCondition };
}

/**
 * Get average price trend over time.
 * `period` can be 'monthly' or 'yearly'. Returns array of { period, avgPrice }.
 */
export async function getPriceTrends(period: 'monthly' | 'yearly' = 'monthly') {
    await dbConnect();
    const dateField = '$acquisition.date'; // assuming acquisition.date stored as ISO string
    const format = period === 'monthly' ? { $dateToString: { format: '%Y-%m', date: dateField } } : { $dateToString: { format: '%Y', date: dateField } };
    const pipeline = [
        { $match: { 'acquisition.price': { $exists: true } } },
        { $group: { _id: format, avgPrice: { $avg: '$acquisition.price' } } },
        { $project: { period: '$_id', avgPrice: { $round: ['$avgPrice', 2] }, _id: 0 } },
        { $sort: { period: 1 } },
    ];
    const data = await Instrument.aggregate(pipeline);
    return data;
}

/**
 * Get inventory distribution by location.
 */
export async function getLocationStats() {
    await dbConnect();
    const data = await Instrument.aggregate([
        { $group: { _id: '$location', count: { $sum: 1 } } },
        { $project: { location: '$_id', count: 1, _id: 0 } },
        { $sort: { count: -1 } },
    ]);
    return data;
}
