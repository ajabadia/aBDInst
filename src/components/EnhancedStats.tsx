'use client';

import { useMemo } from 'react';
import { Wallet, TrendingUp, TrendingDown, Award, AlertCircle, Star } from 'lucide-react';
import { useVaultMode } from '@/context/VaultModeContext';

interface EnhancedStatsProps {
    collection: any[];
}

export default function EnhancedStats({ collection }: EnhancedStatsProps) {
    const { isVaultMode } = useVaultMode();

    const stats = useMemo(() => {
        const totalInvestment = collection.reduce((sum, item) =>
            sum + (item.acquisition?.price || 0), 0
        );

        const currentValue = collection.reduce((sum, item) =>
            sum + (item.marketValue?.current || item.acquisition?.price || 0), 0
        );

        const profit = currentValue - totalInvestment;
        const profitPercentage = totalInvestment > 0 ? ((profit / totalInvestment) * 100) : 0;

        const avgItemValue = collection.length > 0 ? currentValue / collection.length : 0;

        const mostValuable = collection.reduce((max, item) => {
            const value = item.marketValue?.current || item.acquisition?.price || 0;
            return value > (max.value || 0) ? { item, value } : max;
        }, { item: null, value: 0 });

        const vintageCount = collection.filter(item => {
            const year = item.instrument?.year;
            return year && year < 2000;
        }).length;

        const conditionScore = collection.reduce((sum, item) => {
            const scores: Record<string, number> = {
                'new': 100,
                'excellent': 90,
                'good': 75,
                'fair': 50,
                'poor': 25,
                'for_parts': 10
            };
            return sum + (scores[item.condition] || 50);
        }, 0) / collection.length;

        return {
            totalInvestment,
            currentValue,
            profit,
            profitPercentage,
            avgItemValue,
            mostValuable,
            vintageCount,
            conditionScore
        };
    }, [collection]);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {/* Total Investment */}
            <div className="p-6 rounded-[2rem] bg-white dark:bg-white/5 border border-gray-200/50 dark:border-white/10 shadow-sm backdrop-blur-md">
                <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600">
                        <Wallet size={20} />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Inversión Total</span>
                </div>
                <p className="text-3xl font-semibold tracking-tighter text-gray-900 dark:text-white">
                    {isVaultMode
                        ? <span className="blur-md select-none opacity-50">•••••••</span>
                        : stats.totalInvestment.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })
                    }
                </p>
            </div>

            {/* Current Value */}
            <div className="p-6 rounded-[2rem] bg-white dark:bg-white/5 border border-gray-200/50 dark:border-white/10 shadow-sm backdrop-blur-md">
                <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-green-50 dark:bg-green-900/30 flex items-center justify-center text-green-600">
                        <TrendingUp size={20} />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Valor Actual</span>
                </div>
                <p className="text-3xl font-semibold tracking-tighter text-gray-900 dark:text-white">
                    {isVaultMode
                        ? <span className="blur-md select-none opacity-50">•••••••</span>
                        : stats.currentValue.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })
                    }
                </p>
            </div>

            {/* Profit/Loss */}
            <div className="p-6 rounded-[2rem] bg-white dark:bg-white/5 border border-gray-200/50 dark:border-white/10 shadow-sm backdrop-blur-md">
                <div className="flex items-center gap-3 mb-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${stats.profit >= 0
                            ? 'bg-green-50 dark:bg-green-900/30 text-green-600'
                            : 'bg-red-50 dark:bg-red-900/30 text-red-600'
                        }`}>
                        {stats.profit >= 0 ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                    </div>
                    <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Ganancia/Pérdida</span>
                </div>
                <p className={`text-3xl font-semibold tracking-tighter ${stats.profit >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                    {isVaultMode
                        ? <span className="blur-md select-none opacity-50">•••••••</span>
                        : <>
                            {stats.profit >= 0 ? '+' : ''}{stats.profit.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                            <span className="text-sm ml-2">({stats.profitPercentage.toFixed(1)}%)</span>
                        </>
                    }
                </p>
            </div>

            {/* Average Item Value */}
            <div className="p-6 rounded-[2rem] bg-white dark:bg-white/5 border border-gray-200/50 dark:border-white/10 shadow-sm backdrop-blur-md">
                <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center text-purple-600">
                        <Award size={20} />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Valor Medio</span>
                </div>
                <p className="text-3xl font-semibold tracking-tighter text-gray-900 dark:text-white">
                    {isVaultMode
                        ? <span className="blur-md select-none opacity-50">•••••••</span>
                        : stats.avgItemValue.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })
                    }
                </p>
            </div>

            {/* Most Valuable Item */}
            {stats.mostValuable.item && (
                <div className="p-6 rounded-[2rem] bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border border-yellow-200/50 dark:border-yellow-800/50 shadow-sm backdrop-blur-md">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-yellow-100 dark:bg-yellow-900/50 flex items-center justify-center text-yellow-600">
                            <Star size={20} />
                        </div>
                        <span className="text-xs font-bold uppercase tracking-widest text-gray-600 dark:text-gray-400">Más Valioso</span>
                    </div>
                    <p className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                        {stats.mostValuable.item.instrument?.brand} {stats.mostValuable.item.instrument?.model}
                    </p>
                    <p className="text-2xl font-semibold text-yellow-600">
                        {isVaultMode
                            ? <span className="blur-md select-none opacity-50">•••••••</span>
                            : stats.mostValuable.value.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })
                        }
                    </p>
                </div>
            )}

            {/* Vintage Count */}
            <div className="p-6 rounded-[2rem] bg-white dark:bg-white/5 border border-gray-200/50 dark:border-white/10 shadow-sm backdrop-blur-md">
                <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center text-amber-600">
                        <AlertCircle size={20} />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Vintage (pre-2000)</span>
                </div>
                <p className="text-3xl font-semibold tracking-tighter text-gray-900 dark:text-white">
                    {stats.vintageCount} <span className="text-lg text-gray-400 font-normal">items</span>
                </p>
                <p className="text-sm text-gray-500 mt-1">
                    {((stats.vintageCount / collection.length) * 100).toFixed(0)}% de la colección
                </p>
            </div>

            {/* Condition Score */}
            <div className="p-6 rounded-[2rem] bg-white dark:bg-white/5 border border-gray-200/50 dark:border-white/10 shadow-sm backdrop-blur-md">
                <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-teal-50 dark:bg-teal-900/30 flex items-center justify-center text-teal-600">
                        <Award size={20} />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Condición Media</span>
                </div>
                <p className="text-3xl font-semibold tracking-tighter text-gray-900 dark:text-white">
                    {stats.conditionScore.toFixed(0)}/100
                </p>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-3">
                    <div
                        className="bg-teal-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${stats.conditionScore}%` }}
                    />
                </div>
            </div>
        </div>
    );
}
