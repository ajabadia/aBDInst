import { getAdminStats, getModerationQueue, getAllSystemConfigs } from '@/actions/admin';
import AdminDashboardClient from '@/components/admin/AdminDashboardClient';
import AdminConfig from '@/components/admin/AdminConfig';
import { ShieldAlert, Users, Ban, FileText } from 'lucide-react';

export default async function AdminPage() {
    const statsData = await getAdminStats();
    const queueData = await getModerationQueue();
    const configData = await getAllSystemConfigs();

    const stats = statsData;
    const queue = queueData;
    const configs = configData;

    return (
        <div className="space-y-8">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-red-100 text-red-600 rounded-lg">
                        <ShieldAlert size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Reportes Pendientes</p>
                        <p className="text-2xl font-bold">{stats.reports}</p>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-gray-100 text-gray-600 rounded-lg">
                        <Users size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Usuarios Totales</p>
                        <p className="text-2xl font-bold">{stats.users}</p>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-gray-100 text-gray-600 rounded-lg">
                        <FileText size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Instrumentos</p>
                        <p className="text-2xl font-bold">{stats.instruments}</p>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-orange-100 text-orange-600 rounded-lg">
                        <Ban size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Usuarios Baneados</p>
                        <p className="text-2xl font-bold">{(stats as any).banned || 0}</p>
                    </div>
                </div>
            </div>

            {/* Moderation Queue Client Component */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">Cola de Moderación</h2>
                    <p className="text-sm text-gray-500">Comentarios y usuarios reportados que requieren atención.</p>
                </div>
                <AdminDashboardClient
                    initialQueue={queue}
                />
            </div>

            {/* AI Configuration */}
            <AdminConfig configs={configs} />
        </div>
    );
}
