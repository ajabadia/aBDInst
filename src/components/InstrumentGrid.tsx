'use client';

import { motion, AnimatePresence, Variants } from 'framer-motion';
import InstrumentCard from '@/components/InstrumentCard';
import EmptyState from '@/components/EmptyState';
import VirtualizedInstrumentGrid from './VirtualizedInstrumentGrid';

import { useState, useMemo } from 'react';
import { LayoutGrid, List, Tag, Calendar, Music } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './ui/Button';
import Image from 'next/image';

interface InstrumentGridProps {
    instruments: any[];
    sortBy?: 'brand' | 'model' | 'year' | 'type';
    metadata?: Record<string, any>;
}

const container: Variants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.05
        }
    }
};

const itemVariant: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export default function InstrumentGrid({ instruments, sortBy = 'brand', metadata = {} }: InstrumentGridProps) {
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    // Grouping Logic
    const groupedData = useMemo(() => {
        if (!['brand', 'type', 'year'].includes(sortBy)) return null;

        const groups: Record<string, any[]> = {};

        instruments.forEach(inst => {
            let key = '';
            if (sortBy === 'brand') key = inst.brand;
            else if (sortBy === 'type') key = inst.type;
            else if (sortBy === 'year') {
                const year = inst.years?.[0];
                key = year ? `${year.substring(0, 3)}0s` : 'Unknown';
            }

            if (!groups[key]) groups[key] = [];
            groups[key].push(inst);
        });

        return groups;
    }, [instruments, sortBy]);

    // Performance Optimization: Use Virtualization for large lists (>100 items) IF not grouped
    // Virtualization is tricky with groups, so we skip it for grouped view for now unless very large
    if (instruments.length > 100 && !groupedData) {
        return <VirtualizedInstrumentGrid instruments={instruments} />;
    }

    return (
        <div className="space-y-8">
            {/* View Toggle */}
            <div className="flex justify-end mb-4">
                <div className="bg-white/50 dark:bg-black/20 backdrop-blur-md p-1 rounded-xl flex gap-1 border border-black/5 dark:border-white/5">
                    <button
                        onClick={() => setViewMode('grid')}
                        className={cn(
                            "p-2 rounded-lg transition-all",
                            viewMode === 'grid'
                                ? "bg-white dark:bg-white/10 shadow-sm text-blue-600 dark:text-blue-400"
                                : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        )}
                    >
                        <LayoutGrid size={20} />
                    </button>
                    <button
                        onClick={() => setViewMode('list')}
                        className={cn(
                            "p-2 rounded-lg transition-all",
                            viewMode === 'list'
                                ? "bg-white dark:bg-white/10 shadow-sm text-blue-600 dark:text-blue-400"
                                : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        )}
                    >
                        <List size={20} />
                    </button>
                </div>
            </div>

            {groupedData ? (
                // RENDER GROUPED
                Object.entries(groupedData).map(([groupKey, groupItems]) => {
                    const metaKey = sortBy === 'year' ? `decade:${groupKey}` : `${sortBy}:${groupKey}`;
                    const meta = metadata[metaKey] || metadata[groupKey]; // Fallback for direct key match

                    return (
                        <div key={groupKey} className="space-y-4">
                            {/* Section Header */}
                            <div className="flex items-center gap-3 pb-2 border-b border-gray-100 dark:border-white/5">
                                {meta?.assetUrl ? (
                                    <div className="relative w-8 h-8 md:w-10 md:h-10">
                                        <Image src={meta.assetUrl} alt={groupKey} fill className="object-contain" />
                                    </div>
                                ) : (
                                    <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-gray-500">
                                        {sortBy === 'type' && <Music size={20} />}
                                        {sortBy === 'brand' && <Tag size={20} />}
                                        {sortBy === 'year' && <Calendar size={20} />}
                                    </div>
                                )}
                                <h2 className="text-xl md:text-2xl font-bold tracking-tight">
                                    {meta?.label || groupKey.replace('_', ' ')}
                                    <span className="text-sm font-normal text-gray-400 ml-2">({groupItems.length})</span>
                                </h2>
                            </div>

                            {/* Grid/List for this Group */}
                            <motion.div
                                variants={container}
                                initial="hidden"
                                whileInView="show"
                                viewport={{ once: true, margin: "-50px" }}
                                className={cn(
                                    "grid gap-4",
                                    viewMode === 'grid'
                                        ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10"
                                        : "grid-cols-1"
                                )}
                            >
                                {groupItems.map((inst) => (
                                    <motion.div key={inst._id} variants={itemVariant} layout>
                                        <InstrumentCard inst={inst} variant={viewMode} />
                                    </motion.div>
                                ))}
                            </motion.div>
                        </div>
                    );
                })
            ) : (
                // RENDER NORMAL (Flat)
                <motion.div
                    key={viewMode}
                    variants={container}
                    initial="hidden"
                    animate="show"
                    className={cn(
                        "grid gap-4 py-4",
                        viewMode === 'grid'
                            ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10"
                            : "grid-cols-1"
                    )}
                >
                    <AnimatePresence mode="popLayout">
                        {instruments.map((inst) => (
                            <motion.div
                                key={inst._id}
                                variants={itemVariant}
                                layout
                            >
                                <InstrumentCard inst={inst} variant={viewMode} />
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {instruments.length === 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="col-span-full"
                        >
                            <EmptyState
                                title="No se encontraron instrumentos"
                                description="Prueba con otros términos de búsqueda o añade una nueva joya a tu catálogo."
                                actionLabel="Añadir Instrumento"
                                actionHref="/instruments/new"
                                icon="🎸"
                            />
                        </motion.div>
                    )}
                </motion.div>
            )}
        </div>
    );
}
