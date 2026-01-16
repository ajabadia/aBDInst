'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Filter, MapPin } from 'lucide-react';

interface CollectionFilterProps {
    availableLocations?: string[];
    showTitle?: boolean;
}

export default function CollectionFilter({ availableLocations = [], showTitle = true }: CollectionFilterProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const handleFilter = (key: string, value: string | null) => {
        const params = new URLSearchParams(searchParams?.toString());
        if (value) {
            params.set(key, value);
        } else {
            params.delete(key);
        }
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
    };

    const conditions = ['Mint', 'Excellent', 'Good', 'Fair', 'Poor', 'Non-Functional'];

    return (
        <div className={cn(
            "flex flex-col gap-4",
            !showTitle && "gap-2"
        )}>
            {showTitle && (
                <div className="flex items-center gap-2 mb-2">
                    <Filter size={16} className="text-ios-blue" />
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white">Filtrar Colección</h4>
                </div>
            )}

            <div className="flex flex-wrap items-center gap-6">
                {/* Condition Filter */}
                <div className="flex items-center gap-3">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">Estado</span>
                    <div className="flex flex-wrap gap-1.5">
                        <button
                            onClick={() => handleFilter('condition', null)}
                            className={cn(
                                "px-3 py-1 rounded-lg text-[11px] font-bold transition-all border",
                                !searchParams?.get('condition')
                                    ? "bg-gray-900 text-white border-gray-900 dark:bg-white dark:text-black"
                                    : "bg-white dark:bg-white/5 text-gray-500 border-black/5 dark:border-white/10 hover:border-ios-blue/30"
                            )}
                        >
                            Todos
                        </button>
                        {conditions.map((cond) => (
                            <button
                                key={cond}
                                onClick={() => handleFilter('condition', cond)}
                                className={cn(
                                    "px-3 py-1 rounded-lg text-[11px] font-bold transition-all border",
                                    searchParams?.get('condition') === cond
                                        ? "bg-ios-blue text-white border-ios-blue"
                                        : "bg-white dark:bg-white/5 text-gray-500 border-black/5 dark:border-white/10 hover:border-ios-blue/30"
                                )}
                            >
                                {cond}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Vertical Divider */}
                <div className="hidden md:block w-px h-8 bg-black/5 dark:bg-white/10" />

                {/* Location Filter */}
                <div className="flex items-center gap-3 flex-1 min-w-[200px]">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">Ubicación</span>
                    <div className="relative flex-1 max-w-xs">
                        <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar ubicación..."
                            defaultValue={searchParams?.get('location') || ''}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    handleFilter('location', e.currentTarget.value);
                                }
                            }}
                            onBlur={(e) => handleFilter('location', e.target.value)}
                            className="w-full pl-9 pr-4 py-1.5 rounded-xl bg-gray-50 dark:bg-white/5 border border-black/5 dark:border-white/10 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-ios-blue/50"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
