'use client';

import { useState, useMemo } from 'react';
import { GitCompare, Download, RotateCcw, Box, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import CatalogInstrumentSelector from '@/components/CatalogInstrumentSelector';
import CatalogComparisonTable from '@/components/CatalogComparisonTable';
import { cn } from '@/lib/utils';
import { Input } from './ui/Input';
import InstrumentFilter from './InstrumentFilter';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

interface CatalogCompareClientProps {
    instruments: any[];
}

export default function CatalogCompareClient({ instruments }: CatalogCompareClientProps) {
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [showComparison, setShowComparison] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const selectedItems = useMemo(() => 
        instruments.filter(inst => selectedIds.includes(inst._id)),
    [selectedIds, instruments]);

    const handleCompare = () => {
        if (selectedIds.length >= 2) {
            setShowComparison(true);
        }
    };

    const handleReset = () => {
        setShowComparison(false);
        setSelectedIds([]);
    };

    const toggleSelection = (id: string) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter(sid => sid !== id));
        } else {
            if (selectedIds.length < 4) {
                setSelectedIds([...selectedIds, id]);
            }
        }
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
                <div className="space-y-10">
                    
                    {/* --- TOP TRAY: SELECTED ITEMS (Persistent) --- */}
                    <div className={cn(
                        "glass-panel rounded-[2rem] p-6 border-ios-blue/20 transition-all duration-500 min-h-[140px] flex items-center justify-center",
                        selectedIds.length > 0 ? "bg-ios-blue/[0.03]" : "bg-black/[0.02] dark:bg-white/[0.02]"
                    )}>
                        {selectedIds.length === 0 ? (
                            <div className="text-center space-y-1">
                                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Bandeja de Selección</p>
                                <p className="text-xs text-gray-400">Selecciona hasta 4 instrumentos de la lista inferior</p>
                            </div>
                        ) : (
                            <div className="flex flex-wrap gap-4 w-full">
                                <AnimatePresence>
                                    {selectedItems.map(item => (
                                        <motion.div 
                                            key={item._id}
                                            initial={{ opacity: 0, scale: 0.8, x: -20 }}
                                            animate={{ opacity: 1, scale: 1, x: 0 }}
                                            exit={{ opacity: 0, scale: 0.8 }}
                                            className="relative flex items-center gap-3 bg-white dark:bg-white/10 p-2 pr-4 rounded-2xl shadow-sm border border-black/5 dark:border-white/10 group"
                                        >
                                            <div className="w-12 h-12 rounded-xl overflow-hidden bg-black/5 relative">
                                                {item.genericImages?.[0] && <Image src={item.genericImages[0]} alt="" fill className="object-cover" />}
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-ios-blue uppercase tracking-tighter leading-none mb-1">{item.brand}</p>
                                                <p className="text-xs font-bold truncate max-w-[120px]">{item.model}</p>
                                            </div>
                                            <button 
                                                onClick={() => toggleSelection(item._id)}
                                                className="absolute -top-2 -right-2 bg-ios-red text-white rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X size={12} />
                                            </button>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                                
                                {selectedIds.length >= 2 && (
                                    <Button 
                                        onClick={handleCompare} 
                                        className="ml-auto shadow-apple-glow px-8"
                                        icon={GitCompare}
                                    >
                                        Comparar ahora
                                    </Button>
                                )}
                            </div>
                        )}
                    </div>

                    {/* --- SEARCH & FILTERS --- */}
                    <div className="space-y-6">
                        <div className="max-w-xl mx-auto">
                            <Input 
                                placeholder="Filtrar catálogo para comparar..." 
                                icon={Search}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="h-14 rounded-2xl shadow-sm"
                            />
                        </div>
                        {/* We use a simplified version of InstrumentFilter for client-side state if needed, 
                            but here we can just use the instruments filter logic */}
                    </div>

                    {/* --- SELECTOR GRID --- */}
                    <CatalogInstrumentSelector
                        instruments={instruments}
                        selectedIds={selectedIds}
                        onSelectionChange={setSelectedIds}
                        searchQuery={searchQuery}
                        maxSelection={4}
                    />
                </div>
            ) : (
                /* COMPARISON MODE (Unchanged logic, just visuals) */
                <div className="space-y-8">
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-6 px-4">
                        <div className="flex items-center gap-3">
                            <span className="px-3 py-1 bg-ios-blue text-white text-[10px] font-bold rounded-full uppercase tracking-widest">Reporte Activo</span>
                            <h2 className="text-2xl font-bold tracking-tight">Comparando {selectedItems.length} modelos</h2>
                        </div>
                        <div className="flex items-center gap-3 w-full sm:w-auto">
                            <Button variant="secondary" size="sm" icon={RotateCcw} onClick={handleReset} className="flex-1 sm:flex-none">Nueva</Button>
                            <Button variant="secondary" size="sm" icon={Download} className="flex-1 sm:flex-none">Exportar</Button>
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
