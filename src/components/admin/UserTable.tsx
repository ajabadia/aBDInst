'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { UserAvatar } from '@/components/UserAvatar';
import { MoreHorizontal, Shield, ShieldAlert, Slash, CheckCircle, Search, Trash2 } from 'lucide-react';
import { updateUserRole, toggleUserBan } from '@/actions/admin';
import { toast } from 'sonner';

interface UserTableProps {
    users: any[];
    onRefresh: () => void;
}

export default function UserTable({ users, onRefresh }: UserTableProps) {
    const [loadingId, setLoadingId] = useState<string | null>(null);

    const handleRoleChange = async (userId: string, newRole: string) => {
        setLoadingId(userId);
        const res = await updateUserRole(userId, newRole as any);
        setLoadingId(null);

        if (res.success) {
            toast.success("Rol actualizado");
            onRefresh();
        } else {
            toast.error(res.error);
        }
    };

    const handleBanToggle = async (userId: string, currentStatus: boolean) => {
        if (!confirm(currentStatus ? "¿Desbanear usuario?" : "¿Banear usuario permanentemente?")) return;

        setLoadingId(userId);
        const res = await toggleUserBan(userId);
        setLoadingId(null);

        if (res.success) {
            toast.success(res.isBanned ? "Usuario baneado" : "Usuario restaurado");
            onRefresh();
        } else {
            toast.error(res.error);
        }
    };

    if (users.length === 0) {
        return <div className="p-8 text-center text-gray-500">No se encontraron usuarios</div>;
    }

    return (
        <div className="overflow-x-auto apple-card bg-white dark:bg-white/5">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="border-b border-gray-100 dark:border-white/5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        <th className="p-4 pl-6">Usuario</th>
                        <th className="p-4">Rol</th>
                        <th className="p-4">Estado</th>
                        <th className="p-4">Fecha Registro</th>
                        <th className="p-4 text-right pr-6">Acciones</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                    {users.map((user) => (
                        <tr key={user._id} className="group hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                            <td className="p-4 pl-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full overflow-hidden">
                                        <UserAvatar user={user} size={32} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">{user.name || 'Sin Nombre'}</p>
                                        <p className="text-xs text-gray-500">{user.email}</p>
                                    </div>
                                </div>
                            </td>
                            <td className="p-4">
                                <select
                                    value={user.role}
                                    onChange={(e) => handleRoleChange(user._id, e.target.value)}
                                    disabled={loadingId === user._id}
                                    className={`text-xs font-medium px-2 py-1 rounded-lg border-none bg-opacity-20 cursor-pointer focus:ring-2 focus:ring-blue-500 outline-none transition-colors ${user.role === 'admin' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' :
                                            user.role === 'editor' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' :
                                                'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                                        }`}
                                >
                                    <option value="normal">Normal</option>
                                    <option value="editor">Editor</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </td>
                            <td className="p-4">
                                {user.isBanned ? (
                                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                                        <Slash size={10} /> Baneado
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                        <CheckCircle size={10} /> Activo
                                    </span>
                                )}
                            </td>
                            <td className="p-4 py-4 text-xs text-gray-500">
                                {new Date(user.createdAt).toLocaleDateString()}
                            </td>
                            <td className="p-4 pr-6 text-right">
                                <Button
                                    onClick={() => handleBanToggle(user._id, user.isBanned)}
                                    disabled={loadingId === user._id}
                                    variant="ghost"
                                    className={`!p-2 h-8 w-8 hover:bg-transparent ${user.isBanned ? 'text-green-600 hover:text-green-700' : 'text-red-400 hover:text-red-600'}`}
                                    title={user.isBanned ? "Restaurar usuario" : "Banear usuario"}
                                >
                                    {user.isBanned ? <Shield size={16} /> : <Slash size={16} />}
                                </Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
