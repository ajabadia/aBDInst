import { getUpcomingMaintenance } from '@/actions/maintenance';
import MaintenanceCalendar from '@/components/maintenance/MaintenanceCalendar';
import { Wrench, Calendar, Bell } from 'lucide-react';
import { cn } from '@/lib/utils';

export default async function MaintenancePage() {
    const { success, data } = await getUpcomingMaintenance(50);
    const maintenanceItems = data || [];
    
    // Stats for the header
    const pendingCount = maintenanceItems.filter((i: any) => new Date(i.date) >= new Date()).length;

    return (
        <div className="max-w-7xl mx-auto px-6 py-12 lg:py-20">
            {/* Apple Style Header with Stats */}
            <header className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-ios-orange/10 text-ios-orange rounded-xl shadow-sm">
                            <Wrench className="w-6 h-6" />
                        </div>
                        <h1 className="text-4xl font-bold tracking-tight">Mantenimiento</h1>
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 font-medium ml-1">
                        Gestiona el cuidado técnico de tu colección y programa revisiones.
                    </p>
                </div>

                <div className="flex gap-4">
                    <div className="glass-panel px-6 py-3 rounded-2xl border-black/5 flex items-center gap-4">
                        <Calendar size={20} className="text-ios-blue" />
                        <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Pendientes</p>
                            <p className="text-xl font-bold leading-none">{pendingCount}</p>
                        </div>
                    </div>
                </div>
            </header>

            <div className="glass-panel rounded-[2rem] overflow-hidden shadow-apple-lg border-black/5">
                <MaintenanceCalendar items={maintenanceItems} />
            </div>
        </div>
    );
}
