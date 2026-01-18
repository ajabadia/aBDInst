'use client';

import { useSession } from 'next-auth/react';
import Image from 'next/image';
import TrophyCase from '@/components/gamification/TrophyCase';
import { Settings, Share2, MapPin, Calendar, Music } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function ProfilePage() {
    const { data: session } = useSession();

    if (!session) return null;

    const user = session.user;

    return (
        <div className="max-w-5xl mx-auto px-6 py-12 space-y-12">

            {/* Header / Identity Card */}
            <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                <div className="relative w-32 h-32 md:w-40 md:h-40 shrink-0">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 blur-lg opacity-50" />
                    <div className="relative w-full h-full rounded-full overflow-hidden border-4 border-white dark:border-black shadow-xl bg-gray-200">
                        {user.image ? (
                            <Image src={user.image} fill className="object-cover" alt={user.name || 'User'} />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-gray-400 bg-gray-100">
                                {user.name?.[0]}
                            </div>
                        )}
                    </div>
                    <div className="absolute bottom-2 right-2 w-8 h-8 bg-black dark:bg-white rounded-full flex items-center justify-center text-white dark:text-black border-2 border-white dark:border-black shadow-lg">
                        <span className="text-xs font-bold">LV1</span>
                    </div>
                </div>

                <div className="flex-1 text-center md:text-left space-y-4">
                    <div>
                        <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
                            {user.name}
                        </h1>
                        <p className="text-lg text-gray-500 dark:text-gray-400 font-medium">
                            {user.email}
                        </p>
                    </div>

                    <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1.5 bg-gray-100 dark:bg-white/5 px-3 py-1.5 rounded-full">
                            <MapPin size={14} />
                            <span>Planeta Tierra</span>
                        </div>
                        <div className="flex items-center gap-1.5 bg-gray-100 dark:bg-white/5 px-3 py-1.5 rounded-full">
                            <Calendar size={14} />
                            <span>Miembro desde 2024</span>
                        </div>
                    </div>

                    <div className="flex justify-center md:justify-start gap-3 pt-2">
                        <Button variant="outline" className="rounded-full">
                            <Settings size={16} className="mr-2" /> Editar Perfil
                        </Button>
                        <Button variant="ghost" className="rounded-full w-10 h-10 p-0">
                            <Share2 size={18} />
                        </Button>
                    </div>
                </div>
            </div>

            <div className="h-px bg-gray-200 dark:bg-white/10" />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">

                {/* Main Content: Trophies */}
                <div className="md:col-span-2 space-y-8">
                    <div>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold flex items-center gap-3">
                                <span className="p-2 bg-yellow-100 text-yellow-600 rounded-lg">
                                    <Trophy size={20} />
                                </span>
                                Sala de Trofeos
                            </h2>
                            {/* <span className="text-sm text-gray-400">3 / 12 Desbloqueados</span> */}
                        </div>

                        <div className="bg-white dark:bg-black/20 rounded-[2rem] p-6 shadow-sm border border-gray-100 dark:border-white/5">
                            <TrophyCase userId={user.id!} />
                        </div>
                    </div>

                    {/* Potentially Activity Feed or Exhibition History here later */}
                </div>

                {/* Sidebar: Stats */}
                <div className="space-y-6">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Estadísticas</h3>

                    <div className="space-y-3">
                        <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-900/10 flex items-center justify-between border border-blue-100 dark:border-blue-900/20">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-500 text-white rounded-lg">
                                    <Music size={18} />
                                </div>
                                <span className="font-medium text-gray-700 dark:text-gray-300">Instrumentos</span>
                            </div>
                            <span className="text-xl font-bold text-blue-600 dark:text-blue-400">--</span>
                            {/* Fetch count logic to be added or passed */}
                        </div>

                        <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-900/10 flex items-center justify-between border border-purple-100 dark:border-purple-900/20">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-purple-500 text-white rounded-lg">
                                    <Trophy size={18} />
                                </div>
                                <span className="font-medium text-gray-700 dark:text-gray-300">Puntos</span>
                            </div>
                            <span className="text-xl font-bold text-purple-600 dark:text-purple-400">--</span>
                        </div>
                    </div>

                    <div className="p-6 rounded-2xl bg-gradient-to-br from-gray-900 to-gray-800 text-white mt-8">
                        <h4 className="font-bold mb-2">Próximo Nivel</h4>
                        <div className="w-full bg-white/20 h-2 rounded-full mb-2 overflow-hidden">
                            <div className="bg-green-400 h-full w-[0%]" />
                            {/* Progress logic pending */}
                        </div>
                        <p className="text-xs text-gray-400">Sube 3 instrumentos más para alcanzar el Nivel 2</p>
                    </div>
                </div>

            </div>
        </div>
    );
}
