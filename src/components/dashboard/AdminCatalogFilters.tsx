'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Search, Filter, ArrowUpAZ, ArrowDownAZ, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';

const TYPES = ['Guitarra', 'Bajo', 'Teclado', 'Viento', 'Percusión', 'Otro']; // Reuse or fetch valid types

export default function AdminCatalogFilters() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    const [searchTerm, setSearchTerm] = useState(searchParams?.get('search') || '');

    // State derived from URL
    const currentStatus = searchParams?.get('status') || 'all';
    const currentType = searchParams?.get('type') || 'all';
    const currentSort = searchParams?.get('sort') || 'recent';

    const handleSearch = useDebouncedCallback((term: string) => {
        updateFilter('search', term);
    }, 400);

    const updateFilter = (key: string, value: string | null) => {
        const params = new URLSearchParams(searchParams?.toString());
        if (value && value !== 'all') {
            params.set(key, value);
        } else {
            params.delete(key);
        }

        // Reset page if filtering (if we had pagination, but useful hygiene)
        // params.delete('page'); 

        router.replace(`${pathname}?${params.toString()}`);
    };

    const clearFilters = () => {
        router.replace(pathname || '');
        setSearchTerm('');
    };

    const hasActiveFilters = currentStatus !== 'all' || currentType !== 'all' || currentSort !== 'recent' || searchTerm;

    return (
        <div className="bg-white dark:bg-white/5 p-4 rounded-2xl border border-gray-200 dark:border-white/10 space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
                {/* Search */}
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Buscar por marca, modelo o ID..."
                        className="w-full bg-gray-50 dark:bg-black/20 pl-10 pr-4 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-ios-blue/50 transition-all border border-transparent focus:border-ios-blue/30"
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            handleSearch(e.target.value);
                        }}
                    />
                </div>

                <div className="flex gap-2 items-center overflow-x-auto pb-2 md:pb-0">
                    {/* Status Filter */}
                    <div className="flex bg-gray-100 dark:bg-white/10 p-1 rounded-xl">
                        {['all', 'published', 'draft'].map(status => (
                            <button
                                key={status}
                                onClick={() => updateFilter('status', status)}
                                className={`px-3 py-1.5 text-xs font-bold rounded-lg capitalize transition-all ${currentStatus === status
                                    ? 'bg-white dark:bg-white/20 text-black dark:text-white shadow-sm'
                                    : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'
                                    }`}
                            >
                                {status === 'all' ? 'Todos' : status === 'published' ? 'Publicados' : 'Borradores'}
                            </button>
                        ))}
                    </div>

                    {/* Sort */}
                    <select
                        className="bg-gray-50 dark:bg-black/20 border-none rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-ios-blue/50 cursor-pointer outline-none"
                        value={currentSort}
                        onChange={(e) => updateFilter('sort', e.target.value)}
                    >
                        <option value="recent">Más Recientes</option>
                        <option value="oldest">Más Antiguos</option>
                        <option value="brand_asc">Marca (A-Z)</option>
                        <option value="brand_desc">Marca (Z-A)</option>
                    </select>

                    {/* Filter Reset */}
                    {hasActiveFilters && (
                        <Button variant="ghost" size="sm" onClick={clearFilters} className="text-red-500 hover:text-red-600 hover:bg-red-50 px-2">
                            <X size={16} />
                        </Button>
                    )}
                </div>
            </div>

            {/* Secondary Filters (Type) */}
            <div className="flex gap-2 flex-wrap">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest py-1.5">Tipo:</span>
                <button
                    onClick={() => updateFilter('type', 'all')}
                    className={`px-3 py-1 text-xs border rounded-full transition-all ${currentType === 'all'
                        ? 'bg-gray-900 text-white border-gray-900 dark:bg-white dark:text-black'
                        : 'bg-transparent text-gray-500 border-gray-200 dark:border-white/10 hover:border-gray-400'
                        }`}
                >
                    Todos
                </button>
                {TYPES.map(type => (
                    <button
                        key={type}
                        onClick={() => updateFilter('type', type)}
                        className={`px-3 py-1 text-xs border rounded-full transition-all ${currentType === type
                            ? 'bg-ios-blue text-white border-ios-blue'
                            : 'bg-transparent text-gray-500 border-gray-200 dark:border-white/10 hover:border-gray-400'
                            }`}
                    >
                        {type}
                    </button>
                ))}
            </div>
        </div>
    );
}
