'use client';

import { useState } from 'react';
import { createPriceAlert, deletePriceAlert, runScraperForAlert } from '@/actions/scraping';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Search, Bell, Trash2, Play, AlertCircle, Box } from 'lucide-react';
import Image from 'next/image';
import { toast } from 'sonner';

export default function AlertsManager({ initialAlerts }: { initialAlerts: any[] }) {
    const [alerts, setAlerts] = useState(initialAlerts);
    const [newQuery, setNewQuery] = useState('');
    const [targetPrice, setTargetPrice] = useState('');
    const [loading, setLoading] = useState(false);

    const handleCreate = async () => {
        if (!newQuery) return;
        setLoading(true);
        const res = await createPriceAlert({
            query: newQuery,
            targetPrice: targetPrice ? Number(targetPrice) : undefined
        });

        if (res.success) {
            toast.success('Alerta creada');
            // Optimistic update or refresh needed. ideally useRouter.refresh()
            window.location.reload();
        } else {
            toast.error('Error al crear alerta');
        }
        setLoading(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Eliminar alerta?')) return;
        const res = await deletePriceAlert(id);
        if (res.success) {
            setAlerts(alerts.filter(a => a._id !== id));
            toast.success('Alerta eliminada');
        }
    };

    const handleRun = async (id: string) => {
        toast.info('Buscando ofertas...');
        const res = await runScraperForAlert(id);
        if (res.success) {
            toast.success(`Búsqueda completada. ${res.count} resultados, ${res.deals} ofertas.`);
        } else {
            toast.error(`Error: ${res.error}. Posible bloqueo de IP.`);
        }
    };

    return (
        <div className="space-y-8">
            {/* Create Form */}
            <div className="apple-card p-6">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <Bell className="text-blue-500" />
                    Crear Nueva Alerta
                </h3>
                <div className="flex gap-4 items-end">
                    <div className="flex-1">
                        <label className="apple-label">Búsqueda (Ej: Yamaha DX7)</label>
                        <Input
                            value={newQuery}
                            onChange={(e) => setNewQuery(e.target.value)}
                            placeholder="Modelo exacto..."
                        />
                    </div>
                    <div className="w-32">
                        <label className="apple-label">Precio Máx (€)</label>
                        <Input
                            type="number"
                            value={targetPrice}
                            onChange={(e) => setTargetPrice(e.target.value)}
                            placeholder="Opcional"
                        />
                    </div>
                    <Button onClick={handleCreate} disabled={loading || !newQuery}>
                        {loading ? 'Creando...' : 'Activar Alerta'}
                    </Button>
                </div>
            </div>

            {/* List */}
            <div className="grid gap-4">
                {alerts.map((alert) => (
                    <div key={alert._id} className="apple-card p-4 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4 flex-1">
                            {/* Image Thumbnail */}
                            <div className="w-16 h-16 bg-gray-100 rounded-lg shrink-0 overflow-hidden relative border border-gray-200 dark:border-gray-700">
                                {alert.instrumentId?.images?.[0] ? (
                                    <Image
                                        src={alert.instrumentId.images[0]}
                                        alt={alert.query}
                                        fill
                                        className="object-cover"
                                    />
                                ) : alert.instrumentId?.genericImages?.[0] ? (
                                    <Image
                                        src={alert.instrumentId.genericImages[0]}
                                        alt={alert.query}
                                        fill
                                        className="object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                                        <Box size={24} />
                                    </div>
                                )}
                            </div>

                            <div>
                                <h4 className="font-bold text-lg">{alert.query}</h4>
                                <div className="text-sm text-gray-500 flex items-center gap-4">
                                    {alert.targetPrice && (
                                        <span className="text-green-600 font-medium">
                                            Meta: &lt; {alert.targetPrice} €
                                        </span>
                                    )}
                                    <span>Última comprobación: {alert.lastChecked ? new Date(alert.lastChecked).toLocaleDateString() : 'Nunca'}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="secondary" className="px-3 py-1.5 text-xs h-8" onClick={() => handleRun(alert._id)}>
                                <Play size={14} className="mr-1" />
                                Comprobar
                            </Button>
                            <Button variant="ghost" className="px-2 py-1.5 h-8 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20" onClick={() => handleDelete(alert._id)}>
                                <Trash2 size={16} />
                            </Button>
                        </div>
                    </div>
                ))}

                {alerts.length === 0 && (
                    <div className="text-center py-12 text-gray-400">
                        <Search className="w-12 h-12 mx-auto mb-3 opacity-20" />
                        <p>No tienes alertas activas.</p>
                    </div>
                )}
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-900/10 p-4 rounded-xl flex gap-3 text-sm text-yellow-800 dark:text-yellow-200">
                <AlertCircle className="shrink-0" />
                <p>
                    Nota: La búsqueda automática (Reverb/eBay) puede fallar si los sitios detectan tráfico automatizado (Error 403).
                    Usa esta función con moderación. Próximamente se añadirán fuentes más estables.
                </p>
            </div>
        </div>
    );
}
