'use client';

import { useEffect, useState } from 'react';
import { getPortfolioMovers } from '@/actions/analytics';
import { ArrowUpRight, ArrowDownRight, Minus, TrendingUp } from 'lucide-react';

export default function TopMovers() {
    const [movers, setMovers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMovers = async () => {
            try {
                const res = await getPortfolioMovers();
                if (res.success) {
                    setMovers(res.data);
                }
            } catch (e) {
                console.error("Failed to load movers", e);
            } finally {
                setLoading(false);
            }
        };
        fetchMovers();
    }, []);

    if (loading) return <div className="h-64 bg-gray-100 dark:bg-gray-800 animate-pulse rounded-[2rem]"></div>;
    if (movers.length === 0) return null;

    return (
        <div className="bg-white/40 dark:bg-black/20 backdrop-blur-md rounded-[2rem] border border-gray-200/50 dark:border-white/10 p-6 h-full">
            <div className="flex items-center gap-2 mb-6">
                <TrendingUp size={20} className="text-purple-600" />
                <h3 className="font-bold text-lg">Top Movimientos (ROI)</h3>
            </div>

            <div className="space-y-4">
                {movers.map((mover) => (
                    <div key={mover.id} className="flex items-center justify-between p-3 bg-white/50 dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/5 hover:scale-[1.02] transition-transform">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-gray-200 dark:bg-gray-700 overflow-hidden shrink-0">
                                <img src={mover.image} alt={mover.name} className="w-full h-full object-cover" />
                            </div>
                            <div>
                                <p className="font-semibold text-sm truncate max-w-[120px] sm:max-w-[150px]">{mover.name}</p>
                                <p className="text-xs text-gray-500">
                                    Compra: {mover.bought.toLocaleString('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })}
                                </p>
                            </div>
                        </div>

                        <div className="text-right">
                            <div className={`flex items-center justify-end gap-1 font-bold ${mover.isProfitable ? 'text-green-600' : 'text-red-500'}`}>
                                {mover.percent === 0 ? <Minus size={14} /> : mover.isProfitable ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                                <span>{Math.abs(mover.percent).toFixed(1)}%</span>
                            </div>
                            <p className="text-xs text-gray-500 font-medium">
                                {mover.current.toLocaleString('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
