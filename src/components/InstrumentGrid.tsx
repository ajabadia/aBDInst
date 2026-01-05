'use client';

import { motion, AnimatePresence, Variants } from 'framer-motion';
import InstrumentCard from '@/components/InstrumentCard';
import EmptyState from '@/components/EmptyState';
import VirtualizedInstrumentGrid from './VirtualizedInstrumentGrid';

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

    // Performance Optimization: Use Virtualization for large lists (>100 items)
    if (instruments.length > 100) {
        return <VirtualizedInstrumentGrid instruments={instruments} />;
    }

    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 py-4"
        >
            <AnimatePresence mode="popLayout">
                {instruments.map((inst) => (
                    <motion.div
                        key={inst._id}
                        variants={itemVariant}
                        layout
                    >
                        <InstrumentCard inst={inst} />
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
    );
}
