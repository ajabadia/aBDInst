// src/components/AnalyticsDashboard.tsx
"use client";
import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid, Legend } from 'recharts';

interface StatsData {
    total: number;
    byType: { type: string; count: number }[];
    byCondition: { condition: string; count: number }[];
}

interface PriceTrend {
    period: string;
    avgPrice: number;
}

interface LocationStat {
    location: string;
    count: number;
}

export default function AnalyticsDashboard() {
    const [stats, setStats] = useState<StatsData | null>(null);
    const [priceTrends, setPriceTrends] = useState<PriceTrend[]>([]);
    const [locationStats, setLocationStats] = useState<LocationStat[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                const [statsRes, priceRes, locRes] = await Promise.all([
                    fetch('/api/analytics?type=stats'),
                    fetch('/api/analytics?type=price&period=monthly'),
                    fetch('/api/analytics?type=location'),
                ]);
                const statsJson = await statsRes.json();
                const priceJson = await priceRes.json();
                const locJson = await locRes.json();
                if (statsJson.success) setStats(statsJson.data);
                if (priceJson.success) setPriceTrends(priceJson.data);
                if (locJson.success) setLocationStats(locJson.data);
            } catch (e) {
                console.error('Analytics fetch error', e);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    if (loading) return <div className="p-8 text-center">Cargando métricas...</div>;
    if (!stats) return <div className="p-8 text-center">No hay datos disponibles.</div>;

    return (
        <div className="p-6 space-y-8">
            {/* Summary cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Total de instrumentos</CardTitle>
                    </CardHeader>
                    <CardContent className="text-3xl font-bold">{stats.total}</CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Tipos de instrumentos</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="list-disc pl-5 space-y-1">
                            {stats.byType.map((t) => (
                                <li key={t.type}>
                                    {t.type}: {t.count}
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Condiciones</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="list-disc pl-5 space-y-1">
                            {stats.byCondition.map((c) => (
                                <li key={c.condition}>
                                    {c.condition}: {c.count}
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            </div>

            {/* Price trend line chart */}
            <Card>
                <CardHeader>
                    <CardTitle>Evolución del precio medio (mensual)</CardTitle>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={priceTrends}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="period" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="avgPrice" stroke="#2563eb" name="Precio medio" />
                        </LineChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Location distribution bar chart */}
            <Card>
                <CardHeader>
                    <CardTitle>Distribución por ubicación</CardTitle>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={locationStats} layout="vertical" margin={{ left: 80 }}>
                            <XAxis type="number" />
                            <YAxis dataKey="location" type="category" width={150} />
                            <Tooltip />
                            <Bar dataKey="count" fill="#10b981" name="Cantidad" />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
    );
}
