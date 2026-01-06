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
    if (!session) redirect('/login');

    const [rawCollection, allTags, feed, financeData] = await Promise.all([
        getUserCollection(),
        getAllUserTags(),
        getUserFeed(),
        getFinanceDashboardData()
    ]);

    const collection = cleanData(rawCollection);

    return (
        <div className="max-w-7xl mx-auto px-6 py-12 lg:py-20">
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
