"use client";

import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Filter, X, ArrowDownAZ, ArrowUpAZ, Calendar, Tag, Music } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const CATEGORIES = ['Synthesizer', 'Drum Machine', 'Groovebox', 'Eurorack Module', 'Effect', 'Mixer', 'Controller', 'Guitar', 'Software', 'Workstation', 'Utility', 'Other'];

const SORT_OPTIONS = [
    { id: 'brand', label: 'Marca', icon: Tag },
    { id: 'model', label: 'Nombre', icon: ArrowDownAZ },
    { id: 'year', label: 'Año', icon: Calendar },
    { id: 'type', label: 'Tipo', icon: Music },
];

export default function InstrumentFilter() {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const { replace } = useRouter();
    const [isOpen, setIsOpen] = useState(false);

    const handleFilter = (key: string, value: string | null) => {
        const params = new URLSearchParams(searchParams?.toString());
        if (value) {
            params.set(key, value);
        } else {
            params.delete(key);
        }
        replace(`${pathname}?${params.toString()}`, { scroll: false });
    };

    const toggleSort = (field: string) => {
        const currentSort = searchParams?.get('sortBy') || 'brand';
        const currentOrder = searchParams?.get('sortOrder') || 'asc';

        if (currentSort === field) {
            handleFilter('sortOrder', currentOrder === 'asc' ? 'desc' : 'asc');
        } else {
            handleFilter('sortBy', field);
            handleFilter('sortOrder', 'asc');
        }
    };

    const clearFilters = () => {
        replace(`${pathname}`);
        setIsOpen(false);
    };

    const currentCategory = searchParams?.get('category');
    const sortBy = searchParams?.get('sortBy') || 'brand';
    const sortOrder = searchParams?.get('sortOrder') || 'asc';
    const hasFilters = !!currentCategory || !!searchParams?.get('query');

    return (
        <div className="mb-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
                {/* Left: Filter Toggle */}
                <div className="flex items-center gap-2">
                    <Button
                        variant={isOpen ? "primary" : "secondary"}
                        size="sm"
                        icon={Filter}
                        onClick={() => setIsOpen(!isOpen)}
                        className={cn(isOpen && "shadow-apple-glow")}
                    >
                        Filtros {hasFilters && <span className="ml-1 flex h-1.5 w-1.5 rounded-full bg-white animate-pulse" />}
                    </Button>

                    {hasFilters && (
                        <Button variant="ghost" size="sm" onClick={clearFilters} className="text-ios-red font-bold">
                            Limpiar
                        </Button>
                    )}
                </div>

                {/* Right: Sort Controls (Apple Segmented Control Style) */}
                <div className="flex items-center gap-1 p-1 bg-black/5 dark:bg-white/5 rounded-xl border border-black/5 dark:border-white/5 overflow-x-auto no-scrollbar">
                    {SORT_OPTIONS.map((option) => (
                        <button
                            key={option.id}
                            onClick={() => toggleSort(option.id)}
                            className={cn(
                                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-semibold transition-all whitespace-nowrap",
                                sortBy === option.id
                                    ? "bg-white dark:bg-white/15 text-ios-blue dark:text-white shadow-sm"
                                    : "text-gray-500 hover:text-gray-900 dark:hover:text-gray-300"
                            )}
                        >
                            <option.icon size={14} className={cn("stroke-[2.5px]", sortBy === option.id ? "text-ios-blue dark:text-white" : "text-gray-400")} />
                            {option.label}
                            {sortBy === option.id && (
                                <span className="text-[10px] font-bold opacity-70">
                                    {sortOrder === 'asc' ? '↑' : '↓'}
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Filter Panel (Apple Menu Style) */}
            {isOpen && (
                <div className="glass-panel rounded-[1.5rem] p-6 shadow-apple-lg animate-in fade-in zoom-in-95 duration-200 z-10">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="apple-label m-0">Categorías</h3>
                        <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="rounded-full">
                            <X size={18} />
                        </Button>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => handleFilter('category', null)}
                            className={cn(
                                "px-4 py-2 rounded-xl text-sm font-semibold transition-all border",
                                !currentCategory
                                    ? "bg-ios-blue text-white border-ios-blue shadow-md shadow-ios-blue/20"
                                    : "bg-white dark:bg-white/5 text-gray-600 dark:text-gray-400 border-black/5 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/10"
                            )}
                        >
                            Todas
                        </button>
                        {CATEGORIES.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => handleFilter('category', cat)}
                                className={cn(
                                    "px-4 py-2 rounded-xl text-sm font-semibold transition-all border",
                                    currentCategory === cat
                                        ? "bg-ios-blue text-white border-ios-blue shadow-md shadow-ios-blue/20"
                                        : "bg-white dark:bg-white/5 text-gray-600 dark:text-gray-400 border-black/5 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/10"
                                )}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
