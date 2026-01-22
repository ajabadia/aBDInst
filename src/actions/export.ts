'use server';

import dbConnect from '@/lib/db';
import UserCollection from '@/models/UserCollection';
import { auth } from '@/auth';

/**
 * Generates a CSV string of the user's collection.
 */
export async function getCollectionExportCSV() {
    const session = await auth();
    if (!session?.user?.id) throw new Error('Unauthorized');

    await dbConnect();
    const items = await UserCollection.find({
        userId: session.user.id,
        deletedAt: null
    }).populate('instrumentId').lean();

    const headers = [
        'Brand',
        'Model',
        'Type',
        'Serial Number',
        'Condition',
        'Acquisition Price',
        'Acquisition Date',
        'Location',
        'Status'
    ];

    const rows = items.map((item: any) => {
        const inst = item.instrumentId;
        return [
            `"${inst?.brand || ''}"`,
            `"${inst?.model || ''}"`,
            `"${inst?.type || ''}"`,
            `"${item.serialNumber || ''}"`,
            `"${item.condition || ''}"`,
            item.acquisition?.price || 0,
            item.acquisition?.date ? new Date(item.acquisition.date).toLocaleDateString() : '',
            `"${item.location || ''}"`,
            `"${item.status || ''}"`
        ].join(',');
    });

    return [headers.join(','), ...rows].join('\n');
}

/**
 * Generates a JSON string of the full user collection data.
 */
export async function getCollectionExportJSON() {
    const session = await auth();
    if (!session?.user?.id) throw new Error('Unauthorized');

    await dbConnect();
    const items = await UserCollection.find({
        userId: session.user.id,
        deletedAt: null
    }).populate('instrumentId').lean();

    return JSON.stringify(items, null, 2);
}
