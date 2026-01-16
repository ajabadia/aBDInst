// src/components/AnalyticsDashboard.tsx
'use client';

import { useEffect, useState } from 'react';
import { getUserCollection } from '@/actions/collection';
import ValueEvolutionChart from '@/components/ValueEvolutionChart';
import DistributionCharts from '@/components/DistributionCharts';
import TopMovers from './analytics/TopMovers';
import MarketIntelligence from './analytics/MarketIntelligence';
import MaintenanceForecast from './analytics/MaintenanceForecast';
import ReportsSection from './analytics/ReportsSection';
import { Loader2, PieChart as PieIcon, Activity } from 'lucide-react';

export default function AnalyticsDashboard() {
    const [collection, setCollection] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function init() {
            try {
                const res = await getUserCollection();
                if (Array.isArray(res)) {
                    setCollection(res); // The action returns the array directly properly parsed
                } else if (res && (res as any).success === false) {
                    // Handle error object if the action signature changes, but currently it returns array or empty array on error
                    console.error("Error loading collection");
                } else {
                    setCollection(res);
                }
            } catch (e) {
                console.error("Error loading collection", e);
            } finally {
                setLoading(false);
            }
        }
        init();
    }, []);

    if (loading) {
        return (
            <div className="flex h-[50vh] items-center justify-center text-gray-400">
                <Loader2 className="animate-spin mr-2" /> Cargando Dashboard...
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-12">

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-4">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 dark:text-white flex items-center gap-3 tracking-tight">
                        <Activity className="text-ios-blue" size={32} strokeWidth={2.5} />
                        Dashboard Analítico
                    </h1>
                    <p className="text-gray-500 font-medium mt-1">
                        Visión global del rendimiento y composición de tu colección.
                    </p>
                </div>
            </div>

            {/* Quick Stats Summary */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {(() => {
                    const totalValue = collection.reduce((acc, item) => acc + (item.marketValue?.current?.value || item.acquisition?.price || 0), 0);
                    const totalInvested = collection.reduce((acc, item) => acc + (item.acquisition?.price || 0), 0);
                    const profit = totalValue - totalInvested;

                    return [
                        { label: 'Valor Total', value: totalValue, color: 'text-ios-blue' },
                        { label: 'Inversión', value: totalInvested, color: 'text-gray-500' },
                        { label: 'Plusvalía', value: profit, color: profit >= 0 ? 'text-green-500' : 'text-red-500', prefix: profit >= 0 ? '+' : '' },
                        { label: 'Instrumentos', value: collection.length, color: 'text-purple-500', isNumber: true }
                    ].map((stat, i) => (
                        <div key={i} className="bg-white/60 dark:bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-gray-200/50 dark:border-white/10 shadow-sm">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{stat.label}</p>
                            <p className={`text-2xl font-black tracking-tight ${stat.color}`}>
                                {stat.isNumber ? stat.value : (stat.prefix || '') + stat.value.toLocaleString('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })}
                            </p>
                        </div>
                    ));
                })()}
            </div>

            {/* Top Section: Evolution & Movers */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="xl:col-span-2">
                    <ValueEvolutionChart collection={collection} />
                </div>
                <div className="xl:col-span-1">
                    <TopMovers />
                </div>
            </div>

            {/* Middle Section: Market Intelligence (New) */}
            <MarketIntelligence />

            {/* Bottom Section: Distributions */}
            <div>
                <div className="flex items-center gap-2 mb-6 ml-2">
                    <PieIcon className="text-purple-500" />
                    <h2 className="text-xl font-bold">Distribución del Inventario</h2>
                </div>
                <DistributionCharts collection={collection} />
            </div>

            {/* Reports */}
            <ReportsSection collection={collection} />


        </div>
    );
}

