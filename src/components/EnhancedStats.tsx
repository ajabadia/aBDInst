'use client';

import { useMemo } from 'react';
import { Wallet, TrendingUp, TrendingDown, Award, AlertCircle, Star } from 'lucide-react';
import { useVaultMode } from '@/context/VaultModeContext';

interface EnhancedStatsProps {
    collection: any[];
    compact?: boolean;
}

export default function EnhancedStats({ collection, compact = false }: EnhancedStatsProps) {
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

    const containerClass = compact
        ? "grid grid-cols-1 gap-3"
        : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12";

    const cardClass = `rounded-3xl bg-white dark:bg-white/5 border border-gray-200/50 dark:border-white/10 shadow-sm backdrop-blur-md ${compact ? 'p-4' : 'p-6'}`;
    const valueTextClass = `font-semibold tracking-tighter text-gray-900 dark:text-white ${compact ? 'text-2xl' : 'text-3xl'}`;

    return (
        <div className={containerClass}>
            {/* Total Investment */}
            <div className={cardClass}>
                <div className="flex items-center gap-3 mb-3">
                    <div className={`rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 ${compact ? 'w-8 h-8' : 'w-10 h-10'}`}>
                        <Wallet size={compact ? 16 : 20} />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Inversión Total</span>
                </div>
                <p className={valueTextClass}>
                    {isVaultMode
                        ? <span className="blur-md select-none opacity-50">•••••••</span>
                        : stats.totalInvestment.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })
                    }
                </p>
            </div>

            {/* Current Value */}
            <div className={cardClass}>
                <div className="flex items-center gap-3 mb-3">
                    <div className={`rounded-full bg-green-50 dark:bg-green-900/30 flex items-center justify-center text-green-600 ${compact ? 'w-8 h-8' : 'w-10 h-10'}`}>
                        <TrendingUp size={compact ? 16 : 20} />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Valor Actual</span>
                </div>
                <p className={valueTextClass}>
                    {isVaultMode
                        ? <span className="blur-md select-none opacity-50">•••••••</span>
                        : stats.currentValue.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })
                    }
                </p>
            </div>

            {/* Profit/Loss */}
            <div className={cardClass}>
                <div className="flex items-center gap-3 mb-3">
                    <div className={`rounded-full flex items-center justify-center ${compact ? 'w-8 h-8' : 'w-10 h-10'} ${stats.profit >= 0
                        ? 'bg-green-50 dark:bg-green-900/30 text-green-600'
                        : 'bg-red-50 dark:bg-red-900/30 text-red-600'
                        }`}>
                        {stats.profit >= 0 ? <TrendingUp size={compact ? 16 : 20} /> : <TrendingDown size={compact ? 16 : 20} />}
                    </div>
                    <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Ganancia</span>
                </div>
                <p className={`${valueTextClass} ${stats.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {isVaultMode
                        ? <span className="blur-md select-none opacity-50">•••••••</span>
                        : <>
                            {stats.profit >= 0 ? '+' : ''}{stats.profit.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                        </>
                    }
                </p>
            </div>

            {/* Condition Score - Only show in Compact mode if user REALLY wants all details, but usually 4 items is enough. 
                I'll keep it simple: Show Condition Score instead of Average or Vintage in compact mode if desired, 
                but for now let's render all stacked or maybe condition is nice. 
            */}
            <div className={cardClass}>
                <div className="flex items-center gap-3 mb-3">
                    <div className={`rounded-full bg-teal-50 dark:bg-teal-900/30 flex items-center justify-center text-teal-600 ${compact ? 'w-8 h-8' : 'w-10 h-10'}`}>
                        <Award size={compact ? 16 : 20} />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Condición</span>
                </div>
                <p className={valueTextClass}>
                    {stats.conditionScore.toFixed(0)}<span className="text-sm opacity-50 ml-1">/100</span>
                </p>
                {!compact && (
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-3">
                        <div className="bg-teal-600 h-2 rounded-full" style={{ width: `${stats.conditionScore}%` }} />
                    </div>
                )}
            </div>
        </div>
    );
}

