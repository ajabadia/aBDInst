'use client';

import { useEffect, useState } from 'react';
import { getUsers } from '@/actions/admin';
import UserTable from '@/components/admin/UserTable';
import { Users, Search, Bot, Tag, ChevronLeft, ChevronRight, MessageSquare, Mail } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function AdminPage() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ total: 0, admins: 0, banned: 0 });
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);

    const fetchUsers = async () => {
        setLoading(true);
        const res = await getUsers(page, 20, search);
        if (res.success) {
            setUsers(res.users);
            setStats(prev => ({ ...prev, total: (res as any).total || 0 }));
        } else {
            toast.error(res.error);
        }
        setLoading(false);
    };

    useEffect(() => {
        const timeout = setTimeout(() => {
            fetchUsers();
        }, 300);
        return () => clearTimeout(timeout);
    }, [search, page]);

    return (
        <div className="max-w-7xl mx-auto px-6 space-y-12 pb-20">
            {/* Header Section */}
            <header className="space-y-2">
                <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white leading-tight">Panel de Administración</h1>
                <p className="text-gray-500 dark:text-gray-400 font-medium text-lg">Gestión de usuarios y permisos maestros del ecosistema.</p>
            </header>

            {/* Main Action Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* User Count Stat */}
                <div className="glass-panel p-8 rounded-[2rem] shadow-apple-sm relative overflow-hidden group border-black/5 dark:border-white/5">
                    <div className="flex items-center gap-5">
                        <div className="p-4 bg-ios-blue text-white rounded-[1.25rem] shadow-lg shadow-ios-blue/30 transition-transform group-hover:scale-110 duration-500">
                            <Users size={28} />
                        </div>
                        <div>
                            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1.5">Usuarios Totales</p>
                            <p className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white leading-none">{stats.total}</p>
                        </div>
                    </div>
                </div>

                {/* AI Config Link Card */}
                <Link href="/dashboard/admin/ai" className="glass-panel p-8 rounded-[2rem] shadow-apple-sm group border-black/5 dark:border-white/5 hover:border-ios-indigo/20 transition-all">
                    <div className="flex items-center gap-5 h-full">
                        <div className="p-4 bg-ios-indigo/10 text-ios-indigo rounded-[1.25rem] group-hover:bg-ios-indigo group-hover:text-white transition-all duration-500">
                            <Bot size={28} />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">Configuración IA</h3>
                            <p className="text-xs text-ios-indigo font-bold uppercase tracking-wider mt-1 opacity-70 group-hover:opacity-100 transition-opacity">Modelos & Prompts</p>
                        </div>
                    </div>
                </Link>

                {/* Metadata Link Card */}
                <Link href="/dashboard/admin/metadata" className="glass-panel p-8 rounded-[2rem] shadow-apple-sm group border-black/5 dark:border-white/5 hover:border-ios-green/20 transition-all">
                    <div className="flex items-center gap-5 h-full">
                        <div className="p-4 bg-ios-green/10 text-ios-green rounded-[1.25rem] group-hover:bg-ios-green group-hover:text-white transition-all duration-500">
                            <Tag size={28} />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">Arquitectura</h3>
                            <p className="text-xs text-ios-green font-bold uppercase tracking-wider mt-1 opacity-70 group-hover:opacity-100 transition-opacity">Marcas & Categorías</p>
                        </div>
                    </div>
                </Link>

                {/* Contacts Link Card */}
                <Link href="/dashboard/admin/contacts" className="glass-panel p-8 rounded-[2rem] shadow-apple-sm group border-black/5 dark:border-white/5 hover:border-ios-orange/20 transition-all">
                    <div className="flex items-center gap-5 h-full">
                        <div className="p-4 bg-ios-orange/10 text-ios-orange rounded-[1.25rem] group-hover:bg-ios-orange group-hover:text-white transition-all duration-500">
                            <MessageSquare size={28} />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">Buzón</h3>
                            <p className="text-xs text-ios-orange font-bold uppercase tracking-wider mt-1 opacity-70 group-hover:opacity-100 transition-opacity">Mensajes & Soporte</p>
                        </div>
                    </div>
                </Link>

                {/* Emails Link Card */}
                <Link href="/dashboard/admin/emails" className="glass-panel p-8 rounded-[2rem] shadow-apple-sm group border-black/5 dark:border-white/5 hover:border-ios-blue/20 transition-all">
                    <div className="flex items-center gap-5 h-full">
                        <div className="p-4 bg-ios-blue/10 text-ios-blue rounded-[1.25rem] group-hover:bg-ios-blue group-hover:text-white transition-all duration-500">
                            <Mail size={28} />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">Emails</h3>
                            <p className="text-xs text-ios-blue font-bold uppercase tracking-wider mt-1 opacity-70 group-hover:opacity-100 transition-opacity">Plantillas Dinámicas</p>
                        </div>
                    </div>
                </Link>

                {/* Settings Link Card */}
                <Link href="/dashboard/admin/settings" className="glass-panel p-8 rounded-[2rem] shadow-apple-sm group border-black/5 dark:border-white/5 hover:border-gray-500/20 transition-all">
                    <div className="flex items-center gap-5 h-full">
                        <div className="p-4 bg-gray-100 text-gray-500 rounded-[1.25rem] group-hover:bg-gray-800 group-hover:text-white transition-all duration-500 dark:bg-white/10 dark:text-gray-300">
                            {/* Assuming Settings icon is imported if not I'll use Tag as placeholder or import it */}
                            {/* I need to check imports in admin page. Lucide icons are imported. I need to add Settings to imports if not there. */}
                            <div className="w-7 h-7 flex items-center justify-center">⚙️</div>
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">Ajustes</h3>
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-1 opacity-70 group-hover:opacity-100 transition-opacity">Sistema & Mantenimiento</p>
                        </div>
                    </div>
                </Link>
            </div>

            {/* User List Management Area */}
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 px-2">
                    <h2 className="text-2xl font-bold tracking-tight">Usuarios Registrados</h2>
                    <div className="relative w-full sm:w-80 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-ios-blue transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="Buscar por nombre o email..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="apple-input-field pl-12 h-12 text-[15px]"
                        />
                    </div>
                </div>

                <div className="glass-panel rounded-[2.5rem] overflow-hidden shadow-apple-lg border-black/5 dark:border-white/5">
                    {loading ? (
                        <div className="p-20 space-y-6">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="h-16 w-full bg-black/5 dark:bg-white/5 rounded-2xl animate-pulse" />
                            ))}
                        </div>
                    ) : (
                        <UserTable users={users} onRefresh={fetchUsers} />
                    )}
                </div>

                {/* Apple Style Pagination */}
                <div className="flex items-center justify-center gap-6 pt-4">
                    <Button
                        disabled={page === 1}
                        onClick={() => setPage(p => p - 1)}
                        variant="secondary"
                        size="sm"
                        icon={<ChevronLeft />}
                    >
                        Anterior
                    </Button>
                    <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">Página {page}</span>
                    <Button
                        onClick={() => setPage(p => p + 1)}
                        disabled={users.length < 20}
                        variant="secondary"
                        size="sm"
                        className="flex-row-reverse"
                    >
                        <span className="ml-2">Siguiente</span>
                        <ChevronRight size={16} />
                    </Button>
                </div>
            </div>
        </div>
    );
}
