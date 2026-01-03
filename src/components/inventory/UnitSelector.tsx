'use client';

import { useState } from 'react';
import { Package, Check, Calendar } from 'lucide-react';
import { format } from 'date-fns';

export default function UnitSelector({ units, selectedId, onSelect }: any) {
    if (!units || units.length <= 1) return null;

    return (
        <div className="mb-8">
            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Tus Unidades ({units.length})</h3>
            <div className="flex gap-3 overflow-x-auto pb-2">
                {units.map((unit: any, idx: number) => {
                    const isSelected = unit._id === selectedId;
                    return (
                        <button
                            key={unit._id}
                            onClick={() => onSelect(unit._id)}
                            className={`flex flex-col items-start p-3 rounded-xl border min-w-[140px] transition-all ${isSelected
                                    ? 'bg-blue-50 border-blue-200 shadow-sm ring-1 ring-blue-200 dark:bg-blue-900/20 dark:border-blue-800'
                                    : 'bg-white border-gray-100 dark:bg-gray-800 dark:border-gray-700 hover:border-gray-300'
                                }`}
                        >
                            <div className="flex w-full justify-between items-start mb-2">
                                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-700 text-xs font-mono font-medium text-gray-600 dark:text-gray-300">
                                    #{idx + 1}
                                </span>
                                {isSelected && <Check size={14} className="text-blue-600" />}
                            </div>

                            <div className="text-left">
                                <p className="text-xs font-medium text-gray-900 dark:text-gray-100 truncate w-full">
                                    {unit.inventorySerial || unit.active ? 'Activo' : 'Archivado'}
                                </p>
                                <p className="text-[10px] text-gray-500 flex items-center gap-1 mt-0.5">
                                    <Calendar size={10} />
                                    {unit.acquisition?.date ? format(new Date(unit.acquisition.date), 'yyyy') : 'N/A'}
                                </p>
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
