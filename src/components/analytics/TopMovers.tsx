'use client';

import { useMemo } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import Link from 'next/link';

interface TopMoversProps {
    collection: any[];
}

export default function TopMovers({ collection }: TopMoversProps) {
    const movers = useMemo(() => {
        if (!collection || collection.length === 0) return [];

        return collection
            .map(item => {
                const cost = item.acquisition?.price || 0;
                const current = item.marketValue?.current?.value || cost;
                const profit = current - cost;
                const roi = cost > 0 ? (profit / cost) * 100 : 0;

                return {
                    id: item._id,
                    name: `${item.instrument?.brand} ${item.instrument?.model}`,
                    image: item.images?.find((img: any) => img.isPrimary)?.url || item.instrument?.genericImages?.[0],
                    cost,
                    current,
                    profit,
                    roi
                };
            })
            // Filter only items with price change
            .filter(item => Math.abs(item.profit) > 0)
            .sort((a, b) => b.roi - a.roi) // Sort by ROI desc
            .slice(0, 5); // Take top 5
    }, [collection]);

    if (movers.length === 0) return null;

    return (
        <div className="bg-white/40 dark:bg-black/20 backdrop-blur-md rounded-[2rem] border border-gray-200/50 dark:border-white/10 p-6">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <TrendingUp size={20} className="text-blue-600" />
                Top Movers (ROI)
            </h3>

            <div className="space-y-4">
                {movers.map((item) => (
                    <Link key={item.id} href={`/instruments/${item.id}`} className="block group">
                        <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/50 dark:hover:bg-white/5 transition-colors">
                            {/* Avatar */}
                            <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-800 overflow-hidden relative border border-gray-200 dark:border-gray-700">
                                {item.image ? (
                                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">IMG</div>
                                )}
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate group-hover:text-blue-600 transition-colors">
                                    {item.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                    Comp: {item.cost.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                                </p>
                            </div>

                            {/* Stats */}
                            <div className="text-right">
                                <div className={`flex items-center justify-end gap-1 font-bold text-sm ${item.roi > 0 ? 'text-green-600' : 'text-red-500'}`}>
                                    {item.roi > 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                                    {item.roi > 0 ? '+' : ''}{item.roi.toFixed(1)}%
                                </div>
                                <p className={`text-xs ${item.profit > 0 ? 'text-green-600/70' : 'text-red-500/70'}`}>
                                    {item.profit > 0 ? '+' : ''}{item.profit.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                                </p>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
