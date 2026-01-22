'use server';

import dbConnect from '@/lib/db';
import UserCollection from '@/models/UserCollection';
import { auth } from '@/auth';

/**
 * Generates a structured summary for insurance purposes.
 * This can be used to render a PDF or a professional HTML view.
 */
export async function generateInsuranceSummary() {
    const session = await auth();
    if (!session?.user?.id) throw new Error('Unauthorized');

    await dbConnect();
    const items = await UserCollection.find({
        userId: session.user.id,
        deletedAt: null
    }).populate('instrumentId').lean();

    const totalAcquisitionValue = items.reduce((sum: number, item: any) => sum + (item.acquisition?.price || 0), 0);
    const totalEstimatedMarketValue = items.reduce((sum: number, item: any) => {
        // Use instrument's current market value if available
        const mVal = item.instrumentId?.marketValue?.current?.value || item.acquisition?.price || 0;
        return sum + mVal;
    }, 0);

    const reportData = {
        owner: session.user.name,
        date: new Date().toLocaleDateString(),
        stats: {
            itemCount: items.length,
            totalAcquisitionValue,
            totalEstimatedMarketValue,
            currency: 'EUR'
        },
        items: items.map((item: any) => ({
            brand: item.instrumentId?.brand,
            model: item.instrumentId?.model,
            serialNumber: item.serialNumber,
            condition: item.condition,
            acquisitionPrice: item.acquisition?.price,
            estimatedValue: item.instrumentId?.marketValue?.current?.value || item.acquisition?.price,
            primaryImage: item.images?.find((img: any) => img.isPrimary)?.url || item.instrumentId?.genericImages?.[0]
        }))
    };

    return reportData;
}
