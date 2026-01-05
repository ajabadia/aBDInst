'use client';

import { useEffect, useState } from 'react';
import { getUsers } from '@/actions/admin';
import UserTable from '@/components/admin/UserTable';
import { Users, ShieldCheck, UserX, Search } from 'lucide-react';
import { toast } from 'sonner';

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
            // Quick client-side stats calc (ideally server side but this is faster for now)
            // Note: This only counts current page stats if not careful, but for MVP we will stick to basic display
            // To do real global stats we should add it to the getUsers response.
            // For now, let's just show total count from response.
            setStats(prev => ({ ...prev, total: (res as any).total || 0 }));
        } else {
            toast.error(res.error);
        }
        setLoading(false);
    };

    useEffect(() => {
        const timeout = setTimeout(() => {
            fetchUsers();
        }, 300); // Debounce search
        return () => clearTimeout(timeout);
    }, [search, page]);

    return (
        <div className="max-w-7xl mx-auto space-y-8">
            <header>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white mb-2">Panel de Administración</h1>
                <p className="text-gray-500">Gestión de usuarios y permisos del sistema.</p>
            </header>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="apple-card p-6 bg-blue-50/50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/30">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-500 text-white rounded-xl shadow-lg shadow-blue-500/20">
                            <Users size={24} />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Total Usuarios</p>
                            <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
                        </div>
                    </div>
                </div>
                {/* Placeholder stats as we don't have separate counts yet without extra queries */}
            </div>

            {/* Main Content */}
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Usuarios Registrados</h2>
                    <div className="relative w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input
                            type="text"
                            placeholder="Buscar por nombre o email..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="apple-input w-full pl-10 h-10 text-sm"
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="space-y-4">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="h-16 w-full bg-gray-100 dark:bg-white/5 rounded-xl animate-pulse" />
                        ))}
                    </div>
                ) : (
                    <UserTable users={users} onRefresh={fetchUsers} />
                )}

                {/* Pagination (Basic) */}
                <div className="flex justify-center gap-2 mt-4">
                    <button
                        disabled={page === 1}
                        onClick={() => setPage(p => p - 1)}
                        className="px-4 py-2 bg-white dark:bg-white/5 rounded-lg disabled:opacity-50 text-sm font-medium"
                    >
                        Anterior
                    </button>
                    <span className="px-4 py-2 text-sm text-gray-500">Página {page}</span>
                    <button
                        // Logic for next page disable would need total pages from backend
                        onClick={() => setPage(p => p + 1)}
                        className="px-4 py-2 bg-white dark:bg-white/5 rounded-lg text-sm font-medium"
                    >
                        Siguiente
                    </button>
                </div>
            </div>
        </div>
    );
}
