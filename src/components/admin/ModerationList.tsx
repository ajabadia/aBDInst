'use client';

import { useState } from 'react';
import { Shield, Ban, Trash2, Check, AlertOctagon, UserX } from 'lucide-react';
import { dismissReports, moderateComment, banUser } from '@/actions/comments';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export default function ModerationList({ items }: { items: any[] }) {
    const router = useRouter();
    const [processing, setProcessing] = useState<string | null>(null);

    const handleDismiss = async (id: string) => {
        setProcessing(id);
        const res = await dismissReports(id);
        if (res.success) {
            toast.success("Reportes descartados");
            router.refresh();
        } else toast.error("Error");
        setProcessing(null);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("¿Borrar este comentario permanentemente?")) return;
        setProcessing(id);
        const res = await moderateComment(id, 'delete');
        if (res.success) {
            toast.success("Comentario eliminado");
            router.refresh();
        } else toast.error("Error");
        setProcessing(null);
    };

    const handleBan = async (userId: string, userName: string) => {
        if (!confirm(`¿BANEAR a ${userName}? Esto es grave.`)) return;
        setProcessing(userId); // Using userId as key might conflict if multiple comments from same user, but rare in this list view logic
        const res = await banUser(userId);
        if (res.success) {
            toast.success(`Usuario ${userName} baneado`);
            router.refresh();
        } else toast.error("Error");
        setProcessing(null);
    };

    return (
        <div className="grid gap-4">
            {items.map((item) => (
                <div key={item._id} className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col md:flex-row gap-6">
                    {/* User Info */}
                    <div className="md:w-1/4 flex flex-col gap-2 border-b md:border-b-0 md:border-r border-gray-100 dark:border-gray-700 pb-4 md:pb-0 md:pr-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-500">
                                {item.userId?.name?.[0] || '?'}
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-900 dark:text-white">{item.userId?.name || 'Usuario desconocido'}</h4>
                                <p className="text-xs text-gray-500">{item.userId?.email}</p>
                            </div>
                        </div>
                        {item.userId?.isBanned && (
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-red-600 bg-red-100 px-2 py-1 rounded w-fit">
                                <UserX size={12} /> BANEADO
                            </span>
                        )}
                    </div>

                    {/* Content & Reports */}
                    <div className="flex-1">
                        <div className="bg-gray-50 dark:bg-black/20 p-4 rounded-xl text-gray-700 dark:text-gray-300 mb-4 text-sm italic">
                            "{item.content}"
                        </div>

                        <div className="space-y-2">
                            <h5 className="text-xs font-bold uppercase text-red-500 flex items-center gap-2">
                                <AlertOctagon size={12} /> {item.reportCount} Reportes
                            </h5>
                            <div className="max-h-32 overflow-y-auto space-y-1">
                                {item.reports.map((r: any, idx: number) => (
                                    <div key={idx} className="text-xs text-gray-500 bg-red-50 dark:bg-red-900/10 p-2 rounded">
                                        <span className="font-bold">Motivo:</span> {r.reason}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2 md:w-48 justify-center border-t md:border-t-0 md:border-l border-gray-100 dark:border-gray-700 pt-4 md:pt-0 md:pl-4">
                        <button
                            onClick={() => handleDismiss(item._id)}
                            disabled={!!processing}
                            className="flex items-center justify-center gap-2 w-full py-2 bg-green-50 text-green-700 hover:bg-green-100 rounded-lg text-sm font-medium transition-colors"
                        >
                            <Check size={16} /> Limpiar
                        </button>

                        <button
                            onClick={() => handleDelete(item._id)}
                            disabled={!!processing}
                            className="flex items-center justify-center gap-2 w-full py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
                        >
                            <Trash2 size={16} /> Borrar
                        </button>

                        {!item.userId?.isBanned && (
                            <button
                                onClick={() => handleBan(item.userId._id, item.userId.name)}
                                disabled={!!processing}
                                className="flex items-center justify-center gap-2 w-full py-2 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg text-sm font-bold transition-colors mt-auto"
                            >
                                <Ban size={16} /> Banear
                            </button>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}
