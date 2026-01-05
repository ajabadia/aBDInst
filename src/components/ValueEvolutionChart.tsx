'use client';

import { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, DollarSign } from 'lucide-react';

interface ValueEvolutionChartProps {
    collection: any[];
}

export default function ValueEvolutionChart({ collection }: ValueEvolutionChartProps) {
    const evolutionData = useMemo(() => {
        if (!collection || collection.length === 0) return [];

        // 1. Identify all significant dates (Acquisition and History points)
        const timelineDates = new Set<string>();

        collection.forEach(item => {
            // Add acquisition date
            if (item.acquisition?.date) {
                timelineDates.add(new Date(item.acquisition.date).toISOString().split('T')[0]);
            }
            // Add valuation history dates
            if (item.marketValue?.history) {
                item.marketValue.history.forEach((h: any) => {
                    if (h.date) timelineDates.add(new Date(h.date).toISOString().split('T')[0]);
                });
            }
        });

        const sortedDates = Array.from(timelineDates).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

        // 2. Generate snapshot for each date
        const snapshots = sortedDates.map(dateStr => {
            const checkDate = new Date(dateStr);
            let totalValue = 0;
            let totalInvested = 0;

            collection.forEach(item => {
                // Check if instrument was owned at this date
                const acqDate = item.acquisition?.date ? new Date(item.acquisition.date) : null;

                if (acqDate && acqDate <= checkDate) {
                    // It was owned.
                    const purchasePrice = item.acquisition?.price || 0;
                    totalInvested += purchasePrice;

                    // Determine value at this date
                    let estimatedValue = purchasePrice; // Default to purchase price
                    let valueFound = false;

                    // 1. Try Individual History (User Manual Entry)
                    if (item.marketValue?.history?.length > 0) {
                        const relevantPoints = item.marketValue.history
                            .filter((h: any) => new Date(h.date) <= checkDate)
                            .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());

                        if (relevantPoints.length > 0) {
                            // Logic change: If multiple points exist on the SAME latest date, average them
                            // User request: "Si hay dos valores para el mismo día... habría que promediarlos"
                            const latestDate = new Date(relevantPoints[0].date).toISOString().split('T')[0];

                            // Get all points from the most recent available date
                            const pointsOnLatestDate = relevantPoints.filter((h: any) =>
                                new Date(h.date).toISOString().split('T')[0] === latestDate
                            );

                            if (pointsOnLatestDate.length > 1) {
                                const sum = pointsOnLatestDate.reduce((acc: number, curr: any) => acc + curr.value, 0);
                                estimatedValue = sum / pointsOnLatestDate.length;
                            } else {
                                estimatedValue = relevantPoints[0].value;
                            }
                            valueFound = true;
                        }
                    }

                    // 2. Smart Fallback: Use Master Instrument History (Aggregation/AI)
                    if (!valueFound && item.instrument?.marketValue?.history?.length > 0) {
                        const masterPoints = item.instrument.marketValue.history
                            .filter((h: any) => new Date(h.date) <= checkDate)
                            .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());

                        if (masterPoints.length > 0) {
                            estimatedValue = masterPoints[0].value;
                            // Optional: Adjust for condition? E.g. (estimatedValue * 0.8 if condition is 'fair')
                        }
                    }

                    totalValue += estimatedValue;
                }
            });

            return {
                date: new Date(dateStr).toLocaleDateString('es-ES', { month: 'short', year: '2-digit' }),
                fullDate: dateStr,
                value: totalValue,
                invested: totalInvested
            };
        });

        // Filter out snapshots with 0 value (before first purchase)
        return snapshots.filter(s => s.value > 0);

    }, [collection]);

    // Calculate current total value
    const currentValue = useMemo(() => {
        return collection.reduce((sum, item) => {
            // Use current market value if exists, else acquisition price
            const val = item.marketValue?.current?.value || item.acquisition?.price || 0;
            return sum + val;
        }, 0);
    }, [collection]);

    // Calculate total investment
    const totalInvestment = useMemo(() => {
        return collection.reduce((sum, item) => {
            return sum + (item.acquisition?.price || 0);
        }, 0);
    }, [collection]);

    const profit = currentValue - totalInvestment;
    const profitPercentage = totalInvestment > 0 ? ((profit / totalInvestment) * 100) : 0;

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
                    <p className="font-semibold mb-2">{label}</p>
                    {payload.map((entry: any, index: number) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                            <span className="text-gray-600 dark:text-gray-400">
                                {entry.name}:
                            </span>
                            <span className="font-medium">
                                {entry.value.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                            </span>
                        </div>
                    ))}
                </div>
            );
        }
        return null;
    };

    if (evolutionData.length === 0) {
        return (
            <div className="bg-white/40 dark:bg-black/20 backdrop-blur-md rounded-[2rem] border border-gray-200/50 dark:border-white/10 p-6 mb-12">
                <div className="flex items-center gap-2 mb-4">
                    <TrendingUp size={20} className="text-green-600" />
                    <h3 className="font-bold text-lg">Evolución de Valor (Portafolio)</h3>
                </div>
                <p className="text-gray-500 text-center py-12">
                    No hay suficientes datos. Añade instrumentos y fechas de compra para ver la evolución.
                </p>
            </div>
        );
    }

    return (
        <div className="bg-white/40 dark:bg-black/20 backdrop-blur-md rounded-[2rem] border border-gray-200/50 dark:border-white/10 p-6 mb-12">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <TrendingUp size={20} className="text-green-600" />
                    <h3 className="font-bold text-lg">Evolución del Portafolio</h3>
                </div>
                <div className="text-right">
                    <p className="text-sm text-gray-500">Rentabilidad Global</p>
                    <p className={`text-2xl font-bold ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {profit >= 0 ? '+' : ''}{profit.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                        <span className="text-sm ml-2">({profitPercentage.toFixed(1)}%)</span>
                    </p>
                </div>
            </div>

            <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={evolutionData}>
                    <defs>
                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorInvested" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                    <XAxis
                        dataKey="date"
                        stroke="#9ca3af"
                        style={{ fontSize: '12px' }}
                        tickLine={false}
                        axisLine={false}
                    />
                    <YAxis
                        stroke="#9ca3af"
                        style={{ fontSize: '12px' }}
                        tickFormatter={(value) => `${(value / 1000).toFixed(0)}k€`}
                        tickLine={false}
                        axisLine={false}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Area
                        type="monotone"
                        dataKey="value"
                        name="Valor de Mercado"
                        stroke="#10b981"
                        strokeWidth={2}
                        fill="url(#colorValue)"
                    />
                    <Area
                        type="monotone"
                        dataKey="invested"
                        name="Inversión"
                        stroke="#6366f1"
                        strokeWidth={2}
                        fill="url(#colorInvested)"
                    />
                </AreaChart>
            </ResponsiveContainer>

            <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <div>
                    <p className="text-sm text-gray-500">Inversión Total Acumulada</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                        {totalInvestment.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                    </p>
                </div>
                <div>
                    <p className="text-sm text-gray-500">Valor Actual Estimado</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                        {currentValue.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                    </p>
                </div>
            </div>
        </div>
    );
}
