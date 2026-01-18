'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { updateExhibition } from '@/actions/exhibition';
import { Calendar, Edit, Plus, Archive, Power } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function ExhibitionManager({ exhibitions }: { exhibitions: any[] }) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const handleStatusUpdate = async (id: string, newStatus: string) => {
        setIsLoading(true);
        const res = await updateExhibition(id, { status: newStatus });
        if (res.success) {
            toast.success("Estado actualizado");
            router.refresh(); // Simple refresh to reflect changes
        } else {
            toast.error("Error al actualizar");
        }
        setIsLoading(false);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div className="flex gap-2">
                    <Button variant="ghost" className="text-gray-500">Todos</Button>
                    <Button variant="ghost" className="text-gray-500">Activos</Button>
                </div>
                <Link href="/dashboard/admin/exhibitions/new">
                    <Button>
                        <Plus size={16} className="mr-2" /> Nueva Exhibición
                    </Button>
                </Link>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {exhibitions.map((ex) => (
                    <div key={ex._id} className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-4 flex items-center justify-between group">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gray-100 dark:bg-white/10 rounded-lg flex items-center justify-center font-bold text-gray-400">
                                {ex.title[0]}
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 dark:text-gray-100">{ex.title}</h3>
                                <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                                    <span className="flex items-center gap-1">
                                        <Calendar size={12} />
                                        {new Date(ex.startDate).toLocaleDateString()} - {new Date(ex.endDate).toLocaleDateString()}
                                    </span>
                                    <span className={`px-2 py-0.5 rounded-full capitalize ${ex.status === 'open' ? 'bg-green-100 text-green-700' :
                                            ex.status === 'draft' ? 'bg-gray-100 text-gray-600' :
                                                'bg-red-100 text-red-600'
                                        }`}>
                                        {ex.status}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Link href={`/dashboard/admin/exhibitions/${ex._id}/edit`}>
                                <Button size="sm" variant="ghost" className="h-8 w-8 p-0"><Edit size={14} /></Button>
                            </Link>

                            {ex.status === 'draft' && (
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                                    onClick={() => handleStatusUpdate(ex._id, 'open')}
                                    disabled={isLoading}
                                >
                                    <Power size={14} />
                                </Button>
                            )}

                            {ex.status === 'open' && (
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-8 w-8 p-0 text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                                    onClick={() => handleStatusUpdate(ex._id, 'closed')}
                                    disabled={isLoading}
                                >
                                    <Archive size={14} />
                                </Button>
                            )}
                        </div>
                    </div>
                ))}

                {exhibitions.length === 0 && (
                    <div className="text-center p-12 bg-gray-50 dark:bg-white/5 rounded-xl border border-dashed text-gray-400">
                        No hay exhibiciones creadas.
                    </div>
                )}
            </div>
        </div>
    );
}
