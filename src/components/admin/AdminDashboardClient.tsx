'use client';

import { useState } from 'react';
import { manageReport, punishUser } from '@/actions/admin';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { Trash2, CheckCircle, Gavel, UserX, AlertTriangle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface AdminDashboardClientProps {
    initialQueue: any[];
}

export default function AdminDashboardClient({ initialQueue }: AdminDashboardClientProps) {
    const [queue, setQueue] = useState(initialQueue);
    const [processing, setProcessing] = useState<string | null>(null);

    const handleAction = async (itemId: string, actionName: string, actionFn: () => Promise<any>) => {
        setProcessing(itemId);
        try {
            const res = await actionFn();
            if (res.success) {
                toast.success('Acción completada');
                // Remove from local list
                setQueue(prev => prev.filter(item => item._id !== itemId));
            } else {
                toast.error(res.error || 'Error al procesar');
            }
        } catch (e) {
            toast.error('Error desconocido');
        } finally {
            setProcessing(null);
        }
    };

    if (queue.length === 0) {
        return (
            <div className="p-12 text-center text-gray-500">
                <CheckCircle className="w-12 h-12 mx-auto text-green-500 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Todo limpio</h3>
                <p>No hay reportes pendientes de revisión.</p>
            </div>
        );
    }

    return (
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {queue.map((item) => (
                <div key={item._id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <div className="flex justify-between items-start gap-4">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="px-2 py-0.5 rounded text-xs font-bold bg-red-100 text-red-700">
                                    {item.reportCount} Reportes
                                </span>
                                <span className="text-sm text-gray-500">
                                    hace {formatDistanceToNow(new Date(item.updatedAt), { locale: es })}
                                </span>
                            </div>

                            <div className="bg-gray-100 dark:bg-gray-900 p-4 rounded-lg mb-4 text-gray-800 dark:text-gray-200 italic">
                                "{item.content}"
                            </div>

                            <div className="flex items-center gap-4 text-sm">
                                <span className="font-semibold text-gray-900 dark:text-white">
                                    Autor: {item.userId?.name || 'Desconocido'}
                                </span>
                                {item.userId?.strikes > 0 && (
                                    <span className="flex items-center gap-1 text-orange-600 font-bold">
                                        <AlertTriangle size={14} />
                                        {item.userId.strikes} Strikes
                                    </span>
                                )}
                                {item.userId?.isBanned && (
                                    <span className="text-red-600 font-bold uppercase text-xs">Usuario Baneado</span>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <div className="flex gap-2">
                                <Button
                                    size="sm"
                                    variant="secondary"
                                    onClick={() => handleAction(item._id, 'dismiss', () => manageReport(item._id, 'dismiss'))}
                                    disabled={!!processing}
                                    title="Ignorar Reportes"
                                >
                                    <CheckCircle size={16} />
                                </Button>
                                <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => handleAction(item._id, 'delete', () => manageReport(item._id, 'delete'))}
                                    disabled={!!processing}
                                    title="Borrar Comentario"
                                >
                                    <Trash2 size={16} />
                                </Button>
                            </div>

                            <div className="h-px bg-gray-200 dark:bg-gray-700 my-1" />

                            <div className="flex gap-2">
                                <Button
                                    size="sm"
                                    className="bg-orange-500 hover:bg-orange-600 text-white"
                                    onClick={() => handleAction(item._id, 'strike', () => punishUser(item.userId._id, 'strike'))}
                                    disabled={!!processing || item.userId?.isBanned}
                                    title="Dar Strike al Usuario"
                                >
                                    <Gavel size={16} />
                                </Button>
                                <Button
                                    size="sm"
                                    className="bg-red-900 hover:bg-black text-white"
                                    onClick={() => handleAction(item._id, 'ban', () => punishUser(item.userId._id, 'ban'))}
                                    disabled={!!processing || item.userId?.isBanned}
                                    title="Banear Usuario"
                                >
                                    <UserX size={16} />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
