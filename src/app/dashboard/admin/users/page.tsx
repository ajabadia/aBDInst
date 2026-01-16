'use client';

import { useEffect, useState } from 'react';
import { getUsers } from '@/actions/admin';
import UserTable from '@/components/admin/UserTable';
import { Search, ChevronLeft, ChevronRight, Users } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function AdminUsersPage() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [totalUsers, setTotalUsers] = useState(0);

    const fetchUsers = async () => {
        setLoading(true);
        const res = await getUsers(page, 20, search);
        if (res.success) {
            setUsers(res.users);
            setTotalUsers((res as any).total || 0);
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
        <div className="max-w-7xl mx-auto px-6 space-y-8 pb-20">
            {/* Header Section */}
            <header className="space-y-4 pt-8">
                <Link
                    href="/dashboard/admin"
                    className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-ios-blue transition-colors group"
                >
                    <ChevronLeft size={16} className="transition-transform group-hover:-translate-x-1" />
                    Volver al Panel
                </Link>
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-ios-blue text-white rounded-2xl shadow-lg shadow-ios-blue/30">
                        <Users size={32} />
                    </div>
                    <div>
                        <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white leading-tight">Gestión de Usuarios</h1>
                        <p className="text-gray-500 dark:text-gray-400 font-medium">Administra roles, estados y permisos de la comunidad.</p>
                    </div>
                </div>
            </header>

            {/* User List Management Area */}
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center gap-3">
                        <div className="px-3 py-1 rounded-full bg-ios-blue/10 text-ios-blue text-xs font-bold uppercase tracking-wider">
                            Total: {totalUsers}
                        </div>
                    </div>
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
