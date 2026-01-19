'use client';

import { useEffect, useState } from 'react';
import { getUsers } from '@/actions/admin';
import { Users, Bot, Tag, MessageSquare, Mail, ShieldAlert, Server, Trophy } from 'lucide-react';
import Link from 'next/link';

export default function AdminPage() {
    const [stats, setStats] = useState({ total: 0 });

    useEffect(() => {
        // Quick fetch for the user count badge
        getUsers(1, 1, '').then(res => {
            if (res.success) {
                setStats({ total: (res as any).total || 0 });
            }
        });
    }, []);

    return (
        <div className="max-w-7xl mx-auto px-6 space-y-12 pb-20 pt-12">
            {/* Header Section */}
            <header className="space-y-2">
                <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white leading-tight">Panel de Administración</h1>
                <p className="text-gray-500 dark:text-gray-400 font-medium text-lg">Centro de control del ecosistema InstrumentCollector.</p>
            </header>

            {/* Launchpad Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                {/* Users Management */}
                <Link href="/dashboard/admin/users" className="col-span-1 md:col-span-2 lg:col-span-1 glass-panel p-8 rounded-[2rem] shadow-apple-sm relative overflow-hidden group border-black/5 dark:border-white/5 hover:border-ios-blue/30 transition-all">
                    <div className="flex flex-col h-full justify-between">
                        <div className="flex items-start justify-between mb-6">
                            <div className="p-4 bg-ios-blue text-white rounded-[1.25rem] shadow-lg shadow-ios-blue/30 transition-transform group-hover:scale-110 duration-500">
                                <Users size={28} />
                            </div>
                            <div className="text-right">
                                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1.5">Total</p>
                                <p className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white leading-none">{stats.total}</p>
                            </div>
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight mb-1">Usuarios</h3>
                            <p className="text-sm text-gray-500 font-medium group-hover:text-ios-blue transition-colors">Gestión de roles y permisos</p>
                        </div>
                    </div>
                </Link>

                {/* AI Config */}
                <Link href="/dashboard/admin/ai" className="glass-panel p-8 rounded-[2rem] shadow-apple-sm group border-black/5 dark:border-white/5 hover:border-ios-indigo/20 transition-all">
                    <div className="flex flex-col h-full justify-between">
                        <div className="p-4 bg-ios-indigo/10 text-ios-indigo w-fit rounded-[1.25rem] group-hover:bg-ios-indigo group-hover:text-white transition-all duration-500 mb-6">
                            <Bot size={28} />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight mb-1">Inteligencia Artificial</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Modelos y Prompts del sistema</p>
                        </div>
                    </div>
                </Link>

                {/* Maintenance */}
                <Link href="/dashboard/admin/maintenance" className="glass-panel p-8 rounded-[2rem] shadow-apple-sm group border-black/5 dark:border-white/5 hover:border-ios-orange/20 transition-all">
                    <div className="flex flex-col h-full justify-between">
                        <div className="p-4 bg-ios-orange/10 text-ios-orange w-fit rounded-[1.25rem] group-hover:bg-ios-orange group-hover:text-white transition-all duration-500 mb-6">
                            <ShieldAlert size={28} />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight mb-1">Mantenimiento</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Bloqueo de acceso global</p>
                        </div>
                    </div>
                </Link>

                {/* Emails & SMTP */}
                <Link href="/dashboard/admin/emails" className="glass-panel p-8 rounded-[2rem] shadow-apple-sm group border-black/5 dark:border-white/5 hover:border-ios-blue/20 transition-all">
                    <div className="flex items-center gap-5 h-full">
                        <div className="p-4 bg-ios-blue/10 text-ios-blue rounded-[1.25rem] group-hover:bg-ios-blue group-hover:text-white transition-all duration-500">
                            <Mail size={28} />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">Comunicaciones</h3>
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-1 group-hover:text-ios-blue transition-colors">Plantillas & SMTP</p>
                        </div>
                    </div>
                </Link>

                {/* Metadata */}
                <div className="glass-panel p-8 rounded-[2rem] shadow-apple-sm relative overflow-hidden border-black/5 dark:border-white/5 group">
                    <div className="flex flex-col h-full justify-between gap-6">
                        <div className="flex items-center gap-5">
                            <div className="p-4 bg-ios-green/10 text-ios-green rounded-[1.25rem] group-hover:bg-ios-green group-hover:text-white transition-all duration-500">
                                <Tag size={28} />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">Arquitectura</h3>
                                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-1 group-hover:text-ios-green transition-colors">Catálogo Maestro</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <Link
                                href="/dashboard/admin/metadata?tab=brand"
                                className="flex items-center justify-center gap-2 py-3 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-ios-blue hover:text-white text-xs font-bold transition-all"
                            >
                                <Tag size={12} /> Marcas
                            </Link>
                            <Link
                                href="/dashboard/admin/metadata?tab=artist"
                                className="flex items-center justify-center gap-2 py-3 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-ios-green hover:text-white text-xs font-bold transition-all"
                            >
                                <Globe size={12} /> Artistas
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Contact Box */}
                <Link href="/dashboard/admin/contacts" className="glass-panel p-8 rounded-[2rem] shadow-apple-sm group border-black/5 dark:border-white/5 hover:border-ios-orange/20 transition-all">
                    <div className="flex items-center gap-5 h-full">
                        <div className="p-4 bg-ios-orange/10 text-ios-orange rounded-[1.25rem] group-hover:bg-ios-orange group-hover:text-white transition-all duration-500">
                            <MessageSquare size={28} />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">Buzón</h3>
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-1 group-hover:text-ios-orange transition-colors">Mensajes de contacto</p>
                        </div>
                    </div>
                </Link>

                {/* Requests Management */}
                <Link href="/dashboard/admin/requests" className="glass-panel p-8 rounded-[2rem] shadow-apple-sm group border-black/5 dark:border-white/5 hover:border-red-500/20 transition-all">
                    <div className="flex items-center gap-5 h-full">
                        <div className="p-4 bg-red-500/10 text-red-500 rounded-[1.25rem] group-hover:bg-red-500 group-hover:text-white transition-all duration-500">
                            <ShieldAlert size={28} />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">Solicitudes</h3>
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-1 group-hover:text-red-500 transition-colors">Aprobación de instrumentos</p>
                        </div>
                    </div>
                </Link>

                {/* Catalog Management */}
                <Link href="/dashboard/admin/catalog" className="glass-panel p-8 rounded-[2rem] shadow-apple-sm group border-black/5 dark:border-white/5 hover:border-blue-500/20 transition-all">
                    <div className="flex items-center gap-5 h-full">
                        <div className="p-4 bg-blue-500/10 text-blue-500 rounded-[1.25rem] group-hover:bg-blue-500 group-hover:text-white transition-all duration-500">
                            <Server size={28} />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">Catálogo</h3>
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-1 group-hover:text-blue-500 transition-colors">Gestión Global</p>
                        </div>
                    </div>
                </Link>



                {/* Exhibitions Management */}
                <Link href="/dashboard/admin/exhibitions" className="glass-panel p-8 rounded-[2rem] shadow-apple-sm group border-black/5 dark:border-white/5 hover:border-purple-500/20 transition-all">
                    <div className="flex items-center gap-5 h-full">
                        <div className="p-4 bg-purple-500/10 text-purple-500 rounded-[1.25rem] group-hover:bg-purple-500 group-hover:text-white transition-all duration-500">
                            <Trophy size={28} />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">Exhibiciones</h3>
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-1 group-hover:text-purple-500 transition-colors">Concursos y Eventos</p>
                        </div>
                    </div>
                </Link>

            </div>
        </div >
    );
}

// ApprovalQueue removed from here as it is now in /requests/page.tsx
