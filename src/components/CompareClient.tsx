'use client';

import { useState } from 'react';
import { ArrowLeft, GitCompare, Download } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import InstrumentSelector from '@/components/InstrumentSelector';
import ComparisonTable from '@/components/ComparisonTable';

interface CompareClientProps {
    collection: any[];
}

export default function CompareClient({ collection }: CompareClientProps) {
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [showComparison, setShowComparison] = useState(false);

    const selectedItems = collection.filter(item => selectedIds.includes(item._id));

    const handleCompare = () => {
        if (selectedIds.length >= 2) {
            setShowComparison(true);
        }
    };

    const handleReset = () => {
        setShowComparison(false);
        setSelectedIds([]);
    };

    return (
        <>
            {/* Header */}
            <div className="flex items-center justify-between mb-12">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard">
                        <Button variant="secondary" icon={ArrowLeft}>
                            Volver
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-4xl font-bold tracking-tight">Comparador</h1>
                        <p className="text-gray-500">Compara hasta 4 instrumentos lado a lado</p>
                    </div>
                </div>
                {showComparison && (
                    <div className="flex gap-3">
                        <Button variant="secondary" onClick={handleReset}>
                            Nueva Comparación
                        </Button>
                        <Button variant="secondary" icon={Download}>
                            Exportar PDF
                        </Button>
                    </div>
                )}
            </div>

            {!showComparison ? (
                /* Selection Mode */
                <div className="bg-white/40 dark:bg-black/20 backdrop-blur-md rounded-[2rem] border border-gray-200/50 dark:border-white/10 p-8">
                    <InstrumentSelector
                        collection={collection}
                        selectedIds={selectedIds}
                        onSelectionChange={setSelectedIds}
                        maxSelection={4}
                    />

                    {/* Compare Button */}
                    <div className="mt-8 flex justify-center">
                        <Button
                            onClick={handleCompare}
                            disabled={selectedIds.length < 2}
                            icon={GitCompare}
                            className="px-8 py-4 text-lg"
                        >
                            Comparar {selectedIds.length > 0 && `(${selectedIds.length})`}
                        </Button>
                    </div>

                    {selectedIds.length === 1 && (
                        <p className="text-center text-sm text-gray-500 mt-4">
                            Selecciona al menos 2 instrumentos para comparar
                        </p>
                    )}
                </div>
            ) : (
                /* Comparison Mode */
                <div className="bg-white/40 dark:bg-black/20 backdrop-blur-md rounded-[2rem] border border-gray-200/50 dark:border-white/10 p-8">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold">
                            Comparando {selectedItems.length} instrumentos
                        </h2>
                    </div>

                    <ComparisonTable items={selectedItems} />
                </div>
            )}

            {/* Empty State */}
            {collection.length === 0 && (
                <div className="text-center py-20">
                    <GitCompare className="mx-auto h-16 w-16 text-gray-300 mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                        No hay instrumentos para comparar
                    </h3>
                    <p className="text-gray-500 mb-6">
                        Añade instrumentos a tu colección para poder compararlos
                    </p>
                    <Link href="/instruments">
                        <Button>Explorar Catálogo</Button>
                    </Link>
                </div>
            )}
        </>
    );
}
