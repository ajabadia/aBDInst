import { auth } from '@/auth';
import { getUserCollection } from '@/actions/collection';
import { getAllUserTags } from '@/actions/tags';
import { redirect } from 'next/navigation';
import { getUserFeed } from '@/actions/social';
import { getFinanceDashboardData } from '@/actions/finance';
import { cleanData } from '@/lib/utils';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

export default async function DashboardPage() {
    const session = await auth();
    if (!session) redirect('/api/auth/signin');

    const rawCollection = await getUserCollection();
    const collection = cleanData(rawCollection);
    const allTags = await getAllUserTags();
    const feed = await getUserFeed();
    const financeData = await getFinanceDashboardData();

    return (
        <div className="container mx-auto px-4 py-6 max-w-7xl">
            <DashboardLayout
                collection={collection}
                tags={allTags}
                feed={feed.success ? feed.data : []}
                finance={financeData}
                user={session.user}
            />
        </div>
    );
}

