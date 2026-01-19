import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import MusicDashboard from '@/components/dashboard/music/MusicDashboard';
import { getUserMusicCollection } from '@/actions/music';

export default async function MusicDashboardPage() {
    const session = await auth();
    if (!session) redirect('/login');

    const collection = await getUserMusicCollection();

    return (
        <div className="max-w-7xl mx-auto px-6 py-12 lg:py-20">
            <MusicDashboard
                collection={collection}
                user={session.user}
            />
        </div>
    );
}
