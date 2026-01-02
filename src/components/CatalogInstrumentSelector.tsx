'use client';

import { useState } from 'react';
import { X, Check } from 'lucide-react';
import Image from 'next/image';

interface CatalogInstrumentSelectorProps {
    instruments: any[];
    selectedIds: string[];
    onSelectionChange: (ids: string[]) => void;
    maxSelection?: number;
}

export default function CatalogInstrumentSelector({
    instruments,
    selectedIds,
    onSelectionChange,
    maxSelection = 4
}: CatalogInstrumentSelectorProps) {
    const toggleSelection = (id: string) => {
        if (selectedIds.includes(id)) {
            onSelectionChange(selectedIds.filter(selectedId => selectedId !== id));
        } else {
            if (selectedIds.length < maxSelection) {
                onSelectionChange([...selectedIds, id]);
            }
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">
                    Selecciona instrumentos ({selectedIds.length}/{maxSelection})
                </h3>
                {selectedIds.length > 0 && (
                    <button
                        onClick={() => onSelectionChange([])}
                        className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                    >
                        Limpiar selección
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[60vh] overflow-y-auto">
                {instruments.map((instrument) => {
                    const isSelected = selectedIds.includes(instrument._id);
                    const isDisabled = !isSelected && selectedIds.length >= maxSelection;

                    return (
                        <button
                            key={instrument._id}
                            onClick={() => !isDisabled && toggleSelection(instrument._id)}
                            disabled={isDisabled}
                            className={`relative p-4 rounded-2xl border-2 transition-all text-left ${isSelected
                                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                                    : isDisabled
                                        ? 'border-gray-200 dark:border-gray-700 opacity-50 cursor-not-allowed'
                                        : 'border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-600'
                                }`}
                        >
                            {/* Selection Badge */}
                            {isSelected && (
                                <div className="absolute top-2 right-2 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                                    <Check size={16} className="text-white" />
                                </div>
                            )}

                            {/* Image */}
                            <div className="aspect-video rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 mb-3">
                                {instrument.genericImages?.[0] ? (
                                    <Image
                                        src={instrument.genericImages[0]}
                                        alt={`${instrument.brand} ${instrument.model}`}
                                        width={300}
                                        height={200}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                        Sin imagen
                                    </div>
                                )}
                            </div>

                            {/* Info */}
                            <h4 className="font-bold text-sm mb-1">
                                {instrument.brand} {instrument.model}
                            </h4>
                            <p className="text-xs text-gray-500">
                                {instrument.type} • {instrument.years?.[0] || 'N/A'}
                            </p>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
