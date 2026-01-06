import { getAdminStats, getModerationQueue, getAllSystemConfigs } from '@/actions/admin';
import AdminDashboardClient from '@/components/admin/AdminDashboardClient';
import AdminConfig from '@/components/admin/AdminConfig';
import { ShieldAlert, Users, Ban, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

export default async function AdminPage() {
    const stats = await getAdminStats();
    const queue = await getModerationQueue();
    const configs = await getAllSystemConfigs();

    const statCards = [
        { 
            label: 'Reportes Pendientes', 
            value: stats.reports, 
            icon: ShieldAlert, 
            color: 'ios-red', 
            bg: 'bg-ios-red/10' 
        },
        { 
            label: 'Usuarios Totales', 
            value: stats.users, 
            icon: Users, 
            color: 'ios-blue', 
            bg: 'bg-ios-blue/10' 
        },
        { 
            label: 'Catálogo Maestro', 
            value: stats.instruments, 
            icon: FileText, 
            color: 'ios-indigo', 
            bg: 'bg-ios-indigo/10' 
        },
        { 
            label: 'Usuarios Baneados', 
            value: (stats as any).banned || 0, 
            icon: Ban, 
            color: 'ios-orange', 
            bg: 'bg-ios-orange/10' 
        }
    ];

    return (
        <div className="space-y-12 pb-20">
            
            {/* Header Section */}
            <div className="space-y-2">
                <h1 className="text-4xl font-bold tracking-tight">Estado del Sistema</h1>
                <p className="text-gray-500 dark:text-gray-400 font-medium">Gestión de comunidad, inteligencia y parámetros maestros.</p>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat, idx) => (
                    <div key={idx} className="apple-card p-6 bg-white dark:bg-white/5 flex items-center gap-5 group hover:scale-[1.02]">
                        <div className={cn("p-4 rounded-2xl transition-transform group-hover:rotate-12", stat.bg)}>
                            <stat.icon className={cn("w-6 h-6", `text-${stat.color}`)} />
                        </div>
                        <div>
                            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1.5">{stat.label}</p>
                            <p className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white leading-none">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Moderation Queue Section */}
            <div className="space-y-6">
                <div className="flex items-center gap-3">
                    <ShieldAlert size={20} className="text-ios-red" />
                    <h2 className="text-2xl font-bold tracking-tight">Cola de Moderación</h2>
                    <div className="h-[1px] flex-1 bg-black/5 dark:bg-white/5" />
                </div>
                
                <div className="glass-panel rounded-3xl overflow-hidden shadow-apple-md">
                    <AdminDashboardClient initialQueue={queue} />
                </div>
            </div>

            {/* AI & System Configuration Section */}
            <div className="space-y-6">
                <div className="flex items-center gap-3">
                    <FileText size={20} className="text-ios-blue" />
                    <h2 className="text-2xl font-bold tracking-tight">Configuración Maestra</h2>
                    <div className="h-[1px] flex-1 bg-black/5 dark:bg-white/5" />
                </div>
                <div className="glass-panel rounded-3xl overflow-hidden">
                    <AdminConfig configs={configs} />
                </div>
            </div>
        </div>
    );
}
