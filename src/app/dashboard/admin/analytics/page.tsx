'use client';

import { useEffect, useState } from 'react';
import { getCatalogOverview, getInstrumentDistribution } from '@/actions/analytics';
import { BarChart3, Tag, Music, Globe, Calendar, ArrowLeft, Loader2, Sparkles, TrendingUp, Info } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export default function AnalyticsPage() {
    const [overview, setOverview] = useState<any>(null);
    const [distributions, setDistributions] = useState<any>({});
    const [loading, setLoading] = useState(true);
    const [activeView, setActiveView] = useState<'brand' | 'type' | 'artist' | 'decade'>('brand');

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            const ov = await getCatalogOverview();
            setOverview(ov);

            const [brands, types, artists, decades] = await Promise.all([
                getInstrumentDistribution('brand'),
                getInstrumentDistribution('type'),
                getInstrumentDistribution('artist'),
                getInstrumentDistribution('decade')
            ]);

            setDistributions({ brand: brands, type: types, artist: artists, decade: decades });
            setLoading(false);
        };
        load();
    }, []);

    if (loading) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
                <Loader2 className="animate-spin text-ios-blue" size={40} />
                <p className="text-gray-500 font-medium animate-pulse">Calculando estadísticas...</p>
            </div>
        );
    }

    const views = [
        { id: 'brand', label: 'Marcas', icon: Tag, color: 'text-ios-blue', bg: 'bg-ios-blue/10' },
        { id: 'type', label: 'Tipos', icon: Music, color: 'text-ios-indigo', bg: 'bg-ios-indigo/10' },
        { id: 'decade', label: 'Décadas', icon: Calendar, color: 'text-ios-orange', bg: 'bg-ios-orange/10' },
        { id: 'artist', label: 'Artistas', icon: Globe, color: 'text-ios-green', bg: 'bg-ios-green/10' },
    ];

    const currentData = distributions[activeView] || [];

    return (
        <div className="max-w-7xl mx-auto px-6 space-y-12 pb-20 pt-12">
            {/* Header */}
            <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="space-y-2">
                    <Link href="/dashboard/admin" className="inline-flex items-center gap-2 text-sm font-bold text-ios-blue hover:underline mb-2">
                        <ArrowLeft size={16} /> Volver al Panel
                    </Link>
                    <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white leading-tight">Analíticas del Catálogo</h1>
                    <p className="text-gray-500 dark:text-gray-400 font-medium text-lg">Distribución global y métricas del ecosistema.</p>
                </div>
                <div className="flex items-center gap-3 p-4 bg-ios-blue/5 rounded-2xl border border-ios-blue/10">
                    <Sparkles className="text-ios-blue" size={20} />
                    <div>
                        <p className="text-[10px] font-bold text-ios-blue uppercase tracking-widest leading-none mb-1">Total Instrumentos</p>
                        <p className="text-2xl font-bold leading-none">{overview?.totalInstruments || 0}</p>
                    </div>
                </div>
            </header>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                    { label: 'Marcas', val: overview?.totalBrands, icon: Tag, color: 'bg-ios-blue' },
                    { label: 'Tipos', val: overview?.totalTypes, icon: Music, color: 'bg-ios-indigo' },
                    { label: 'Artistas', val: overview?.totalArtists, icon: Globe, color: 'bg-ios-green' },
                    { label: 'Décadas', val: distributions.decade?.length, icon: Calendar, color: 'bg-ios-orange' },
                ].map((stat, i) => (
                    <div key={i} className="glass-panel p-6 rounded-[2rem] border-black/5 dark:border-white/5 shadow-apple-sm">
                        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-white mb-4 shadow-lg", stat.color)}>
                            <stat.icon size={20} />
                        </div>
                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">{stat.label}</p>
                        <p className="text-3xl font-bold tracking-tight">{stat.val || 0}</p>
                    </div>
                ))}
            </div>

            {/* Distribution View */}
            <div className="space-y-8">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b border-black/5 dark:border-white/5 pb-6">
                    <div className="flex p-1.5 bg-black/5 dark:bg-white/5 rounded-2xl w-fit border border-black/5 dark:border-white/5">
                        {views.map((v) => (
                            <button
                                key={v.id}
                                onClick={() => setActiveView(v.id as any)}
                                className={cn(
                                    "flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-200",
                                    activeView === v.id
                                        ? "bg-white dark:bg-white/15 text-ios-blue dark:text-white shadow-apple-sm border border-black/5 dark:border-white/5"
                                        : "text-gray-500 hover:text-gray-900 dark:hover:text-gray-300"
                                )}
                            >
                                <v.icon size={16} className={cn(activeView === v.id ? v.color : "opacity-50")} />
                                {v.label}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
                        <TrendingUp size={14} />
                        Top Distribución
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {currentData.map((item: any, idx: number) => (
                        <motion.div
                            key={item.label}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="bg-white dark:bg-white/5 p-5 rounded-[1.5rem] flex items-center justify-between shadow-apple-sm group hover:scale-[1.02] transition-transform"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-8 black-pill flex items-center justify-center text-[10px] font-bold opacity-30 group-hover:opacity-100 transition-opacity">
                                    #{idx + 1}
                                </div>
                                <span className="font-bold text-gray-900 dark:text-white">{item.label}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="h-1.5 w-24 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                                    <div
                                        className={cn("h-full rounded-full transition-all duration-1000", views.find(v => v.id === activeView)?.bg.replace('/10', ''))}
                                        style={{ width: `${Math.min(100, (item.count / distributions[activeView][0].count) * 100)}%` }}
                                    />
                                </div>
                                <span className="text-lg font-black text-ios-blue">{item.count}</span>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {currentData.length === 0 && (
                    <div className="p-20 text-center space-y-4">
                        <div className="p-6 bg-black/5 dark:bg-white/5 rounded-full w-fit mx-auto text-gray-300">
                            <Info size={40} />
                        </div>
                        <p className="text-gray-500 font-medium">No hay datos disponibles para esta categoría.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
