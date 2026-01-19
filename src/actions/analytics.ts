'use server';

import dbConnect from '@/lib/db';
import Instrument from '@/models/Instrument';
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
