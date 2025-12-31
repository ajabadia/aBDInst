'use client';

import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Settings, Wrench, PenTool, Plus } from 'lucide-react';
import { Button } from './ui/Button';
import { useState } from 'react';
import MaintenanceModal from './MaintenanceModal';

interface MaintenanceRecord {
    _id: string; // Ensure ID matches what comes from DB
    date: string;
    type: string;
    description: string;
    technician?: string;
    cost?: number;
}

interface MaintenanceHistoryProps {
    collectionId: string;
    history: MaintenanceRecord[];
}

export default function MaintenanceHistory({ collectionId, history }: MaintenanceHistoryProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const getIcon = (type: string) => {
        switch (type) {
            case 'setup': return <Settings size={18} />;
            case 'repair': return <Wrench size={18} />;
            case 'modification': return <PenTool size={18} />;
            default: return <Wrench size={18} />;
        }
    };

    const getTypeLabel = (type: string) => {
        switch (type) {
            case 'setup': return 'Ajuste / Setup';
            case 'repair': return 'Reparación';
            case 'modification': return 'Modificación';
            case 'cleaning': return 'Limpieza';
            default: return type;
        }
    };

    return (
        <div>
            {/* Investment Summary Bubble */}
            {history.length > 0 && (
                <div className="bg-blue-600 dark:bg-blue-500 p-8 rounded-[2.5rem] text-white shadow-xl shadow-blue-500/20 mb-10 flex flex-col items-center justify-center text-center">
                    <p className="text-blue-100 text-xs font-bold uppercase tracking-[0.2em] mb-2">Inversión acumulada</p>
                    <p className="text-5xl font-semibold tracking-tighter">
                        {history.reduce((acc, curr) => acc + (curr.cost || 0), 0).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                    </p>
                </div>
            )}

            <div className="flex justify-between items-center mb-6">
                <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100">Historial de Intervenciones</h3>
                <Button
                    variant="secondary"
                    icon={Plus}
                    onClick={() => setIsModalOpen(true)}
                    className="!py-2 !px-4 text-xs"
                >
                    Añadir Registro
                </Button>
            </div>

            <div className={`space-y-4 ${history.length === 0 ? 'opacity-50' : ''}`}>
                {history.length === 0 ? (
                    <div className="text-center py-8 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-xl">
                        <p className="text-gray-500 text-sm">No hay registros de mantenimiento aún.</p>
                    </div>
                ) : (
                    history.map((record, index) => (
                        <div key={index} className="flex gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 hover:border-blue-100 transition-colors">
                            <div className="mt-1">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${record.type === 'repair' ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' :
                                        record.type === 'modification' ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400' :
                                            'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                                    }`}>
                                    {getIcon(record.type)}
                                </div>
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-start">
                                    <h4 className="font-medium text-gray-900 dark:text-white text-sm">{getTypeLabel(record.type)}</h4>
                                    <span className="text-xs text-gray-400 font-mono">
                                        {format(new Date(record.date), 'dd MMM yyyy', { locale: es })}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{record.description}</p>
                                {(record.technician || record.cost) && (
                                    <div className="flex gap-4 mt-2 text-xs text-gray-400">
                                        {record.technician && <span>Tec: {record.technician}</span>}
                                        {record.cost && <span>Coste: {record.cost}€</span>}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Conditionally Rendered Modal - Prevents global overlay issues */}
            {isModalOpen && (
                <MaintenanceModal
                    collectionId={collectionId}
                    onClose={() => setIsModalOpen(false)}
                />
            )}
        </div>
    );
}
