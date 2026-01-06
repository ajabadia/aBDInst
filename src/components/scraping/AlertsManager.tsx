'use client';

import { useState } from 'react';
import { createPriceAlert, deletePriceAlert, runScraperForAlert } from '@/actions/scraping';
import { Button } from '@/components/ui/Button';
import { Search, Bell, Trash2, Play, AlertCircle, Box, Target, Plus } from 'lucide-react';
import Image from 'next/image';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

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
            toast.success('Alerta creada correctamente');
            window.location.reload();
        } else {
            toast.error('Error al crear alerta');
        }
        setLoading(false);
    };

    const handleDelete = async (id: string) => {
        const res = await deletePriceAlert(id);
        if (res.success) {
            setAlerts(alerts.filter(a => a._id !== id));
            toast.success('Alerta eliminada');
        }
    };

    const handleRun = async (id: string) => {
        toast.info('Escaneando mercados internacionales...');
        const res = await runScraperForAlert(id);
        if (res.success) {
            toast.success(`Escaneo completado: ${res.deals} ofertas encontradas.`);
        } else {
            toast.error(`Error: ${res.error}`);
        }
    };

    return (
        <div className="space-y-10 p-2 md:p-6">
            {/* Create Form - Apple Card Style */}
            <div className="apple-card p-8 bg-white dark:bg-white/5 border-ios-blue/10">
                <div className="flex items-center gap-3 mb-8">
                    <div className="p-2 bg-ios-blue/10 text-ios-blue rounded-xl">
                        <Plus size={20} />
                    </div>
                    <h3 className="text-xl font-bold tracking-tight">Nueva Vigilancia</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
                    <div className="md:col-span-7 space-y-2">
                        <label className="apple-label ml-1">Instrumento o Modelo</label>
                        <input
                            value={newQuery}
                            onChange={(e) => setNewQuery(e.target.value)}
                            placeholder="Ej: Roland Juno-60..."
                            className="apple-input-field"
                        />
                    </div>
                    <div className="md:col-span-3 space-y-2">
                        <label className="apple-label ml-1">Precio Objetivo (€)</label>
                        <input
                            type="number"
                            value={targetPrice}
                            onChange={(e) => setTargetPrice(e.target.value)}
                            placeholder="Opcional"
                            className="apple-input-field font-mono"
                        />
                    </div>
                    <div className="md:col-span-2">
                        <Button 
                            onClick={handleCreate} 
                            disabled={loading || !newQuery}
                            className="w-full shadow-apple-glow"
                        >
                            {loading ? '...' : 'Activar'}
                        </Button>
                    </div>
                </div>
            </div>

            {/* List of Active Alerts */}
            <div className="space-y-4">
                <div className="flex items-center gap-3 px-2 mb-6">
                    <Target size={18} className="text-gray-400" />
                    <h4 className="apple-label m-0">Rastreos Activos</h4>
                </div>
                
                <div className="grid gap-4">
                    {alerts.map((alert) => (
                        <div key={alert._id} className="apple-card p-5 flex flex-col sm:flex-row items-center justify-between gap-6 hover:border-ios-blue/20 transition-all group">
                            <div className="flex items-center gap-5 flex-1 w-full">
                                {/* Enhanced Thumbnail */}
                                <div className="w-16 h-16 bg-black/5 dark:bg-white/5 rounded-2xl shrink-0 overflow-hidden relative border border-black/5 dark:border-white/5">
                                    {(alert.instrumentId?.images?.[0] || alert.instrumentId?.genericImages?.[0]) ? (
                                        <Image
                                            src={alert.instrumentId?.images?.[0] || alert.instrumentId?.genericImages?.[0]}
                                            alt={alert.query}
                                            fill
                                            className="object-cover transition-transform group-hover:scale-110 duration-500"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                                            <Box size={24} />
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-1">
                                    <h4 className="font-bold text-lg tracking-tight">{alert.query}</h4>
                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                                        {alert.targetPrice && (
                                            <span className="px-2 py-0.5 bg-ios-green/10 text-ios-green rounded-lg text-xs font-bold border border-ios-green/20">
                                                Objetivo: &lt; {alert.targetPrice} €
                                            </span>
                                        )}
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                                            <Bell size={10} />
                                            Último: {alert.lastChecked ? new Date(alert.lastChecked).toLocaleDateString() : 'Pendiente'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-3 w-full sm:w-auto border-t sm:border-t-0 pt-4 sm:pt-0 border-black/5 dark:border-white/5">
                                <Button 
                                    variant="secondary" 
                                    size="sm" 
                                    className="flex-1 sm:flex-none"
                                    onClick={() => handleRun(alert._id)}
                                >
                                    <Play size={14} className="fill-current" />
                                    Scan
                                </Button>
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="text-gray-400 hover:text-ios-red rounded-full"
                                    onClick={() => handleDelete(alert._id)}
                                >
                                    <Trash2 size={18} />
                                </Button>
                            </div>
                        </div>
                    ))}

                    {alerts.length === 0 && (
                        <div className="glass-panel rounded-3xl py-20 text-center border-dashed border-2">
                            <Search className="w-12 h-12 mx-auto mb-4 text-gray-300 opacity-50" />
                            <p className="text-gray-500 font-medium">No tienes vigilancias de mercado activas.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Warning Callout */}
            <div className="bg-ios-orange/5 border border-ios-orange/10 rounded-2xl p-6 flex gap-4">
                <AlertCircle className="shrink-0 text-ios-orange" />
                <div className="space-y-1">
                    <p className="text-sm font-bold text-ios-orange">Aviso de Scraping</p>
                    <p className="text-xs text-ios-orange/80 leading-relaxed">
                        El escaneo automático depende de la estabilidad de las plataformas externas. 
                        Usa la función "Scan" con moderación para evitar bloqueos temporales de IP.
                    </p>
                </div>
            </div>
        </div>
    );
}
