'use client';

import { motion, AnimatePresence, Variants } from 'framer-motion';
import InstrumentCard from '@/components/InstrumentCard';
import EmptyState from '@/components/EmptyState';
import VirtualizedInstrumentGrid from './VirtualizedInstrumentGrid';

import { useState, useMemo } from 'react';
import { LayoutGrid, List, Tag, Calendar, Music } from 'lucide-react';
import { cn } from '@/lib/utils';
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

    if (instruments.length > 100 && !groupedData) {
        return <VirtualizedInstrumentGrid instruments={instruments} />;
    }

    return (
        <div className="space-y-8">
            <div className="flex justify-end mb-4">
                <div className="bg-white/50 dark:bg-black/20 backdrop-blur-md p-1 rounded-xl flex gap-1 border border-black/5 dark:border-white/5">
                    <button onClick={() => setViewMode('grid')} className={cn("p-2 rounded-lg transition-all", viewMode === 'grid' ? "bg-white dark:bg-white/10 shadow-sm text-ios-blue" : "text-gray-400")}>
                        <LayoutGrid size={20} />
                    </button>
                    <button onClick={() => setViewMode('list')} className={cn("p-2 rounded-lg transition-all", viewMode === 'list' ? "bg-white dark:bg-white/10 shadow-sm text-ios-blue" : "text-gray-400")}>
                        <List size={20} />
                    </button>
                </div>
            </div>

            {groupedData ? (
                Object.entries(groupedData).map(([groupKey, groupItems]) => {
                    // NORMALIZACIÓN PARA EL MATCH
                    const normalizedKey = groupKey.toLowerCase().trim();
                    const typeKey = sortBy === 'year' ? 'decade' : sortBy;
                    
                    const meta = metadata[typeKey]?.[normalizedKey];

                    return (
                        <div key={groupKey} className="space-y-6 pt-4">
                            <div className="flex items-center gap-4 pb-4 border-b border-black/5 dark:border-white/5">
                                {meta?.assetUrl ? (
                                    <div className="relative w-10 h-10 md:w-14 md:h-14 bg-white dark:bg-white/5 rounded-2xl p-2 shadow-apple-sm border border-black/5 flex items-center justify-center overflow-hidden">
                                        <Image 
                                            src={meta.assetUrl} 
                                            alt={groupKey} 
                                            fill 
                                            className="object-contain p-2 transition-transform hover:scale-110 duration-500" 
                                        />
                                    </div>
                                ) : (
                                    <div className="p-3 bg-black/5 dark:bg-white/10 rounded-2xl text-gray-400">
                                        {sortBy === 'type' && <Music size={24} />}
                                        {sortBy === 'brand' && <Tag size={24} />}
                                        {sortBy === 'year' && <Calendar size={24} />}
                                    </div>
                                )}
                                <div className="space-y-0.5">
                                    <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900 dark:text-white leading-tight">
                                        {meta?.label || groupKey}
                                    </h2>
                                    <p className="text-[10px] font-black text-ios-blue uppercase tracking-[0.2em] opacity-60">
                                        {groupItems.length} Instrumentos
                                    </p>
                                </div>
                            </div>

                            <motion.div
                                variants={container}
                                initial="hidden"
                                whileInView="show"
                                viewport={{ once: true, margin: "-50px" }}
                                className={cn("grid gap-4", viewMode === 'grid' ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10" : "grid-cols-1")}
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
                <motion.div key={viewMode} variants={container} initial="hidden" animate="show" className={cn("grid gap-4 py-4", viewMode === 'grid' ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10" : "grid-cols-1")}>
                    <AnimatePresence mode="popLayout">
                        {instruments.map((inst) => (
                            <motion.div key={inst._id} variants={itemVariant} layout>
                                <InstrumentCard inst={inst} variant={viewMode} />
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </motion.div>
            )}
        </div>
    );
}
