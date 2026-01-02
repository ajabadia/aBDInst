'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/Button';
import { Trash2, TrendingUp, AlertCircle } from 'lucide-react';
import { deleteValuationById } from '@/actions/valuation';
import { toast } from 'sonner';

interface ValuationHistoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    instrumentId: string;
    history: any[];
}

export default function ValuationHistoryModal({ isOpen, onClose, instrumentId, history }: ValuationHistoryModalProps) {
    const [deletingId, setDeletingId] = useState<string | null>(null);

    // Sort history desc for display
    const sortedHistory = [...(history || [])].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const handleDelete = async (id: string) => {
        if (!confirm('¿Estás seguro de eliminar este registro histórico?')) return;

        setDeletingId(id);
        const result = await deleteValuationById(instrumentId, id);
        if (result.success) {
            toast.success('Registro eliminado');
            // Optimistic update or wait for revalidate. Modals usually don't need optimistic UI complexities if fast enough.
        } else {
            toast.error('Error al eliminar: ' + result.error);
        }
        setDeletingId(null);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px] max-h-[80vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5" />
                        Historial Completo de Valoración
                    </DialogTitle>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto pr-2 mt-4 space-y-3">
                    {sortedHistory.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <p>No hay registros históricos.</p>
                        </div>
                    ) : (
                        sortedHistory.map((item) => (
                            <div key={item._id} className="flex items-start justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-700">
                                <div>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-lg font-bold text-gray-900 dark:text-white">
                                            {item.value.toLocaleString('es-ES', { minimumFractionDigits: 2 })}€
                                        </span>
                                        <span className="text-xs text-gray-500">
                                            {new Date(item.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
                                        </span>
                                    </div>
                                    <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                        {item.source && <span className="font-medium text-blue-600 dark:text-blue-400 mr-2">{item.source}</span>}
                                        {item.notes}
                                    </div>
                                    {(item.min || item.max) && (
                                        <div className="text-[10px] text-gray-400 mt-1 bg-gray-200 dark:bg-gray-700 inline-block px-1.5 py-0.5 rounded">
                                            Rango: {item.min || '?'} - {item.max || '?'}
                                        </div>
                                    )}
                                </div>

                                <Button
                                    variant="ghost"
                                    onClick={() => handleDelete(item._id)}
                                    isLoading={deletingId === item._id}
                                    className="text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 h-8 w-8 p-0"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        ))
                    )}
                </div>

                <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-end">
                    <Button variant="secondary" onClick={onClose}>
                        Cerrar
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
