import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import UserSettingsForm from '@/components/UserSettingsForm';
import { Settings, Cloud, User as UserIcon, ChevronRight, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default async function SettingsPage() {
    const session = await auth();
    if (!session?.user?.id) {
        redirect('/login');
    }

    await dbConnect();
    const userResult = await User.findById(session.user.id).lean();

    if (!userResult) {
        redirect('/login');
    }

    const user = userResult && (Array.isArray(userResult) ? userResult[0] : userResult);
    const sanitizedUser = JSON.parse(JSON.stringify(user));

    return (
        <div className="max-w-7xl mx-auto px-6 py-12 lg:py-20 space-y-12">
            {/* Header Section */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-ios-gray/10 text-ios-gray rounded-xl shadow-sm">
                            <Settings className="w-6 h-6" />
                        </div>
                        <h1 className="text-4xl font-bold tracking-tight">Ajustes</h1>
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 font-medium ml-1">
                        Gestiona tu identidad, preferencias y conectividad del sistema.
                    </p>
                </div>
            </header>

            {/* Navigation Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Profile Settings (Current) */}
                <div className="glass-panel rounded-[2rem] p-8 border-ios-blue/20 bg-ios-blue/[0.02]">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-ios-blue/10 text-ios-blue flex items-center justify-center">
                            <UserIcon size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold tracking-tight">Perfil Personal</h3>
                            <p className="text-xs text-ios-blue font-bold uppercase tracking-wider">Configuración Activa</p>
                        </div>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed font-medium">
                        Actualiza tu biografía, ubicación y foto de perfil para la comunidad.
                    </p>
                </div>

                {/* Storage Settings (Link) */}
                <Link href="/dashboard/settings/storage" className="group">
                    <div className="glass-panel rounded-[2rem] p-8 h-full transition-all group-hover:border-ios-indigo/30 group-hover:bg-ios-indigo/[0.02]">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-ios-indigo/10 text-ios-indigo flex items-center justify-center group-hover:bg-ios-indigo group-hover:text-white transition-all duration-500">
                                    <Cloud size={24} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold tracking-tight">Almacenamiento</h3>
                                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Nube & Archivos</p>
                                </div>
                            </div>
                            <ChevronRight className="text-gray-300 group-hover:text-ios-indigo group-hover:translate-x-1 transition-all" size={24} />
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed font-medium">
                            Conecta tus cuentas de Cloudinary, Drive o Dropbox para guardar tus fotos.
                        </p>
                    </div>
                </Link>


            </div>

            {/* User Settings Form - Integrated Panel */}
            <section className="space-y-6">
                <div className="flex items-center gap-3 px-2">
                    <ShieldCheck size={20} className="text-ios-blue" />
                    <h2 className="text-2xl font-bold tracking-tight">Información de la Cuenta</h2>
                    <div className="h-[1px] flex-1 bg-black/5 dark:bg-white/5" />
                </div>

                <div className="glass-panel rounded-[2.5rem] p-8 md:p-12 shadow-apple-lg border-black/5 dark:border-white/5">
                    <UserSettingsForm user={sanitizedUser} />
                </div>
            </section>
        </div>
    );
}
