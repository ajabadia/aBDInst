'use client';

import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import { useMemo } from 'react';

interface MarketTrendChartProps {
    data: any[];
    title: string;
}

export default function MarketTrendChart({ data, title }: MarketTrendChartProps) {

    // Format data for Scatter
    const chartData = useMemo(() => {
        return data.map(item => ({
            ...item,
            x: new Date(item.date).getTime(),
            y: item.price,
        }));
    }, [data]);

    // Calculate domain for better visualization
    const domain: [number, number] | [number, 'auto'] | ['auto', 'auto'] = useMemo(() => {
        if (chartData.length === 0) return [0, 'auto'];
        const prices = chartData.map(d => d.y);
        const min = Math.min(...prices) * 0.9;
        const max = Math.max(...prices) * 1.1;
        return [min, max];
    }, [chartData]);

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 text-xs">
                    <p className="font-bold mb-1">{data.title}</p>
                    <p className="text-blue-600 font-semibold text-lg">{data.price} €</p>
                    <p className="text-gray-500">{new Date(data.date).toLocaleDateString()}</p>
                    <p className="text-gray-400 capitalize">{data.source}</p>
                </div>
            );
        }
        return null;
    };

    // Calculate Market Pulse statistics
    const stats = useMemo(() => {
        if (chartData.length === 0) return null;
        const prices = chartData.map(d => d.y).sort((a, b) => a - b);
        const avg = prices.reduce((a, b) => a + b, 0) / prices.length;
        const median = prices[Math.floor(prices.length / 2)];
        return {
            avg: Math.round(prices.reduce((a, b) => a + b, 0) / prices.length),
            min: prices[0],
            max: prices[prices.length - 1],
            count: prices.length,
            median
        };
    }, [chartData]);

    if (data.length === 0) return null;

    return (
        <div className="bg-white/60 dark:bg-black/40 backdrop-blur-xl rounded-[2.5rem] border border-gray-200/50 dark:border-white/10 p-8 shadow-apple-sm group/chart overflow-hidden relative">

            {/* Background Glow */}
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-blue-500/5 blur-[100px] rounded-full" />

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 relative z-10">
                <div>
                    <h3 className="text-2xl font-black tracking-tight text-gray-900 dark:text-white uppercase">
                        Market Pulse: <span className="text-blue-500">{title}</span>
                    </h3>
                    <p className="text-sm text-gray-400 font-medium">Dispersión de precios basada en {stats?.count} anuncios reales</p>
                </div>

                {stats && (
                    <div className="flex gap-4">
                        <div className="text-right">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Media Mercado</p>
                            <p className="text-2xl font-black text-blue-500">{stats.avg.toLocaleString()} €</p>
                        </div>
                    </div>
                )}
            </div>

            <div className="relative z-10">
                <ResponsiveContainer width="100%" height={350}>
                    <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} strokeOpacity={0.5} />
                        <XAxis
                            type="number"
                            dataKey="x"
                            name="Fecha"
                            domain={['auto', 'auto']}
                            tickFormatter={(unixTime) => new Date(unixTime).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                            style={{ fontSize: '11px', fontWeight: 'bold' }}
                            stroke="#9ca3af"
                            tickLine={false}
                            axisLine={false}
                            dy={10}
                        />
                        <YAxis
                            type="number"
                            dataKey="y"
                            name="Precio"
                            unit="€"
                            domain={domain}
                            style={{ fontSize: '11px', fontWeight: 'bold' }}
                            stroke="#9ca3af"
                            tickLine={false}
                            axisLine={false}
                            dx={-10}
                        />
                        <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<CustomTooltip />} />
                        <Scatter
                            name="Ofertas Detectadas"
                            data={chartData}
                            fill="#3b82f6"
                            shape="circle"
                            line={false}
                            className="drop-shadow-[0_0_8px_rgba(59,130,246,0.3)] animate-in fade-in zoom-in duration-700"
                        />
                    </ScatterChart>
                </ResponsiveContainer>
            </div>

            {stats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-8 border-t border-gray-100 dark:border-white/5 relative z-10">
                    <div className="space-y-1">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Precio Mínimo</p>
                        <p className="text-lg font-bold text-gray-800 dark:text-gray-200">{stats.min.toLocaleString()} €</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Precio Máximo</p>
                        <p className="text-lg font-bold text-gray-800 dark:text-gray-200">{stats.max.toLocaleString()} €</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Mediana</p>
                        <p className="text-lg font-bold text-gray-800 dark:text-gray-200">{stats.median.toLocaleString()} €</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Puntos de Datos</p>
                        <p className="text-lg font-bold text-gray-800 dark:text-gray-200">{stats.count} anuncios</p>
                    </div>
                </div>
            )}
        </div>
    );
}
