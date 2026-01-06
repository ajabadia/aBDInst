import { auth } from '@/auth';
import { getUserCollection } from '@/actions/inventory'; // Updated
import { getMetadataMap } from '@/actions/catalog'; // Updated
import { redirect } from 'next/navigation';
import { getUserFeed } from '@/actions/community'; // Updated
import { cleanData } from '@/lib/utils';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

export default async function DashboardPage() {
    const session = await auth();
    if (!session) redirect('/login');

    const [rawCollection, feed] = await Promise.all([
        getUserCollection(),
        getUserFeed()
    ]);

    const collection = cleanData(rawCollection);

    return (
        <div className="max-w-7xl mx-auto px-6 py-12 lg:py-20">
            <DashboardLayout
                collection={collection}
                feed={feed.success ? feed.data : []}
                user={session.user}
            />
        </div>
    );
}
