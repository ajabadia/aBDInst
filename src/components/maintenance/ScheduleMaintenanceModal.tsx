'use client';

import { useState } from 'react';

// Since we might not have a Dialog component ready, I'll build a simple Tailwind Modal here to be safe and dependency-free
import { X, Calendar as CalendarIcon, Save } from 'lucide-react';
import { scheduleMaintenance } from '@/actions/maintenance';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface ScheduleMaintenanceModalProps {
    isOpen: boolean;
    onClose: () => void;
    collectionId: string;
    currentNextDate?: Date | string;
    currentInterval?: string;
    currentNotes?: string;
    instrumentName: string;
}

export default function ScheduleMaintenanceModal({
    isOpen, onClose, collectionId, currentNextDate, currentInterval, currentNotes, instrumentName
}: ScheduleMaintenanceModalProps) {
    const router = useRouter();
    const [date, setDate] = useState(currentNextDate ? new Date(currentNextDate).toISOString().split('T')[0] : '');
    const [interval, setInterval] = useState(currentInterval || '6m');
    const [notes, setNotes] = useState(currentNotes || '');
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const res = await scheduleMaintenance(collectionId, new Date(date), interval, notes);

        if (res.success) {
            toast.success("Mantenimiento programado");
            router.refresh();
            onClose();
        } else {
            toast.error(res.error || "Error al guardar");
        }
        setLoading(false);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-800">
                <div className="flex justify-between items-center p-4 border-b border-gray-100 dark:border-gray-800">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <CalendarIcon size={20} className="text-blue-500" />
                        Programar Mantenimiento
                    </h3>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Para: <span className="font-bold text-gray-900 dark:text-gray-200">{instrumentName}</span>
                    </p>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Próxima Fecha</label>
                        <input
                            type="date"
                            required
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Intervalo Regular</label>
                        <select
                            value={interval}
                            onChange={(e) => setInterval(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="none">Solo una vez</option>
                            <option value="1m">Cada mes</option>
                            <option value="3m">Cada 3 meses</option>
                            <option value="6m">Cada 6 meses</option>
                            <option value="1y">Anualmente</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notas / Recordatorio</label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Ej: Cambio de cuerdas, limpieza de potenciómetros..."
                            className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 h-24 resize-none"
                        />
                    </div>

                    <div className="flex justify-end pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-bold text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 mr-2"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-colors disabled:opacity-50"
                        >
                            {loading ? 'Guardando...' : (
                                <>
                                    <Save size={16} /> Guardar
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
