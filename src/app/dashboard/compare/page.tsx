import { auth } from '@/auth';
import { getUserCollection } from '@/actions/collection';
import { redirect } from 'next/navigation';
import CompareClient from '@/components/CompareClient';
import { cleanData } from '@/lib/utils';

export default async function ComparePage() {
    const session = await auth();
    if (!session) redirect('/api/auth/signin');

    // Use existing action that already works correctly
    const rawCollection = await getUserCollection();
    const collection = cleanData(rawCollection);

    // Map instrumentId to instrument for easier access in comparison
    const mappedCollection = collection.map((item: any) => ({
        ...item,
        instrument: item.instrumentId || item.instrument // Support both field names
    }));

    // Filter only active items
    const activeItems = mappedCollection.filter((item: any) => item.status === 'active');

    return (
        <div className="container mx-auto px-6 py-12 max-w-7xl">
            <CompareClient collection={activeItems} />
        </div>
    );
}
