'use server';

import dbConnect from '@/lib/db';
import UserCollection from '@/models/UserCollection';
import { auth } from '@/auth';

export async function getExportData() {
    try {
        const session = await auth();
        if (!session?.user?.id) return null;

        await dbConnect();

        const collection = await UserCollection.find({ userId: session.user.id })
            .populate('instrumentId')
            .lean();

        return JSON.parse(JSON.stringify(collection));
    } catch (error) {
        console.error(error);
        return null;
    }
}
