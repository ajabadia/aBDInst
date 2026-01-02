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
            {/* Distribution by Type */}
            <div className="bg-white/40 dark:bg-black/20 backdrop-blur-md rounded-[2rem] border border-gray-200/50 dark:border-white/10 p-6">
                <div className="flex items-center gap-2 mb-4">
                    <Package size={20} className="text-blue-600" />
                    <h3 className="font-bold text-lg">Por Tipo</h3>
                </div>
                <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                        <Pie
                            data={typeDistribution}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                        >
                            {typeDistribution.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </div>

            {/* Distribution by Brand */}
            <div className="bg-white/40 dark:bg-black/20 backdrop-blur-md rounded-[2rem] border border-gray-200/50 dark:border-white/10 p-6">
                <div className="flex items-center gap-2 mb-4">
                    <TrendingUp size={20} className="text-purple-600" />
                    <h3 className="font-bold text-lg">Top Marcas</h3>
                </div>
                <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                        <Pie
                            data={brandDistribution}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                        >
                            {brandDistribution.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </div>

            {/* Distribution by Decade */}
            <div className="bg-white/40 dark:bg-black/20 backdrop-blur-md rounded-[2rem] border border-gray-200/50 dark:border-white/10 p-6">
                <div className="flex items-center gap-2 mb-4">
                    <Calendar size={20} className="text-pink-600" />
                    <h3 className="font-bold text-lg">Por Década</h3>
                </div>
                <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                        <Pie
                            data={decadeDistribution}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                        >
                            {decadeDistribution.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
