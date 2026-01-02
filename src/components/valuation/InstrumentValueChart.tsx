'use client';

import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Legend } from 'recharts';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface InstrumentValueChartProps {
    history: Array<{ date: string | Date; value: number; source?: string; notes?: string }>;
    purchasePrice?: number;
    purchaseDate?: string | Date;
    originalPrice?: { price: number; year: number; currency?: string };
}

// Colors for different series
const SYSTEM_COLORS = {
    'Original MSRP': '#6366f1', // Indigo
    'Second Hand (Mint)': '#10b981', // Emerald
    'Second Hand (Good)': '#f59e0b', // Amber
    'Dealer / Shop': '#ec4899', // Pink
    'Auction Result': '#8b5cf6', // Violet
    'Default': '#0071e3' // Blue
};

export default function InstrumentValueChart({ history, purchasePrice, purchaseDate, originalPrice }: InstrumentValueChartProps) {
    const { chartData, seriesFound } = useMemo(() => {
        const rawPoints: Array<{ date: Date; value: number; context: string }> = [];

        // 1. Add Original Price as the starting point (Jan 1st of that year)
        if (originalPrice?.price && originalPrice?.year) {
            rawPoints.push({
                date: new Date(originalPrice.year, 0, 1),
                value: originalPrice.price,
                context: 'Original MSRP'
            });
        }

        // 2. Process History Points
        if (history) {
            history.forEach(h => {
                let context = 'Estimación';
                // Extract context from notes: "[Context Name] rest of notes..."
                const contextMatch = h.notes ? h.notes.match(/^\[(.*?)\]/) : null;
                if (contextMatch) {
                    context = contextMatch[1];
                }

                rawPoints.push({
                    date: new Date(h.date),
                    value: h.value,
                    context: context
                });
            });
        }

        if (rawPoints.length === 0) return { chartData: [], seriesFound: [] };

        // 3. Group by Month string (YYYY-MM) and Context
        const groupedData: Record<string, Record<string, number[]>> = {};
        const allContexts = new Set<string>();

        rawPoints.forEach(p => {
            const monthKey = `${p.date.getFullYear()}-${String(p.date.getMonth() + 1).padStart(2, '0')}`;
            if (!groupedData[monthKey]) groupedData[monthKey] = {};
            if (!groupedData[monthKey][p.context]) groupedData[monthKey][p.context] = [];

            groupedData[monthKey][p.context].push(p.value);
            allContexts.add(p.context);
        });

        // 4. Create Chart Data (Average values per month/context)
        const timeline = Object.keys(groupedData).sort();
        const data = timeline.map(monthKey => {
            const [year, month] = monthKey.split('-');
            const dateObj = new Date(parseInt(year), parseInt(month) - 1, 1);

            const entry: any = {
                monthKey,
                dateStr: dateObj.toLocaleDateString('es-ES', { month: 'short', year: '2-digit' }),
                timestamp: dateObj.getTime()
            };

            // Calculate averages for this month
            Object.entries(groupedData[monthKey]).forEach(([ctx, values]) => {
                const sum = values.reduce((a, b) => a + b, 0);
                entry[ctx] = Math.round(sum / values.length);
            });

            return entry;
        });

        return { chartData: data, seriesFound: Array.from(allContexts) };
    }, [history, originalPrice]);

    if (chartData.length === 0) {
        return (
            <div className="h-[300px] w-full flex items-center justify-center bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
                <p className="text-gray-400 text-sm">No hay datos históricos de valor</p>
            </div>
        );
    }

    return (
        <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e5e5" />
                    <XAxis
                        dataKey="dateStr"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#6b7280', fontSize: 12 }}
                        dy={10}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#6b7280', fontSize: 12 }}
                        tickFormatter={(val) => `${val}€`}
                    />
                    <Tooltip
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        formatter={(value: number) => [`${value}€`, '']}
                        labelStyle={{ color: '#374151', fontWeight: 600, marginBottom: '0.5rem' }}
                    />
                    <Legend iconType="circle" />

                    {purchasePrice && (
                        <ReferenceLine
                            y={purchasePrice}
                            stroke="#ef4444"
                            strokeDasharray="3 3"
                            label={{ position: 'right', value: 'Tu Compra', fill: '#ef4444', fontSize: 10 }}
                        />
                    )}

                    {seriesFound.map((series, index) => (
                        <Line
                            key={series}
                            type="monotone"
                            dataKey={series}
                            stroke={(SYSTEM_COLORS as any)[series] || SYSTEM_COLORS['Default']}
                            strokeWidth={3}
                            dot={{ r: 4, strokeWidth: 2 }}
                            connectNulls
                        />
                    ))}
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
