import { useEffect, useState, useMemo } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ExternalLink, TrendingUp, TrendingDown, DollarSign, RefreshCw, Search } from 'lucide-react';
import { getMarketInsights } from '@/actions/market';
import Image from 'next/image';
import { ScrapedItem } from '@/lib/scrapers/types';

interface MarketInsightsProps {
    query: string;
    instrumentId?: string;
}

export default function MarketInsights({ query, instrumentId }: MarketInsightsProps) {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<{
        listings: any[],
        priceGuide: any,
        technicalSpecs: any
    } | null>(null);

    useEffect(() => {
        if (query) {
            loadData();
        }
    }, [query, instrumentId]);

    const loadData = async () => {
        setLoading(true);
        try {
            const res = await getMarketInsights(query, instrumentId);
            setData(res);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const listings = data?.listings || [];
    const priceGuide = data?.priceGuide;
    const technicalSpecs = data?.technicalSpecs;

    // Memoized sorting
    const sortedListings = useMemo(() => {
        return [...listings].sort((a, b) => {
            const priority: Record<string, number> = { 'reverb': 1, 'ebay': 2, 'wallapop': 3 };
            return (priority[a.source] || 99) - (priority[b.source] || 99);
        });
    }, [listings]);

    // Memoized average price
    const averagePrice = useMemo(() => {
        if (listings.length === 0) return 0;
        return listings.reduce((acc, item) => {
            const price = typeof item.price === 'object' ? item.price.amount : item.price;
            return acc + price;
        }, 0) / listings.length;
    }, [listings]);

    if (loading) return <InsightsSkeleton />;

    if (!data || (listings.length === 0 && !priceGuide && !technicalSpecs)) {
        return (
            <div className="p-10 border-2 border-dashed rounded-[2.5rem] text-center space-y-4 bg-gray-50/50 dark:bg-white/5 border-gray-100 dark:border-white/5">
                <div className="w-16 h-16 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto text-gray-300">
                    <Search size={32} />
                </div>
                <div>
                    <p className="font-bold text-gray-900 dark:text-white">Sin datos para &quot;{query}&quot;</p>
                    <p className="text-sm text-gray-500 mt-1 max-w-xs mx-auto">
                        No hemos encontrado anuncios ni especificaciones técnicas. Verifica que la marca y el modelo sean correctos.
                    </p>
                </div>
                <div className="pt-4 border-t border-gray-100 dark:border-white/5 mt-6">
                    <p className="text-[10px] uppercase font-black text-gray-400 mb-2">Estado de Conexión</p>
                    <div className="flex justify-center gap-4">
                        <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" /> Reverb OK
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
                            <div className="w-1.5 h-1.5 rounded-full bg-orange-300" /> eBay (Sin Token)
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-700">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold tracking-tight">Market & Tech Insights</h3>
                    <div className="flex gap-1">
                        <Badge variant="outline" className="text-[10px] bg-blue-50 text-blue-600 border-blue-200">Reverb</Badge>
                        <Badge variant="outline" className="text-[10px] bg-orange-50 text-orange-600 border-orange-200">eBay</Badge>
                        <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-600 border-emerald-200">Wallapop</Badge>
                    </div>
                </div>
                <button onClick={loadData} className="text-gray-400 hover:text-gray-600 transition-colors">
                    <RefreshCw size={16} />
                </button>
            </div>

            {/* Technical Specs Section */}
            {technicalSpecs && (
                <Card className="p-5 bg-blue-50/50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/20 rounded-[2rem]">
                    <div className="flex items-center gap-2 mb-4">
                        <TrendingUp size={18} className="text-blue-600" />
                        <h4 className="font-bold text-blue-900 dark:text-blue-100">Especificaciones Técnicas (Synthesizer-API)</h4>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 text-sm">
                        {Array.isArray(technicalSpecs) ? (
                            // Existing Instrument Specs
                            technicalSpecs.map((s, idx) => (
                                <div key={idx} className="flex flex-col">
                                    <span className="text-gray-500 text-[10px] uppercase font-bold">{s.label}</span>
                                    <span className="font-medium truncate">{s.value}</span>
                                </div>
                            ))
                        ) : (
                            // API Specs (SynthApiSpecs)
                            <>
                                <div className="flex flex-col">
                                    <span className="text-gray-500 text-[10px] uppercase font-bold">Año</span>
                                    <span className="font-medium">{technicalSpecs.yearProduced}</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-gray-500 text-[10px] uppercase font-bold">Osciladores</span>
                                    <span className="font-medium truncate">{technicalSpecs.oscillators}</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-gray-500 text-[10px] uppercase font-bold">Filtro</span>
                                    <span className="font-medium truncate">{technicalSpecs.filter}</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-gray-500 text-[10px] uppercase font-bold">LFO</span>
                                    <span className="font-medium truncate">{technicalSpecs.lfo}</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-gray-500 text-[10px] uppercase font-bold">Memoria</span>
                                    <span className="font-medium truncate">{technicalSpecs.memory}</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-gray-500 text-[10px] uppercase font-bold">Efectos</span>
                                    <span className="font-medium truncate">{technicalSpecs.effects}</span>
                                </div>
                            </>
                        )}
                    </div>
                </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Price Guide Card */}
                {priceGuide && (
                    <Card className="p-5 bg-gradient-to-br from-gray-900 to-black text-white border-none shadow-xl col-span-1 md:col-span-1 relative overflow-hidden group rounded-[2rem]">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <TrendingUp size={80} />
                        </div>
                        <h4 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">Valor Estimado</h4>
                        <div className="text-3xl font-bold mb-1">
                            {priceGuide.min} - {priceGuide.max} {priceGuide.currency}
                        </div>
                        <p className="text-sm text-gray-400 mb-4">{priceGuide.title}</p>
                        <a
                            href={priceGuide.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-xs font-bold bg-white/20 hover:bg-white/30 backdrop-blur-md px-3 py-1.5 rounded-full transition-all"
                        >
                            Ver Guía de Precios <ExternalLink size={12} />
                        </a>
                    </Card>
                )}

                {/* Average Price Card */}
                <Card className="p-5 bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 shadow-sm flex flex-col justify-center rounded-[2rem]">
                    <h4 className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">Precio Medio (Listados)</h4>
                    <div className="text-3xl font-bold text-gray-900 dark:text-white">
                        {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(averagePrice)}
                    </div>
                    <p className="text-xs text-gray-400 mt-1">Basado en {listings.length} anuncios activos</p>
                </Card>

                {/* Availability Stats */}
                <Card className="p-5 bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 shadow-sm flex flex-col justify-center rounded-[2rem]">
                    <h4 className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">Disponibilidad Global</h4>
                    <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${listings.length > 0 ? 'bg-green-500' : 'bg-red-500'}`} />
                        <span className="text-lg font-medium">{listings.length > 0 ? `${listings.length} Encontrados` : 'Agotado'}</span>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                        <div className="flex gap-1 flex-wrap">
                            {['reverb', 'ebay', 'wallapop'].map(s => {
                                const count = listings.filter(l => l.source === s).length;
                                if (count === 0) return null;
                                return <Badge key={s} variant="outline" className="text-[10px] lowercase">{count} {s}</Badge>;
                            })}
                        </div>
                        {listings.filter(l => l.source === 'ebay').length === 0 && (
                            <span className="text-[9px] text-gray-400 italic">eBay pendiente de token</span>
                        )}
                    </div>
                </Card>
            </div>

            {/* Live Listings */}
            <div>
                <h4 className="text-sm font-bold text-gray-500 mb-4 uppercase tracking-wider">Listados Agregados</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {sortedListings.slice(0, 9).map((item) => {
                        const price = typeof item.price === 'object' ? item.price.amount : item.price;
                        const currency = typeof item.price === 'object' ? item.price.currency : (item.currency || 'EUR');

                        return (
                            <a
                                key={item.id}
                                href={item.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex gap-4 p-3 rounded-2xl bg-gray-50 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 hover:shadow-md border border-transparent hover:border-black/5 transition-all group"
                            >
                                <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-gray-200 dark:bg-white/5 shrink-0">
                                    {item.imageUrl ? (
                                        <Image src={item.imageUrl} alt={item.title} fill className="object-cover group-hover:scale-105 transition-transform" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                                            <DollarSign size={20} />
                                        </div>
                                    )}
                                    <div className="absolute top-1 left-1">
                                        <Badge className={`text-[8px] h-4 px-1 uppercase ${item.source === 'reverb' ? 'bg-blue-600' :
                                            item.source === 'ebay' ? 'bg-orange-600' : 'bg-emerald-600'
                                            }`}>
                                            {item.source}
                                        </Badge>
                                    </div>
                                </div>
                                <div className="min-w-0 py-1">
                                    <h5 className="font-bold text-sm truncate pr-4 text-gray-900 dark:text-white">{item.title}</h5>
                                    <div className="text-lg font-bold text-ios-blue">
                                        {new Intl.NumberFormat('es-ES', { style: 'currency', currency }).format(price)}
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                                        <Badge variant="secondary" className="text-[10px] px-1.5 h-5 bg-white dark:bg-white/10 border-gray-200 dark:border-white/10">
                                            {item.condition || 'Used'}
                                        </Badge>
                                        {item.location && <span className="text-[10px] truncate max-w-[80px]">📍 {item.location}</span>}
                                    </div>
                                </div>
                            </a>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

function InsightsSkeleton() {
    return (
        <div className="space-y-6">
            <div className="flex justify-between">
                <Skeleton className="h-8 w-48 rounded-lg" />
                <Skeleton className="h-8 w-8 rounded-full" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Skeleton className="h-32 rounded-2xl" />
                <Skeleton className="h-32 rounded-2xl" />
                <Skeleton className="h-32 rounded-2xl" />
            </div>
            <div className="grid grid-cols-3 gap-4">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 rounded-2xl" />)}
            </div>
        </div>
    );
}
