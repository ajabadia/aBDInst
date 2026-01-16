// src/actions/analytics.ts
import Instrument from '@/models/Instrument';
import UserCollection from '@/models/UserCollection';
import dbConnect from '@/lib/db';
import { auth } from '@/auth';

/**
 * Get overall instrument statistics.
 * Returns total count, breakdown by type, and condition distribution.
 */
export async function getInstrumentStats() {
    const session = await auth();
    if (!session?.user?.id) return { total: 0, byType: [], byCondition: [] };

    await dbConnect();
    const userId = session.user.id;

    const total = await UserCollection.countDocuments({ userId, deletedAt: null, status: 'active' });

    const byType = await UserCollection.aggregate([
        { $match: { userId: (UserCollection as any).base.Types.ObjectId(userId), deletedAt: null, status: 'active' } },
        { $lookup: { from: 'instruments', localField: 'instrumentId', foreignField: '_id', as: 'instrument' } },
        { $unwind: '$instrument' },
        { $group: { _id: '$instrument.type', count: { $sum: 1 } } },
        { $project: { type: '$_id', count: 1, _id: 0 } },
    ]);

    const byCondition = await UserCollection.aggregate([
        { $match: { userId: (UserCollection as any).base.Types.ObjectId(userId), deletedAt: null, status: 'active' } },
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
    const session = await auth();
    if (!session?.user?.id) return [];

    await dbConnect();
    const userId = session.user.id;

    const dateField = '$acquisition.date';
    const format = period === 'monthly' ? { $dateToString: { format: '%Y-%m', date: dateField } } : { $dateToString: { format: '%Y', date: dateField } };

    const pipeline = [
        { $match: { userId: (UserCollection as any).base.Types.ObjectId(userId), deletedAt: null, 'acquisition.price': { $exists: true } } },
        { $group: { _id: format, avgPrice: { $avg: '$acquisition.price' } } },
        { $project: { period: '$_id', avgPrice: { $round: ['$avgPrice', 2] }, _id: 0 } },
        { $sort: { period: 1 as 1 } },
    ];
    const data = await UserCollection.aggregate(pipeline);
    return data;
}

/**
 * Get inventory distribution by location.
 */
export async function getLocationStats() {
    const session = await auth();
    if (!session?.user?.id) return [];

    await dbConnect();
    const userId = session.user.id;

    const data = await UserCollection.aggregate([
        { $match: { userId: (UserCollection as any).base.Types.ObjectId(userId), deletedAt: null, status: 'active' } },
        { $group: { _id: '$location', count: { $sum: 1 } } },
        { $project: { location: '$_id', count: 1, _id: 0 } },
        { $sort: { count: -1 } },
    ]);
    return data;
}
