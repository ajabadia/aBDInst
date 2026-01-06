'use client';

import { useState } from 'react';
import { manageReport, punishUser } from '@/actions/admin';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { Trash2, CheckCircle, Gavel, UserX, AlertTriangle, MessageSquare } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';

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
            <div className="p-16 text-center space-y-4">
                <div className="w-16 h-16 bg-ios-green/10 text-ios-green rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle size={32} />
                </div>
                <h3 className="text-xl font-bold tracking-tight">Todo limpio</h3>
                <p className="text-gray-500 max-w-xs mx-auto text-sm">No hay reportes pendientes. La comunidad está en calma.</p>
            </div>
        );
    }

    return (
        <div className="divide-y divide-black/5 dark:divide-white/5">
            {queue.map((item) => (
                <div key={item._id} className="p-8 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors">
                    <div className="flex flex-col xl:flex-row justify-between items-start gap-8">
                        <div className="flex-1 space-y-4 w-full">
                            <div className="flex items-center gap-3">
                                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-ios-red text-white uppercase tracking-wider">
                                    {item.reportCount} Reportes
                                </span>
                                <span className="text-xs font-semibold text-gray-400">
                                    {formatDistanceToNow(new Date(item.updatedAt), { locale: es, addSuffix: true })}
                                </span>
                            </div>

                            <div className="relative glass-panel rounded-2xl p-5 border-black/5 dark:border-white/5">
                                <MessageSquare className="absolute -top-3 -left-3 text-gray-300 dark:text-gray-700" size={24} />
                                <p className="text-[15px] leading-relaxed italic text-gray-800 dark:text-gray-200">
                                    "{item.content}"
                                </p>
                            </div>

                            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-2">
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-ios-blue/10 text-ios-blue flex items-center justify-center text-[10px] font-bold">
                                        {item.userId?.name?.charAt(0)}
                                    </div>
                                    <span className="text-sm font-bold text-gray-900 dark:text-white">
                                        {item.userId?.name || 'Usuario desconocido'}
                                    </span>
                                </div>
                                
                                {item.userId?.strikes > 0 && (
                                    <span className="flex items-center gap-1.5 px-2 py-0.5 bg-ios-orange/10 text-ios-orange rounded-lg text-xs font-bold border border-ios-orange/20">
                                        <AlertTriangle size={12} />
                                        {item.userId.strikes} Strikes
                                    </span>
                                )}
                                
                                {item.userId?.isBanned && (
                                    <span className="px-2 py-0.5 bg-gray-900 text-white rounded-lg text-[10px] font-bold uppercase tracking-widest">
                                        Baneado
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Actions Control Center */}
                        <div className="flex flex-row xl:flex-col gap-2 w-full xl:w-auto shrink-0">
                            <div className="grid grid-cols-2 gap-2 w-full">
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => handleAction(item._id, 'dismiss', () => manageReport(item._id, 'dismiss'))}
                                    isLoading={processing === item._id}
                                    className="w-full"
                                >
                                    <CheckCircle size={16} className="text-ios-green" />
                                    <span className="hidden sm:inline">Ignorar</span>
                                </Button>
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => handleAction(item._id, 'delete', () => manageReport(item._id, 'delete'))}
                                    isLoading={processing === item._id}
                                    className="w-full"
                                >
                                    <Trash2 size={16} />
                                    <span className="hidden sm:inline">Eliminar</span>
                                </Button>
                            </div>

                            <div className="h-px bg-black/5 dark:bg-white/5 my-1 hidden xl:block" />

                            <div className="grid grid-cols-2 gap-2 w-full">
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => handleAction(item._id, 'strike', () => punishUser(item.userId._id, 'strike'))}
                                    isLoading={processing === item._id}
                                    disabled={item.userId?.isBanned}
                                    className="w-full text-ios-orange border-ios-orange/20 hover:bg-ios-orange/10"
                                >
                                    <Gavel size={16} />
                                    <span className="hidden sm:inline">Strike</span>
                                </Button>
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => handleAction(item._id, 'ban', () => punishUser(item.userId._id, 'ban'))}
                                    isLoading={processing === item._id}
                                    disabled={item.userId?.isBanned}
                                    className="w-full"
                                >
                                    <UserX size={16} />
                                    <span className="hidden sm:inline">Bane</span>
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
