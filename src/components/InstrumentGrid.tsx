'use client';

import { motion, AnimatePresence } from 'framer-motion';
import InstrumentCard from '@/components/InstrumentCard';
import EmptyState from '@/components/EmptyState';

interface InstrumentGridProps {
    instruments: any[];
}

export default function InstrumentGrid({ instruments }: InstrumentGridProps) {
    return (
        <motion.div
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10"
        >
            <AnimatePresence mode="popLayout">
                {instruments.map((inst) => (
                    <motion.div
                        key={inst._id}
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.3 }}
                    >
                        <InstrumentCard inst={inst} />
                    </motion.div>
                ))}
            </AnimatePresence>

            {instruments.length === 0 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
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
