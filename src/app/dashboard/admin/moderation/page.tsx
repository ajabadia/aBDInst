import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { getModerationQueue, moderateComment, banUser } from '@/actions/comments';
import ModerationList from '@/components/admin/ModerationList';
import { Shield, AlertTriangle, CheckCircle } from 'lucide-react';

export default async function ModerationPage() {
    const session = await auth();
    if ((session?.user as any)?.role !== 'admin') {
        redirect('/dashboard');
    }

    const { data: queue } = await getModerationQueue();

    return (
        <div className="max-w-5xl mx-auto p-6">
            <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-xl text-red-600 dark:text-red-400">
                    <Shield size={32} />
                </div>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Moderación</h1>
                    <p className="text-gray-500 dark:text-gray-400">Revisa reportes y gestiona la seguridad de la comunidad.</p>
                </div>
            </div>

            {queue && queue.length > 0 ? (
                <div className="space-y-6">
                    <ModerationList items={queue} />
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center p-12 text-center bg-green-50 dark:bg-green-900/10 rounded-3xl border border-green-100 dark:border-green-800">
                    <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
                    <h3 className="text-xl font-bold text-green-700 dark:text-green-400">Todo limpio</h3>
                    <p className="text-green-600/80 dark:text-green-400/80">No hay reportes pendientes de revisión.</p>
                </div>
            )}
        </div>
    );
}
