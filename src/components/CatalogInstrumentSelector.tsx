'use client';

import { useState, useMemo } from 'react';
import { X, Check, Box, Tag, Calendar, Music } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface CatalogInstrumentSelectorProps {
    instruments: any[];
    selectedIds: string[];
    onSelectionChange: (ids: string[]) => void;
    searchQuery?: string;
    maxSelection?: number;
}

export default function CatalogInstrumentSelector({
    instruments,
    selectedIds,
    onSelectionChange,
    searchQuery = '',
    maxSelection = 4
}: CatalogInstrumentSelectorProps) {
    
    // Internal filtering based on search query
    const filteredInstruments = useMemo(() => {
        if (!searchQuery) return instruments;
        const lowQuery = searchQuery.toLowerCase();
        return instruments.filter(inst => 
            inst.brand.toLowerCase().includes(lowQuery) || 
            inst.model.toLowerCase().includes(lowQuery) ||
            inst.type.toLowerCase().includes(lowQuery)
        );
    }, [instruments, searchQuery]);

    const toggleSelection = (id: string) => {
        if (selectedIds.includes(id)) {
            onSelectionChange(selectedIds.filter(selectedId => selectedId !== id));
        } else {
            if (selectedIds.length < maxSelection) {
                onSelectionChange([...selectedIds, id]);
            }
        }
    };

    if (filteredInstruments.length === 0) {
        return (
            <div className="py-20 text-center space-y-4">
                <Box className="w-12 h-12 mx-auto text-gray-200" />
                <p className="text-gray-400 font-medium">No se encontraron resultados para tu búsqueda.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar p-2">
            {filteredInstruments.map((instrument) => {
                const isSelected = selectedIds.includes(instrument._id);
                const isDisabled = !isSelected && selectedIds.length >= maxSelection;

                return (
                    <button
                        key={instrument._id}
                        onClick={() => !isDisabled && toggleSelection(instrument._id)}
                        disabled={isDisabled}
                        className={cn(
                            "relative flex flex-col p-4 rounded-3xl border-2 transition-all duration-300 text-left group overflow-hidden bg-white dark:bg-white/5 shadow-sm",
                            isSelected
                                ? "border-ios-blue bg-ios-blue/[0.03] dark:bg-ios-blue/10 scale-[0.98] shadow-inner"
                                : isDisabled
                                    ? "border-transparent opacity-40 grayscale cursor-not-allowed"
                                    : "border-transparent hover:border-ios-blue/20 hover:scale-[1.02] hover:shadow-md"
                        )}
                    >
                        {/* Selection Indicator */}
                        <div className={cn(
                            "absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-500",
                            isSelected ? "bg-ios-blue text-white scale-100 rotate-0" : "bg-black/5 dark:bg-white/10 scale-0 rotate-90"
                        )}>
                            <Check size={14} className="stroke-[3]" />
                        </div>

                        {/* Image Thumbnail */}
                        <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-black/5 mb-4 relative">
                            {instrument.genericImages?.[0] ? (
                                <Image
                                    src={instrument.genericImages[0]}
                                    alt={`${instrument.brand} ${instrument.model}`}
                                    fill
                                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-300">
                                    <Music size={32} />
                                </div>
                            )}
                        </div>

                        {/* Info Block */}
                        <div className="space-y-1">
                            <p className="text-[10px] font-black text-ios-blue uppercase tracking-[0.15em] mb-1">{instrument.brand}</p>
                            <h4 className="font-bold text-gray-900 dark:text-white truncate pr-6">{instrument.model}</h4>
                            
                            <div className="flex items-center gap-2 pt-2">
                                <span className="text-[9px] font-bold px-2 py-0.5 bg-black/5 dark:bg-white/10 rounded-md text-gray-500 uppercase tracking-widest">
                                    {instrument.type}
                                </span>
                                {instrument.years?.[0] && (
                                    <span className="text-[9px] font-bold px-2 py-0.5 bg-ios-orange/10 text-ios-orange rounded-md uppercase tracking-widest border border-ios-orange/10">
                                        {instrument.years[0]}
                                    </span>
                                )}
                            </div>
                        </div>
                    </button>
                );
            })}
        </div>
    );
}
