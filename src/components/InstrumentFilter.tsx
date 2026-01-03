'use client';

import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce';
import { Button } from '@/components/ui/Button';
import { Filter, X } from 'lucide-react';
import { useState } from 'react';

const CATEGORIES = ['Synthesizer', 'Drum Machine', 'Groovebox', 'Eurorack Module', 'Effect', 'Mixer', 'Controller', 'Guitar', 'Software', 'Workstation', 'Utility', 'Other'];

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
        replace(`${pathname}?${params.toString()}`);
    };

    const clearFilters = () => {
        replace(`${pathname}`);
        setIsOpen(false);
    };

    const currentCategory = searchParams?.get('category');
    const hasFilters = !!currentCategory || !!searchParams?.get('query');

    return (
        <div className="mb-8">
            <div className="flex items-center gap-2">
                <Button
                    variant="outline"
                    icon={Filter}
                    onClick={() => setIsOpen(!isOpen)}
                    className={isOpen ? 'bg-blue-50 text-blue-600 border-blue-200' : ''}
                >
                    Filtros {hasFilters && <span className="ml-1 flex h-2 w-2 rounded-full bg-blue-600" />}
                </Button>

                {hasFilters && (
                    <Button variant="ghost" onClick={clearFilters} className="text-gray-500 hover:text-red-500">
                        Limpiar
                    </Button>
                )}
            </div>

            {isOpen && (
                <div className="mt-4 glass-panel rounded-[1.5rem] p-6 shadow-apple-lg animate-in fade-in slide-in-from-top-2 z-10 relative">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-gray-900 dark:text-white">Filtrar por Categoría</h3>
                        <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-900">
                            <X size={18} />
                        </button>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => handleFilter('category', null)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${!currentCategory
                                ? 'bg-black text-white dark:bg-white dark:text-black'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300'
                                }`}
                        >
                            Todas
                        </button>
                        {CATEGORIES.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => handleFilter('category', cat)}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${currentCategory === cat
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300'
                                    }`}
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
