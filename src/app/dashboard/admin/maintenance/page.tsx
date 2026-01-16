import { getSystemConfig } from '@/actions/admin';
import MaintenanceToggle from '@/components/admin/MaintenanceToggle';
import { ShieldAlert, ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export default async function AdminMaintenancePage() {
    const maintenanceMode = await getSystemConfig('maintenance_mode');

    return (
        <div className="max-w-4xl mx-auto px-6 space-y-12 pb-20 pt-10">
            <header className="space-y-4">
                <Link
                    href="/dashboard/admin"
                    className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-ios-blue transition-colors group"
                >
                    <ChevronLeft size={16} className="transition-transform group-hover:-translate-x-1" />
                    Volver al Panel
                </Link>
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-ios-orange text-white rounded-2xl shadow-lg shadow-ios-orange/30">
                        <ShieldAlert size={32} />
                    </div>
                    <div>
                        <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white leading-tight">Modo Mantenimiento</h1>
                        <p className="text-gray-500 dark:text-gray-400 font-medium">Control de acceso global para paradas técnicas.</p>
                    </div>
                </div>
            </header>

            <div className="glass-panel p-8 md:p-12 rounded-[2.5rem] border-black/5 dark:border-white/5 shadow-apple-md">
                <div className="flex flex-col gap-8">
                    <div className="space-y-4">
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Estado del Sistema</h3>
                        <p className="text-base text-gray-500 dark:text-gray-400 leading-relaxed">
                            Al activar el Modo Mantenimiento, el acceso a la plataforma quedará restringido <strong>exclusivamente a Administradores</strong>.
                            El resto de usuarios verá una pantalla de "En Mantenimiento" y no podrá iniciar sesión ni navegar.
                        </p>
                        <div className="bg-ios-orange/10 border border-ios-orange/20 rounded-xl p-4 flex gap-3 items-start">
                            <ShieldAlert className="text-ios-orange shrink-0 mt-0.5" size={18} />
                            <p className="text-sm text-ios-orange font-medium">
                                Esta acción es inmediata y desconectará a los usuarios activos que no sean administradores en su próxima navegación.
                            </p>
                        </div>
                    </div>

                    <div className="h-px bg-black/5 dark:bg-white/5" />

                    <div className="flex items-center justify-between">
                        <span className="text-lg font-semibold text-gray-900 dark:text-white">Activar Bloqueo</span>
                        <MaintenanceToggle initialState={!!maintenanceMode} />
                    </div>
                </div>
            </div>
        </div>
    );
}
