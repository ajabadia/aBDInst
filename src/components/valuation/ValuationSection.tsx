'use client';

import { useState, useEffect } from 'react';
import InstrumentValueChart from './InstrumentValueChart';
import ValuationModal from './ValuationModal';
import ValuationHistoryModal from './ValuationHistoryModal';
import { Button } from '@/components/ui/Button';
import { TrendingUp, Plus, List, Bell } from 'lucide-react';
import { createPriceAlert, checkIsTracked, deletePriceAlert } from '@/actions/scraping';
import { toast } from 'sonner';

export default function ValuationSection({ instrument, purchasePrice, canEdit }: { instrument: any, purchasePrice?: number, canEdit: boolean }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [isTracking, setIsTracking] = useState(false);
    const [trackedAlertId, setTrackedAlertId] = useState<string | null>(null);

    useEffect(() => {
        const checkStatus = async () => {
            if (canEdit) {
                const id = instrument._id || instrument.id;
                if (id) {
                    const res = await checkIsTracked(id);
                    if (res.isTracked) setTrackedAlertId(res.alertId);
                }
            }
        };
        checkStatus();
    }, [canEdit, instrument]);

    const handleToggleTrack = async () => {
        setIsTracking(true);
        try {
            if (trackedAlertId) {
                // Stop monitoring
                const res = await deletePriceAlert(trackedAlertId);
                if (res.success) {
                    setTrackedAlertId(null);
                    toast.success('Rastreo detenido');
                } else {
                    toast.error('Error al detener');
                }
            } else {
                // Start monitoring
                const query = `${instrument.brand} ${instrument.model}`;
                const res = await createPriceAlert({
                    query,
                    instrumentId: instrument._id || instrument.id
                });
                if (res.success) {
                    setTrackedAlertId(res.id);
                    toast.success('Monitorizando mercado', { description: query });
                } else {
                    toast.error(res.error || 'Error al activar');
                }
            }
        } catch (e) {
            toast.error('Error de conexión');
        } finally {
            setIsTracking(false);
        }
    };

    return (
        <div>
            <div className="flex justify-between items-end mb-6">
                <div>
                    <h3 className="font-semibold text-xl text-gray-900 dark:text-gray-100 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-blue-500" />
                        Histórico de Valor
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">Estimación de mercado basada en registros históricos.</p>
                </div>
                {canEdit && (
                    <div className="flex gap-2">
                        <Button
                            variant="secondary"
                            onClick={() => setIsHistoryOpen(true)}
                            className="h-8 w-8 p-0 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 transition-all border border-transparent hover:border-gray-300"
                            title="Ver Historial Completo"
                        >
                            <List className="w-4 h-4" />
                        </Button>

                        <Button
                            variant="secondary"
                            onClick={handleToggleTrack}
                            disabled={isTracking}
                            className={`${trackedAlertId
                                ? 'bg-green-100 text-green-700 hover:bg-red-100 hover:text-red-700 border-green-200 dark:bg-green-900/30 dark:text-green-400'
                                : 'bg-amber-100 hover:bg-amber-200 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
                                } border-transparent shadow-sm transition-all`}
                            title={trackedAlertId ? "Click para detener rastreo" : "Crear alerta automática"}
                        >
                            <Bell className={`w-4 h-4 mr-2 ${trackedAlertId ? 'fill-current' : ''}`} />
                            {isTracking ? '...' : (trackedAlertId ? 'Monitorizando' : 'Monitorizar')}
                        </Button>

                        <Button
                            variant="primary" // Assuming primary maps to blue in the UI library or is default
                            onClick={() => setIsModalOpen(true)}
                            icon={Plus}
                            className="shadow-sm shadow-blue-500/20"
                        >
                            Registrar Valor
                        </Button>
                    </div>
                )}
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm">
                <InstrumentValueChart
                    history={instrument.marketValue?.history || []}
                    purchasePrice={purchasePrice}
                    originalPrice={instrument.marketValue?.original}
                />
            </div>

            {/* Current Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
                <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Valor Actual Estimado</p>
                    <div className="mt-1">
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                            {instrument.marketValue?.current?.value
                                ? `${instrument.marketValue.current.value}€`
                                : '—'}
                        </p>
                        {instrument.marketValue?.current?.min && instrument.marketValue?.current?.max && (
                            <p className="text-xs text-gray-400 mt-1">
                                Rango: {instrument.marketValue.current.min}€ - {instrument.marketValue.current.max}€
                            </p>
                        )}
                    </div>
                </div>
                {instrument.marketValue?.original?.price && (
                    <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl">
                        <p className="text-xs text-gray-500 uppercase tracking-wide">Precio Original ({instrument.marketValue.original.year || 'Lanzamiento'})</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                            {instrument.marketValue.original.price.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                            <span className="text-sm font-normal text-gray-400 ml-1">{instrument.marketValue.original.currency}</span>
                        </p>
                    </div>
                )}

                {purchasePrice && (
                    <>
                        <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl">
                            <p className="text-xs text-gray-500 uppercase tracking-wide">Tu Precio de Compra</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                                {purchasePrice.toLocaleString('es-ES', { minimumFractionDigits: 2 })}€
                            </p>
                        </div>
                        <div className={`p-4 rounded-xl ${(instrument.marketValue?.current?.value || 0) - purchasePrice >= 0
                            ? 'bg-green-50 dark:bg-green-900/10 text-green-700 dark:text-green-400'
                            : 'bg-red-50 dark:bg-red-900/10 text-red-700 dark:text-red-400'
                            }`}>
                            <p className="text-xs uppercase tracking-wide opacity-80">Rendimiento</p>
                            <p className="text-2xl font-bold mt-1">
                                {((instrument.marketValue?.current?.value || 0) - purchasePrice) > 0 ? '+' : ''}
                                {((instrument.marketValue?.current?.value || 0) - purchasePrice).toLocaleString('es-ES', { minimumFractionDigits: 2 })}€
                            </p>
                        </div>
                    </>
                )}
            </div>

            <ValuationModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                instrumentId={instrument._id || instrument.id}
                instrumentName={instrument.model}
            />

            <ValuationHistoryModal
                isOpen={isHistoryOpen}
                onClose={() => setIsHistoryOpen(false)}
                instrumentId={instrument._id || instrument.id}
                history={instrument.marketValue?.history || []}
            />
        </div>
    );
}
