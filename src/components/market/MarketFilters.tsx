'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { useState, useEffect } from 'react';
import { Slider } from '@/components/ui/Slider'; // Assuming we have one or standard input
import { Search } from 'lucide-react';

export default function MarketFilters() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [minPrice, setMinPrice] = useState(searchParams?.get('minPrice') || '');
    const [maxPrice, setMaxPrice] = useState(searchParams?.get('maxPrice') || '');
    const [condition, setCondition] = useState(searchParams?.get('condition') || '');
    const [searchTerm, setSearchTerm] = useState(searchParams?.get('q') || '');

    // Debounce search
    useEffect(() => {
        const timeout = setTimeout(() => {
            applyFilters();
        }, 800);
        return () => clearTimeout(timeout);
    }, [searchTerm, minPrice, maxPrice, condition]);

    function applyFilters() {
        const params = new URLSearchParams();
        if (searchTerm) params.set('q', searchTerm);
        if (minPrice) params.set('minPrice', minPrice);
        if (maxPrice) params.set('maxPrice', maxPrice);
        if (condition) params.set('condition', condition);

        router.push(`/marketplace?${params.toString()}`);
    }

    return (
        <div className="space-y-8 sticky top-24">

            {/* Search */}
            <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar marca, modelo..."
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-100 dark:bg-white/5 border-transparent focus:bg-white focus:ring-2 ring-ios-blue outline-none transition-all"
                />
            </div>

            {/* Price Range */}
            <div className="space-y-3">
                <h3 className="font-bold text-sm uppercase tracking-wide text-gray-400">Precio (€)</h3>
                <div className="flex gap-2">
                    <input
                        type="number"
                        placeholder="Min"
                        value={minPrice}
                        onChange={(e) => setMinPrice(e.target.value)}
                        className="w-1/2 p-2 rounded-lg border dark:bg-black/20 dark:border-white/10"
                    />
                    <input
                        type="number"
                        placeholder="Max"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                        className="w-1/2 p-2 rounded-lg border dark:bg-black/20 dark:border-white/10"
                    />
                </div>
            </div>

            {/* Condition */}
            <div className="space-y-3">
                <h3 className="font-bold text-sm uppercase tracking-wide text-gray-400">Estado</h3>
                <div className="space-y-2">
                    {['mint', 'excellent', 'good', 'fair'].map(c => (
                        <label key={c} className="flex items-center gap-2 cursor-pointer group">
                            <input
                                type="radio"
                                name="condition"
                                checked={condition === c}
                                onChange={() => setCondition(c)}
                                className="accent-ios-blue w-4 h-4"
                            />
                            <span className="capitalize group-hover:text-ios-blue transition-colors text-sm font-medium">{c}</span>
                        </label>
                    ))}
                    <label className="flex items-center gap-2 cursor-pointer group">
                        <input
                            type="radio"
                            name="condition"
                            checked={condition === ''}
                            onChange={() => setCondition('')}
                            className="accent-ios-blue w-4 h-4"
                        />
                        <span className="group-hover:text-ios-blue transition-colors text-sm font-medium">Todos</span>
                    </label>
                </div>
            </div>

            <Button variant="outline" className="w-full" onClick={() => {
                setMinPrice(''); setMaxPrice(''); setCondition(''); setSearchTerm('');
            }}>
                Limpiar Filtros
            </Button>
        </div>
    );
}
