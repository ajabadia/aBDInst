import { getSystemConfig } from '@/actions/admin';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, Settings as SettingsIcon, ShieldAlert } from 'lucide-react';
import MaintenanceToggle from '@/components/admin/MaintenanceToggle';

export default async function AdminSettingsPage() {
    const maintenanceMode = await getSystemConfig('maintenance_mode');

    return (
        <div className="max-w-7xl mx-auto px-6 py-12 lg:py-20 space-y-12">
            
            {/* Header Section */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div className="space-y-2">
                    <Link href="/dashboard/admin" className="inline-flex items-center text-sm font-semibold text-ios-blue hover:underline mb-4 group">
                        <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
                        Panel de Administración
                    </Link>
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-ios-gray/10 text-ios-gray rounded-xl shadow-sm">
                            <SettingsIcon className="w-6 h-6" />
                        </div>
                        <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white">Configuración del Sistema</h1>
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 font-medium ml-1">
                        Control global de accesos, estados y parámetros de red de la plataforma.
                    </p>
                </div>
            </header>

            {/* Settings Panels */}
            <div className="space-y-8">
                <div className="glass-panel p-8 md:p-10 rounded-[2.5rem] border-black/5 dark:border-white/5 shadow-apple-sm">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                        <div className="flex items-start gap-5">
                            <div className="p-3 bg-ios-orange/10 text-ios-orange rounded-2xl shrink-0">
                                <ShieldAlert size={24} />
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">Modo Mantenimiento</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xl font-medium leading-relaxed">
                                    Al activar esta función, solo las cuentas con privilegios de Administrador podrán interactuar con la plataforma. 
                                    El resto de usuarios verán una pantalla de servicio técnico.
                                </p>
                            </div>
                        </div>
                        
                        <div className="shrink-0 pt-2 sm:pt-0">
                            <MaintenanceToggle initialState={!!maintenanceMode} />
                        </div>
                    </div>
                </div>

                {/* Information Callout */}
                <div className="bg-ios-blue/5 border border-ios-blue/10 rounded-2xl p-6 text-center">
                    <p className="text-xs text-ios-blue font-bold uppercase tracking-[0.2em]">
                        Seguridad del Sistema • Los cambios son instantáneos
                    </p>
                </div>
            </div>
        </div>
    );
}
