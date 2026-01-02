import { getUpcomingMaintenance } from '@/actions/maintenance';
import MaintenanceCalendar from '@/components/maintenance/MaintenanceCalendar';
import { Wrench } from 'lucide-react';

export default async function MaintenancePage() {
    const { success, data } = await getUpcomingMaintenance(50); // Get plenty

    return (
        <div className="p-6 max-w-7xl mx-auto pb-24">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl text-blue-600 dark:text-blue-400">
                        <Wrench size={24} />
                    </div>
                    Mantenimiento
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2 ml-14 max-w-2xl">
                    Mantén tu colección en perfecto estado. Revisa las tareas pendientes y programa nuevos servicios.
                </p>
            </header>

            <MaintenanceCalendar items={data || []} />
        </div>
    );
}
