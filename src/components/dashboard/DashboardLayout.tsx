'use client';

import { useState } from 'react';
import {
    Plus, Music, Settings, GitCompare, Bell,
    TrendingUp, LineChart, Activity, DollarSign,
    Box, QrCode
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { generateSpecSheet } from '@/actions/pdf'; // Assuming this exists or similar
import { toast } from 'sonner';

// Widgets
import EnhancedStats from '@/components/EnhancedStats';
import ValueEvolutionChart from '@/components/ValueEvolutionChart';
import DistributionCharts from '@/components/DistributionCharts';
import StudioCollection from '@/components/StudioCollection';
import ActivityFeed from '@/components/social/ActivityFeed';
import FinanceOverview from '@/components/finance/FinanceOverview';
import EmptyState from '@/components/EmptyState';

interface DashboardLayoutProps {
    collection: any[];
    tags: string[];
    feed: any[];
    finance: any;
    user: any;
}

export default function DashboardLayout({ collection, tags, feed, finance, user }: DashboardLayoutProps) {
    const [activeTab, setActiveTab] = useState<'overview' | 'finance' | 'activity'>('overview');

    // Quick Stats for Top Bar
    const totalValue = collection.reduce((acc, item) => acc + (item.value || 0), 0);
    const itemCount = collection.length;

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* --- LEFT COLUMN (Main Content) --- */}
                <div className="lg:col-span-2 space-y-8">

                    {/* 1. HERO */}
                    <div className="bg-gradient-to-br from-ios-blue to-ios-indigo rounded-3xl p-8 text-white shadow-apple-lg relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity duration-700">
                            <Music size={120} />
                        </div>
                        <div className="relative z-10">
                            <h1 className="text-3xl font-bold mb-2 tracking-tight">Hola, {user.name?.split(' ')[0] || 'Coleccionista'}</h1>
                            <p className="text-blue-100 mb-6 max-w-md text-balance">
                                Tu colección ha crecido un 12% este último mes. Tienes 3 mantenimientos pendientes.
                            </p>

                            <div className="flex flex-wrap gap-3">
                                <Link href="/instruments">
                                    <button className="bg-white/90 text-ios-blue px-5 py-2.5 rounded-2xl font-semibold shadow-sm hover:bg-white transition-all hover:scale-105 active:scale-95 flex items-center gap-2 backdrop-blur-sm">
                                        <Plus size={18} />
                                        Añadir Instrumento
                                    </button>
                                </Link>
                                <Link href="/dashboard/compare">
                                    <button className="bg-white/20 hover:bg-white/30 text-white px-5 py-2.5 rounded-2xl font-semibold backdrop-blur-md transition-all hover:scale-105 active:scale-95 flex items-center gap-2 border border-white/10">
                                        <GitCompare size={18} />
                                        Comparar
                                    </button>
                                </Link>
                                <Link href="/dashboard/alerts">
                                    <button className="bg-white/20 hover:bg-white/30 text-white px-5 py-2.5 rounded-2xl font-semibold backdrop-blur-md transition-all hover:scale-105 active:scale-95 flex items-center gap-2 border border-white/10">
                                        <Bell size={18} />
                                        Alertas
                                    </button>
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* 2. TABS */}
                    <div className="flex items-center gap-2 border-b border-gray-200 dark:border-white/10 pb-1 overflow-x-auto">
                        <button
                            onClick={() => setActiveTab('overview')}
                            className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 whitespace-nowrap ${activeTab === 'overview' ? 'bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5'}`}
                        >
                            Vista General
                        </button>
                        <button
                            onClick={() => setActiveTab('finance')}
                            className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 whitespace-nowrap ${activeTab === 'finance' ? 'bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5'}`}
                        >
                            Finanzas y Mercado
                        </button>
                        <button
                            onClick={() => setActiveTab('activity')}
                            className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 whitespace-nowrap ${activeTab === 'activity' ? 'bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5'}`}
                        >
                            Actividad y Social
                        </button>
                    </div>

                    {/* 3. TAB CONTENT */}
                    <div className="min-h-[400px]">
                        {activeTab === 'overview' && (
                            <div className="space-y-8">
                                {collection.length > 0 ? (
                                    <>
                                        <StudioCollection collection={collection} allTags={tags} />
                                        <DistributionCharts collection={collection} />
                                    </>
                                ) : (
                                    <EmptyState
                                        title="Empieza tu colección"
                                        description="Añade tu primer instrumento para ver estadísticas."
                                        actionLabel="Añadir Ahora"
                                        actionHref="/instruments"
                                        icon={<Music size={48} />}
                                    />
                                )}
                            </div>
                        )}

                        {activeTab === 'finance' && (
                            <div className="space-y-8">
                                {finance.success && <FinanceOverview data={finance.data} />}
                                <ValueEvolutionChart collection={collection} />
                            </div>
                        )}

                        {activeTab === 'activity' && (
                            <div className="apple-card p-6">
                                <h3 className="text-xl font-bold mb-4">Actividad Detallada</h3>
                                <ActivityFeed activities={feed} />
                            </div>
                        )}
                    </div>
                </div>

                {/* --- RIGHT COLUMN (Sidebar) --- */}
                <div className="space-y-6">

                    {/* 1. METRICS */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
                        <div className="apple-card p-6 flex flex-col justify-center transition-transform hover:scale-[1.02]">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-ios-green/10 rounded-xl">
                                    <DollarSign size={20} className="text-ios-green" />
                                </div>
                                <span className="text-gray-500 dark:text-gray-400 font-bold text-xs uppercase tracking-wider">Valor Total</span>
                            </div>
                            <span className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                                {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(totalValue)}
                            </span>
                        </div>

                        <div className="apple-card p-6 flex flex-col justify-center transition-transform hover:scale-[1.02]">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-ios-purple/10 rounded-xl">
                                    <Box size={20} className="text-ios-purple" />
                                </div>
                                <span className="text-gray-500 dark:text-gray-400 font-bold text-xs uppercase tracking-wider">Instrumentos</span>
                            </div>
                            <span className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                                {itemCount}
                            </span>
                        </div>
                    </div>

                    {/* 2. EXTRA STATS */}
                    {collection.length > 0 && (
                        <div className="apple-card p-6">
                            <h4 className="font-bold text-gray-500 mb-4 text-xs uppercase tracking-wider">Distribución</h4>
                            <EnhancedStats collection={collection} compact />
                        </div>
                    )}

                    {/* 3. ACTIVITY FEED */}
                    <div className="apple-card p-6 sticky top-24">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-bold text-lg flex items-center gap-2 tracking-tight">
                                <Activity size={20} className="text-ios-blue" />
                                Actividad
                            </h3>
                            <button className="text-xs font-semibold text-ios-blue bg-ios-blue/10 px-3 py-1 rounded-full cursor-pointer hover:bg-ios-blue/20 transition-colors" onClick={() => setActiveTab('activity')}>Ver todo</button>
                        </div>
                        <div className="max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                            <ActivityFeed activities={feed.slice(0, 5)} compact />
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
