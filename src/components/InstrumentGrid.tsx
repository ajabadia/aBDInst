'use client';

import { motion, AnimatePresence, Variants } from 'framer-motion';
import InstrumentCard from '@/components/InstrumentCard';
import EmptyState from '@/components/EmptyState';
import VirtualizedInstrumentGrid from './VirtualizedInstrumentGrid';

import { useState } from 'react';
import { LayoutGrid, List } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './ui/Button';

interface InstrumentGridProps {
    instruments: any[];
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

export default function InstrumentGrid({ instruments }: InstrumentGridProps) {
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    // Performance Optimization: Use Virtualization for large lists (>100 items)
    if (instruments.length > 100) {
        return <VirtualizedInstrumentGrid instruments={instruments} />;
    }

    return (
        <div className="space-y-4">
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

            <motion.div
                key={viewMode}
                variants={container}
                initial="hidden"
                animate="show"
                className={cn(
                    "grid gap-4 py-4",
                    viewMode === 'grid'
                        ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10"
                        : "grid-cols-1 max-w-4xl mx-auto"
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
        </div>
    );
}
