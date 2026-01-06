import { Wrench } from 'lucide-react';

export default function MaintenancePage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4">
            <div className="max-w-md w-full text-center space-y-8">
                <div className="mx-auto w-24 h-24 rounded-full bg-ios-blue/10 flex items-center justify-center mb-6 animate-pulse">
                    <Wrench className="w-10 h-10 text-ios-blue" />
                </div>

                <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
                    Mantenimiento Programado
                </h1>

                <div className="space-y-4">
                    <p className="text-lg text-gray-600 dark:text-gray-400">
                        Estamos realizando mejoras en la plataforma.
                    </p>
                    <p className="text-sm text-gray-500">
                        El acceso está temporalmente restringido para usuarios. Los administradores pueden iniciar sesión normalmente.
                    </p>
                </div>

                <div className="pt-8 flex justify-center gap-4 text-sm text-gray-400">
                    <span>Instrument Collector</span>
                    <span>•</span>
                    <span>System Status: Upgrade</span>
                </div>
            </div>
        </div>
    );
}
