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
                    <div key={mover.id} className="flex items-center justify-between p-4 bg-white/60 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/5 hover:bg-white dark:hover:bg-white/10 transition-all group/item shadow-sm hover:shadow-md">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-800 overflow-hidden shrink-0 border border-gray-200/50 dark:border-white/10">
                                <img src={mover.image} alt={mover.name} className="w-full h-full object-cover group-hover/item:scale-110 transition-transform duration-500" />
                            </div>
                            <div>
                                <p className="font-bold text-sm text-gray-900 dark:text-white truncate max-w-[120px] sm:max-w-[150px]">{mover.name}</p>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">
                                    Compra: {mover.bought.toLocaleString('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })}
                                </p>
                            </div>
                        </div>

                        <div className="text-right">
                            <div className={`flex items-center justify-end gap-1 font-black text-base ${mover.isProfitable ? 'text-green-500' : 'text-red-500'}`}>
                                {mover.percent === 0 ? <Minus size={14} /> : mover.isProfitable ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}
                                <span>{mover.percent > 0 ? '+' : ''}{mover.percent.toFixed(1)}%</span>
                            </div>
                            <p className="text-[11px] font-bold text-gray-500 dark:text-gray-400 mt-0.5">
                                {mover.current.toLocaleString('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
