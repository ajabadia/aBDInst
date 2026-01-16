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

    if (data.length === 0) return null;

    return (
        <div className="bg-white/40 dark:bg-black/20 backdrop-blur-md rounded-[2rem] border border-gray-200/50 dark:border-white/10 p-6">
            <h3 className="font-bold text-lg mb-4 text-gray-800 dark:text-gray-200">
                Tendencia de Mercado: <span className="text-blue-600">{title}</span>
            </h3>

            <ResponsiveContainer width="100%" height={300}>
                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                    <XAxis
                        type="number"
                        dataKey="x"
                        name="Fecha"
                        domain={['auto', 'auto']}
                        tickFormatter={(unixTime) => new Date(unixTime).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        style={{ fontSize: '12px' }}
                        stroke="#9ca3af"
                        tickLine={false}
                        axisLine={false}
                    />
                    <YAxis
                        type="number"
                        dataKey="y"
                        name="Precio"
                        unit="€"
                        domain={domain}
                        style={{ fontSize: '12px' }}
                        stroke="#9ca3af"
                        tickLine={false}
                        axisLine={false}
                    />
                    <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<CustomTooltip />} />
                    <Legend />
                    <Scatter name="Ofertas Detectadas" data={chartData} fill="#3b82f6" shape="circle" />
                </ScatterChart>
            </ResponsiveContainer>
            <p className="text-xs text-center text-gray-400 mt-2">
                * Cada punto representa un anuncio real encontrado en Reverb/eBay/Wallapop.
            </p>
        </div>
    );
}
