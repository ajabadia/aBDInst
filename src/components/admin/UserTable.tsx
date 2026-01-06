'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import UserAvatar from '@/components/UserAvatar';
import { ShieldCheck, UserX, CheckCircle, Gavel, ShieldAlert, ArrowRight } from 'lucide-react';
import { updateUserRole, toggleUserBan } from '@/actions/admin';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface UserTableProps {
    users: any[];
    onRefresh: () => void;
}

export default function UserTable({ users, onRefresh }: UserTableProps) {
    const [loadingId, setLoadingId] = useState<string | null>(null);

    const handleRoleChange = async (userId: string, newRole: string) => {
        setLoadingId(userId);
        const res = await updateUserRole(userId, newRole as any);
        if (res.success) {
            toast.success("Rol actualizado");
            onRefresh();
        } else {
            toast.error(res.error);
        }
        setLoadingId(null);
    };

    const handleBanToggle = async (userId: string, currentStatus: boolean) => {
        setLoadingId(userId);
        const res = await toggleUserBan(userId);
        if (res.success) {
            toast.success(res.isBanned ? "Usuario bloqueado" : "Usuario restaurado");
            onRefresh();
        } else {
            toast.error(res.error);
        }
        setLoadingId(null);
    };

    if (users.length === 0) {
        return (
            <div className="p-20 text-center space-y-4">
                <ShieldCheck className="w-16 h-16 mx-auto text-gray-200" />
                <p className="text-gray-500 font-medium">No se encontraron registros de usuarios.</p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                    <tr className="bg-black/[0.02] dark:bg-white/[0.02] text-[11px] font-bold text-gray-400 uppercase tracking-[0.15em]">
                        <th className="px-8 py-5">Identidad</th>
                        <th className="px-6 py-5">Rol Maestro</th>
                        <th className="px-6 py-5">Estado Comunidad</th>
                        <th className="px-6 py-5">Registro</th>
                        <th className="px-8 py-5 text-right">Jurisdicción</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-black/5 dark:divide-white/5">
                    {users.map((user) => (
                        <tr key={user._id} className="group hover:bg-black/[0.01] dark:hover:bg-white/[0.01] transition-colors">
                            <td className="px-8 py-6">
                                <div className="flex items-center gap-4">
                                    <UserAvatar user={user} size={40} className="w-10 h-10 border border-black/5 dark:border-white/10" />
                                    <div className="space-y-0.5">
                                        <p className="text-[15px] font-bold text-gray-900 dark:text-white leading-none">{user.name || 'Anónimo'}</p>
                                        <p className="text-xs text-gray-500 font-medium">{user.email}</p>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-6">
                                <div className="relative inline-block group/select">
                                    <select
                                        value={user.role}
                                        onChange={(e) => handleRoleChange(user._id, e.target.value)}
                                        disabled={loadingId === user._id}
                                        className={cn(
                                            "text-xs font-bold px-3 py-1.5 rounded-xl border appearance-none cursor-pointer pr-8 transition-all",
                                            user.role === 'admin' 
                                                ? "bg-ios-indigo/10 text-ios-indigo border-ios-indigo/20" 
                                                : user.role === 'editor'
                                                    ? "bg-ios-blue/10 text-ios-blue border-ios-blue/20"
                                                    : "bg-black/5 dark:bg-white/5 text-gray-500 border-black/5 dark:border-white/10"
                                        )}
                                    >
                                        <option value="normal">Normal</option>
                                        <option value="editor">Editor</option>
                                        <option value="admin">Administrador</option>
                                    </select>
                                    <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none opacity-50" />
                                </div>
                            </td>
                            <td className="px-6 py-6">
                                {user.isBanned ? (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-ios-red text-white shadow-sm shadow-ios-red/20 uppercase tracking-wider">
                                        Restringido
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-ios-green/10 text-ios-green border border-ios-green/20 uppercase tracking-wider">
                                        Activo
                                    </span>
                                )}
                            </td>
                            <td className="px-6 py-6 text-sm font-medium text-gray-500">
                                {new Date(user.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-8 py-6 text-right">
                                <Button
                                    onClick={() => handleBanToggle(user._id, user.isBanned)}
                                    disabled={loadingId === user._id}
                                    variant="secondary"
                                    size="icon"
                                    className={cn(
                                        "rounded-full w-9 h-9 transition-all",
                                        user.isBanned 
                                            ? "text-ios-green hover:bg-ios-green/10" 
                                            : "text-ios-red hover:bg-ios-red hover:text-white border-none shadow-none"
                                    )}
                                    title={user.isBanned ? "Restaurar acceso" : "Bloquear acceso"}
                                >
                                    {user.isBanned ? <CheckCircle size={18} /> : <Gavel size={18} />}
                                </Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function ChevronDown({ size, className }: { size: number, className?: string }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="m6 9 6 6 6-6" />
        </svg>
    );
}
