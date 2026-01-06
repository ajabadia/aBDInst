'use client';

import { useState } from 'react';
import { GitCompare, Download, RotateCcw, Box, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import CatalogInstrumentSelector from '@/components/CatalogInstrumentSelector';
import CatalogComparisonTable from '@/components/CatalogComparisonTable';
import { cn } from '@/lib/utils';

interface CatalogCompareClientProps {
    instruments: any[];
}

export default function CatalogCompareClient({ instruments }: CatalogCompareClientProps) {
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [showComparison, setShowComparison] = useState(false);

    const selectedItems = instruments.filter(inst => selectedIds.includes(inst._id));

    const handleCompare = () => {
        if (selectedIds.length >= 2) {
            setShowComparison(true);
        }
    };

    const handleReset = () => {
        setShowComparison(false);
        setSelectedIds([]);
    };

    if (instruments.length === 0) {
        return (
            <div className="glass-panel rounded-[2.5rem] p-20 text-center border-dashed border-2 flex flex-col items-center">
                <Box className="w-16 h-16 text-gray-300 mb-6" />
                <h3 className="text-2xl font-bold tracking-tight mb-2">El catálogo está vacío</h3>
                <p className="text-gray-500 font-medium">No hay instrumentos disponibles para comparar.</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {!showComparison ? (
                /* SELECTION MODE */
                <div className="glass-panel rounded-[2.5rem] p-8 md:p-12 shadow-apple-lg border-black/5 dark:border-white/5">
                    <div className="flex items-center gap-3 mb-10 px-2">
                        <div className="w-2 h-2 rounded-full bg-ios-blue animate-pulse" />
                        <h2 className="apple-label m-0">Selección de Instrumentos (Max. 4)</h2>
                    </div>

                    <CatalogInstrumentSelector
                        instruments={instruments}
                        selectedIds={selectedIds}
                        onSelectionChange={setSelectedIds}
                        maxSelection={4}
                    />

                    {/* Compare Action */}
                    <div className="mt-12 flex flex-col items-center gap-4 border-t border-black/5 dark:border-white/5 pt-10">
                        <Button
                            onClick={handleCompare}
                            disabled={selectedIds.length < 2}
                            icon={GitCompare}
                            className={cn(
                                "px-12 h-16 text-lg transition-all duration-500",
                                selectedIds.length >= 2 ? "shadow-apple-glow" : "opacity-50"
                            )}
                        >
                            Generar Comparativa {selectedIds.length > 0 && `(${selectedIds.length})`}
                        </Button>
                        
                        {selectedIds.length === 1 && (
                            <p className="text-sm font-bold text-ios-orange uppercase tracking-wider animate-bounce">
                                Selecciona un instrumento más para continuar
                            </p>
                        )}
                    </div>
                </div>
            ) : (
                /* COMPARISON MODE */
                <div className="space-y-8">
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-6 px-4">
                        <div className="flex items-center gap-3">
                            <span className="px-3 py-1 bg-ios-blue text-white text-[10px] font-bold rounded-full uppercase tracking-widest">
                                Reporte Activo
                            </span>
                            <h2 className="text-2xl font-bold tracking-tight">Comparando {selectedItems.length} modelos</h2>
                        </div>
                        
                        <div className="flex items-center gap-3 w-full sm:w-auto">
                            <Button variant="secondary" size="sm" icon={RotateCcw} onClick={handleReset} className="flex-1 sm:flex-none">
                                Nueva
                            </Button>
                            <Button variant="secondary" size="sm" icon={Download} className="flex-1 sm:flex-none">
                                Exportar
                            </Button>
                        </div>
                    </div>

                    <div className="glass-panel rounded-[2.5rem] p-4 md:p-8 shadow-apple-lg overflow-hidden border-black/5 dark:border-white/5 bg-white/50 dark:bg-black/20">
                        <CatalogComparisonTable items={selectedItems} />
                    </div>
                </div>
            )}
        </div>
    );
}
