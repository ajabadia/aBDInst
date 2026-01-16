// src/components/AnalyticsDashboard.tsx
'use client';

import { useEffect, useState } from 'react';
import { getUserCollection } from '@/actions/collection';
import ValueEvolutionChart from '@/components/ValueEvolutionChart';
import DistributionCharts from '@/components/DistributionCharts';
import TopMovers from './analytics/TopMovers';
import MarketIntelligence from './analytics/MarketIntelligence';
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
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                        <Activity className="text-blue-500" />
                        Dashboard Analítico
                    </h1>
                    <p className="text-gray-500 mt-1">
                        Visión global del rendimiento y composición de tu colección.
                    </p>
                </div>
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

        </div>
    );
}

