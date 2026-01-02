import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import UserSettingsForm from '@/components/UserSettingsForm';
import { Settings, Cloud, User as UserIcon, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default async function SettingsPage() {
    const session = await auth();
    if (!session?.user?.id) {
        redirect('/login');
    }

    await dbConnect();
    const user = await User.findById(session.user.id).lean();

    if (!user) {
        redirect('/login');
    }

    // Convert MongoDB objects to plain JS for the client component
    const sanitizedUser = JSON.parse(JSON.stringify(user));

    return (
        <div className="container mx-auto px-6 py-12 max-w-6xl">
            <div className="flex items-center gap-4 mb-12">
                <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-900 dark:text-white">
                    <Settings size={28} />
                </div>
                <div>
                    <h1 className="text-4xl font-bold tracking-tight">Ajustes</h1>
                    <p className="text-gray-500">Gestiona tu cuenta y preferencias</p>
                </div>
            </div>

            {/* Navigation Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                {/* Profile Settings */}
                <div className="bg-white/40 dark:bg-black/20 backdrop-blur-md rounded-[2rem] border border-gray-200/50 dark:border-white/10 p-6 hover:border-blue-200 dark:hover:border-blue-900/50 transition-all">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600">
                            <UserIcon size={20} />
                        </div>
                        <h3 className="font-bold text-lg">Perfil</h3>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        Actualiza tu información personal y preferencias de cuenta
                    </p>
                    <div className="text-sm text-gray-500">
                        Configuración actual en esta página ↓
                    </div>
                </div>

                {/* Storage Settings */}
                <Link href="/dashboard/settings/storage">
                    <div className="bg-white/40 dark:bg-black/20 backdrop-blur-md rounded-[2rem] border border-gray-200/50 dark:border-white/10 p-6 hover:border-blue-200 dark:hover:border-blue-900/50 transition-all cursor-pointer group">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center text-purple-600">
                                    <Cloud size={20} />
                                </div>
                                <h3 className="font-bold text-lg">Almacenamiento</h3>
                            </div>
                            <ChevronRight className="text-gray-400 group-hover:text-blue-600 transition-colors" size={20} />
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                            Configura dónde se guardarán las fotos de tu colección
                        </p>
                        <div className="text-sm font-medium text-blue-600 dark:text-blue-400">
                            Cloudinary • Google Drive • Dropbox • Terabox →
                        </div>
                    </div>
                </Link>
            </div>

            {/* User Settings Form */}
            <div className="bg-white/40 dark:bg-black/20 backdrop-blur-md rounded-[2rem] border border-gray-200/50 dark:border-white/10 p-8">
                <h2 className="text-2xl font-bold mb-6">Información Personal</h2>
                <UserSettingsForm user={sanitizedUser} />
            </div>
        </div>
    );
}
