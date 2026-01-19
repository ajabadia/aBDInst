"use client";

'use client';

import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Filter, X, ArrowDownAZ, ArrowUpAZ, Calendar, Tag, Music, Users, Search as SearchIcon, Plus } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const CATEGORIES = ['Synthesizer', 'Drum Machine', 'Groovebox', 'Eurorack Module', 'Effect', 'Mixer', 'Controller', 'Guitar', 'Software', 'Workstation', 'Utility', 'Other'];

const SORT_OPTIONS = [
    { id: 'brand', label: 'Marca', icon: Tag },
    { id: 'model', label: 'Nombre', icon: ArrowDownAZ },
    { id: 'artist', label: 'Artista', icon: Users },
    { id: 'year', label: 'Año', icon: Calendar },
    { id: 'type', label: 'Tipo', icon: Music },
];

export default function InstrumentFilter({ availableBrands = [], allArtists = [] }: { availableBrands?: string[], allArtists?: any[] }) {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const { replace } = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [artistSearch, setArtistSearch] = useState('');

    const handleFilter = (key: string, value: string | null) => {
        const params = new URLSearchParams(searchParams?.toString());
        if (value) {
            params.set(key, value);
        } else {
            params.delete(key);
        }
        replace(`${pathname}?${params.toString()}`, { scroll: false });
    };

    const handleArtistToggle = (artistKey: string) => {
        const params = new URLSearchParams(searchParams?.toString());
        const currentArtists = params.get('artists') ? params.get('artists')!.split(',') : [];

        let newArtists;
        if (currentArtists.includes(artistKey)) {
            newArtists = currentArtists.filter(k => k !== artistKey);
        } else {
            newArtists = [...currentArtists, artistKey];
        }

        if (newArtists.length > 0) {
            params.set('artists', newArtists.join(','));
        } else {
            params.delete('artists');
        }

        replace(`${pathname}?${params.toString()}`, { scroll: false });
    };

    const toggleSort = (field: string) => {
        const params = new URLSearchParams(searchParams?.toString());
        const currentSort = params.get('sortBy') || 'brand';
        const currentOrder = params.get('sortOrder') || 'asc';

        if (currentSort === field) {
            // Toggle order
            params.set('sortOrder', currentOrder === 'asc' ? 'desc' : 'asc');
        } else {
            // Set new sort field and reset order
            params.set('sortBy', field);
            params.set('sortOrder', 'asc');
        }

        replace(`${pathname}?${params.toString()}`, { scroll: false });
    };

    const clearFilters = () => {
        replace(`${pathname}`);
        setIsOpen(false);
    };

    const currentCategory = searchParams?.get('category');
    const currentBrand = searchParams?.get('brand');
    const sortBy = searchParams?.get('sortBy') || 'brand';
    const sortOrder = searchParams?.get('sortOrder') || 'asc';
    const activeArtistsKeys = searchParams?.get('artists') ? searchParams.get('artists')!.split(',') : [];
    const hasFilters = !!currentCategory || !!currentBrand || !!searchParams?.get('query') || activeArtistsKeys.length > 0;

    const filteredArtists = allArtists.filter(a =>
        a.label.toLowerCase().includes(artistSearch.toLowerCase()) ||
        a.key.toLowerCase().includes(artistSearch.toLowerCase())
    ).slice(0, 8); // Limits results to keep UI clean

    return (
        <div className="mb-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
                {/* Left: Filter Toggle */}
                <div className="flex items-center gap-2">
                    <Button
                        variant={isOpen ? "primary" : "secondary"}
                        size="sm"
                        icon={<Filter />}
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
                <div className="glass-panel rounded-[1.5rem] p-6 shadow-apple-lg animate-in fade-in zoom-in-95 duration-200 z-10 space-y-8">
                    <div className="flex items-center justify-between">
                        <h3 className="apple-label m-0 text-lg">Filtrar Colección</h3>
                        <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="rounded-full">
                            <X size={18} />
                        </Button>
                    </div>

                    {/* Brands Section */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Marcas</h4>
                            {currentBrand && (
                                <button onClick={() => handleFilter('brand', null)} className="text-[10px] font-bold text-ios-blue hover:underline uppercase">
                                    Limpiar
                                </button>
                            )}
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {availableBrands.map((brand) => (
                                <button
                                    key={brand}
                                    onClick={() => handleFilter('brand', currentBrand === brand ? null : brand)}
                                    className={cn(
                                        "px-3 py-1.5 rounded-lg text-xs font-bold transition-all border",
                                        currentBrand === brand
                                            ? "bg-ios-blue text-white border-ios-blue shadow-md shadow-ios-blue/20"
                                            : "bg-white dark:bg-white/5 text-gray-600 dark:text-gray-400 border-black/5 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/10"
                                    )}
                                >
                                    {brand}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="h-[1px] bg-black/5 dark:bg-white/5 w-full" />



                    <div className="h-[1px] bg-black/5 dark:bg-white/5 w-full" />

                    {/* Year Range Section */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Año de Lanzamiento</h4>
                            {(searchParams?.get('minYear') || searchParams?.get('maxYear')) && (
                                <button onClick={() => {
                                    const params = new URLSearchParams(searchParams?.toString());
                                    params.delete('minYear');
                                    params.delete('maxYear');
                                    replace(`${pathname}?${params.toString()}`, { scroll: false });
                                }} className="text-[10px] font-bold text-ios-blue hover:underline uppercase">
                                    Limpiar
                                </button>
                            )}
                        </div>
                        <div className="flex gap-4 items-center">
                            <div className="relative flex-1">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold">Desde</span>
                                <input
                                    type="number"
                                    min="1960"
                                    max="2030"
                                    placeholder="1970"
                                    value={searchParams?.get('minYear') || ''}
                                    onChange={(e) => handleFilter('minYear', e.target.value)}
                                    className="w-full pl-12 pr-3 py-2 rounded-xl bg-gray-50 dark:bg-white/5 border border-black/5 dark:border-white/10 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-ios-blue/50"
                                />
                            </div>
                            <span className="text-gray-300 font-bold">-</span>
                            <div className="relative flex-1">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold">Hasta</span>
                                <input
                                    type="number"
                                    min="1960"
                                    max="2030"
                                    placeholder="2025"
                                    value={searchParams?.get('maxYear') || ''}
                                    onChange={(e) => handleFilter('maxYear', e.target.value)}
                                    className="w-full pl-12 pr-3 py-2 rounded-xl bg-gray-50 dark:bg-white/5 border border-black/5 dark:border-white/10 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-ios-blue/50"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="h-[1px] bg-black/5 dark:bg-white/5 w-full" />

                    {/* Artists Multi-select Section */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Artistas Relacionados</h4>
                            {activeArtistsKeys.length > 0 && (
                                <button onClick={() => handleFilter('artists', null)} className="text-[10px] font-bold text-ios-blue hover:underline uppercase">
                                    Limpiar Todo
                                </button>
                            )}
                        </div>

                        {/* Search Input for Artists */}
                        <div className="relative">
                            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <input
                                type="text"
                                placeholder="Buscar artista (Kraftwerk, Depeche Mode...)"
                                value={artistSearch}
                                onChange={(e) => setArtistSearch(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-50 dark:bg-white/5 border border-black/5 dark:border-white/10 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-ios-blue/50"
                            />
                        </div>

                        {/* Search Results */}
                        {artistSearch && filteredArtists.length > 0 && (
                            <div className="flex flex-wrap gap-2 animate-in fade-in slide-in-from-top-1">
                                {filteredArtists.map((artist) => {
                                    const isActive = activeArtistsKeys.includes(artist.key);
                                    return (
                                        <button
                                            key={artist.key}
                                            onClick={() => {
                                                handleArtistToggle(artist.key);
                                                setArtistSearch('');
                                            }}
                                            className={cn(
                                                "px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2",
                                                isActive
                                                    ? "bg-ios-green text-white"
                                                    : "bg-black/5 dark:bg-white/10 text-gray-700 dark:text-gray-300 hover:bg-black/10"
                                            )}
                                        >
                                            {artist.label}
                                            {isActive ? <X size={12} /> : <Plus size={12} />}
                                        </button>
                                    );
                                })}
                            </div>
                        )}

                        {/* Tag/Pill display of active artists */}
                        {activeArtistsKeys.length > 0 && (
                            <div className="flex flex-wrap gap-2 pt-2">
                                {activeArtistsKeys.map(key => {
                                    const artist = allArtists.find(a => a.key === key);
                                    return (
                                        <div
                                            key={key}
                                            className="inline-flex items-center gap-1.5 pl-3 pr-2 py-1.5 bg-ios-blue/10 text-ios-blue rounded-full text-[11px] font-black uppercase tracking-wider shadow-sm border border-ios-blue/10"
                                        >
                                            {artist?.label || key}
                                            <button
                                                onClick={() => handleArtistToggle(key)}
                                                className="p-0.5 hover:bg-ios-blue/20 rounded-full transition-colors"
                                            >
                                                <X size={12} strokeWidth={3} />
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    <div className="h-[1px] bg-black/5 dark:bg-white/5 w-full" />

                    {/* Categories Section */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Categorías</h4>
                            {currentCategory && (
                                <button onClick={() => handleFilter('category', null)} className="text-[10px] font-bold text-ios-blue hover:underline uppercase">
                                    Limpiar
                                </button>
                            )}
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {CATEGORIES.map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => handleFilter('category', currentCategory === cat ? null : cat)}
                                    className={cn(
                                        "px-3 py-1.5 rounded-lg text-xs font-bold transition-all border",
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
                </div >
            )
            }
        </div >
    );
}
