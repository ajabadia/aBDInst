import { auth } from '@/auth';
import { getUserCollection } from '@/actions/inventory'; // Updated
import { getMetadataMap } from '@/actions/catalog'; // Updated
import { redirect } from 'next/navigation';
import { getUserFeed } from '@/actions/community'; // Updated
import { cleanData } from '@/lib/utils';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ condition?: string; location?: string }> }) {
    const session = await auth();
    if (!session) redirect('/login');

    const params = await searchParams;

    const [rawCollection, feed, userFull] = await Promise.all([
        getUserCollection(params.condition, params.location),
        getUserFeed(),
        (await import('@/models/User')).default.findById(session.user?.id).select('badges').lean()
    ]);

    const collection = cleanData(rawCollection);
    const badges = JSON.parse(JSON.stringify(userFull?.badges || []));

    return (
        <div className="max-w-7xl mx-auto px-6 py-12 lg:py-20 space-y-8">
            <div className="md:col-span-12">
                <BadgeCase badges={badges} />
            </div>

            <DashboardLayout
                collection={collection}
                feed={feed.success ? feed.data : []}
                user={session.user}
            />
        </div>
    );
}
import BadgeCase from '@/components/dashboard/BadgeCase';
