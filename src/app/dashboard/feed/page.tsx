import { auth } from '@/auth';
import { getUserFeed } from '@/actions/social';
import ActivityFeed from '@/components/social/ActivityFeed';
import { Activity } from 'lucide-react';

export default async function FeedPage() {
    const session = await auth();
    // Assuming protected route by layout middleware or we check here

    const { data: activities, error } = await getUserFeed();

    return (
        <div className="max-w-4xl mx-auto p-6 md:p-10">
            <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-2xl text-blue-600 dark:text-blue-400">
                    <Activity size={32} />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Feed de Actividad</h1>
                    <p className="text-gray-500 dark:text-gray-400">Novedades de la gente que sigues.</p>
                </div>
            </div>

            <ActivityFeed activities={activities || []} />
        </div>
    );
}
