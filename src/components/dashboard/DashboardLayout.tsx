'use client';

import { useState } from 'react';
import {
    Plus, Music, Settings, GitCompare, Bell,
    TrendingUp, LineChart, DollarSign,
    Box, QrCode, Activity, Wrench, ChevronRight
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// Widgets & DnD
import DraggableGrid from '@/components/dashboard/DraggableGrid';
import ActivityFeed from '@/components/social/ActivityFeed';
import { useCommandPalette } from '@/context/CommandPaletteContext';

interface DashboardLayoutProps {
    collection: any[];
    feed: any[];
    user: any;
    finance?: any;
    tags?: string[];
}

export default function DashboardLayout({ collection, feed, user, finance, tags }: DashboardLayoutProps) {
    const { toggle: toggleCommandPalette } = useCommandPalette();

    // Quick Stats Calculations
    const totalValue = collection.reduce((acc, item) => acc + (item.acquisition?.price || 0), 0);
    const itemCount = collection.length;
    const maintenanceCount = collection.filter(i => i.nextMaintenanceDate && new Date(i.nextMaintenanceDate) <= new Date()).length;

    const widgetData = { collection, feed, user, finance, tags };

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">

            {/* --- 1. GLOBAL STATS BAR --- */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="apple-card p-6 bg-white dark:bg-white/5 flex items-center gap-4">
                    <div className="p-3 bg-ios-green/10 text-ios-green rounded-2xl">
                        <DollarSign size={24} />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1.5">Valor Invertido</p>
                        <p className="text-2xl font-bold tracking-tight">
                            {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(totalValue)}
                        </p>
                    </div>
                </div>

                <div className="apple-card p-6 bg-white dark:bg-white/5 flex items-center gap-4">
                    <div className="p-3 bg-ios-blue/10 text-ios-blue rounded-2xl">
                        <Box size={24} />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1.5">Instrumentos</p>
                        <p className="text-2xl font-bold tracking-tight">{itemCount}</p>
                    </div>
                </div>

                <Link href="/dashboard/maintenance" className="apple-card p-6 bg-white dark:bg-white/5 flex items-center justify-between group hover:border-ios-orange/30">
                    <div className="flex items-center gap-4">
                        <div className={cn(
                            "p-3 rounded-2xl transition-colors",
                            maintenanceCount > 0 ? "bg-ios-orange text-white shadow-lg shadow-ios-orange/20" : "bg-ios-orange/10 text-ios-orange"
                        )}>
                            <Wrench size={24} />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1.5">Tareas Técnicas</p>
                            <p className="text-2xl font-bold tracking-tight">{maintenanceCount}</p>
                        </div>
                    </div>
                    <ChevronRight className="text-gray-300 group-hover:text-ios-orange transition-all" />
                </Link>

                <div className="apple-card p-6 bg-white dark:bg-white/5 flex items-center gap-4">
                    <div className="p-3 bg-ios-indigo/10 text-ios-indigo rounded-2xl">
                        <TrendingUp size={24} />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1.5">Rendimiento</p>
                        <p className="text-2xl font-bold tracking-tight text-ios-green">+4.2%</p>
                    </div>
                </div>
            </div>

            {/* --- 2. MAIN LAYOUT --- */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

                {/* LEFT COLUMN: Hero & Widgets */}
                <div className="lg:col-span-8 space-y-10">

                    {/* WELCOME HERO */}
                    <div className="bg-gradient-to-br from-ios-blue to-ios-indigo rounded-[2.5rem] p-10 text-white shadow-apple-lg relative overflow-hidden group">
                        <div className="absolute top-[-20%] right-[-10%] opacity-10 group-hover:opacity-20 transition-opacity duration-1000 rotate-12">
                            <Music size={280} />
                        </div>

                        <div className="relative z-10 max-w-lg space-y-6">
                            <div className="space-y-2">
                                <h1 className="text-4xl font-bold tracking-tight">Hola, {user.name?.split(' ')[0]}</h1>
                                <p className="text-blue-100/80 text-lg font-medium leading-relaxed">
                                    Tu inventario está al día. Tienes {maintenanceCount} revisiones programadas para esta semana.
                                </p>
                            </div>

                            <div className="flex flex-wrap gap-3 pt-2">
                                <Button
                                    onClick={toggleCommandPalette}
                                    className="bg-white text-ios-blue hover:bg-white/90 border-none px-6 h-12 text-sm font-bold shadow-md"
                                    icon={Plus}
                                >
                                    Añadir Unidad
                                </Button>
                                <Link href="/instruments/compare" className="hidden sm:block">
                                    <Button
                                        variant="secondary"
                                        className="bg-white/10 hover:bg-white/20 text-white border-white/10 backdrop-blur-md px-6 h-12 text-sm font-bold"
                                        icon={GitCompare}
                                    >
                                        Comparativa
                                    </Button>
                                </Link>
                                <Link href="/dashboard/scan">
                                    <Button
                                        className="bg-black/20 hover:bg-black/30 text-white border-white/10 backdrop-blur-md px-6 h-12 text-sm font-bold"
                                        icon={QrCode}
                                    >
                                        Escanear QR
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* DRAGGABLE CONTENT */}
                    <DraggableGrid
                        initialLayout={user.dashboardLayout}
                        data={widgetData}
                    />
                </div>

                {/* RIGHT COLUMN: Sidebar Activity & Filters */}
                <div className="lg:col-span-4 space-y-8">
                    <div className="glass-panel rounded-[2.5rem] p-8 sticky top-28 shadow-apple-md border-black/5 dark:border-white/5">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-xl font-bold tracking-tight flex items-center gap-2">
                                <Activity size={20} className="text-ios-blue" />
                                Actividad
                            </h3>
                            <span className="px-2 py-0.5 bg-ios-blue/10 text-ios-blue text-[10px] font-bold rounded-full uppercase tracking-wider">En vivo</span>
                        </div>

                        <div className="space-y-1 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                            <ActivityFeed activities={feed.slice(0, 8)} compact />
                        </div>

                        <div className="mt-8 pt-6 border-t border-black/5 dark:border-white/5">
                            <Link href="/dashboard/feed" className="flex items-center justify-center gap-2 text-sm font-bold text-ios-blue hover:underline">
                                Ver todo el historial <ChevronRight size={16} />
                            </Link>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
