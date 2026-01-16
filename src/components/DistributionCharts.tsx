'use client';

import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { TrendingUp, Package, Calendar } from 'lucide-react';

interface DistributionChartsProps {
    collection: any[];
}

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#6366f1', '#f97316', '#14b8a6'];

export default function DistributionCharts({ collection }: DistributionChartsProps) {
    // Distribution by type
    const typeDistribution = useMemo(() => {
        const types: Record<string, number> = {};
        collection.forEach(item => {
            const type = item.instrument?.type || 'Otro';
            types[type] = (types[type] || 0) + 1;
        });
        return Object.entries(types)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value);
    }, [collection]);

    // Distribution by brand
    const brandDistribution = useMemo(() => {
        const brands: Record<string, number> = {};
        collection.forEach(item => {
            const brand = item.instrument?.brand || 'Otra';
            brands[brand] = (brands[brand] || 0) + 1;
        });
        return Object.entries(brands)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 8); // Top 8 brands
    }, [collection]);

    // Distribution by decade
    const decadeDistribution = useMemo(() => {
        const decades: Record<string, number> = {};
        collection.forEach(item => {
            const year = item.instrument?.year;
            if (year) {
                const decade = Math.floor(year / 10) * 10;
                const label = `${decade}s`;
                decades[label] = (decades[label] || 0) + 1;
            }
        });
        return Object.entries(decades)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => a.name.localeCompare(b.name));
    }, [collection]);

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
                    <p className="font-semibold">{payload[0].name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        {payload[0].value} unidades ({((payload[0].value / collection.length) * 100).toFixed(1)}%)
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
            {[
                { title: 'Composición', icon: Package, iconColor: 'text-blue-500', data: typeDistribution },
                { title: 'Marcas Top', icon: TrendingUp, iconColor: 'text-purple-500', data: brandDistribution },
                { title: 'Cronología', icon: Calendar, iconColor: 'text-pink-500', data: decadeDistribution }
            ].map((chart, i) => (
                <div key={i} className="bg-white/60 dark:bg-black/40 backdrop-blur-xl rounded-[2.5rem] border border-gray-200/50 dark:border-white/10 p-8 shadow-apple-sm transition-all hover:shadow-md">
                    <div className="flex items-center gap-3 mb-6">
                        <chart.icon size={22} className={chart.iconColor} strokeWidth={2.5} />
                        <h3 className="font-extrabold text-sm uppercase tracking-widest text-gray-500 dark:text-gray-400">{chart.title}</h3>
                    </div>
                    <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                            <Pie
                                data={chart.data}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={85}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {chart.data.map((entry: any, index: number) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} className="outline-none" />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                        </PieChart>
                    </ResponsiveContainer>

                    {/* legend info */}
                    <div className="mt-4 flex flex-wrap gap-2 justify-center">
                        {chart.data.slice(0, 3).map((item: any, idx: number) => (
                            <div key={idx} className="flex items-center gap-1.5 px-2 py-1 bg-gray-50 dark:bg-white/5 rounded-lg text-[10px] font-bold text-gray-400">
                                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                                {item.name}
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
