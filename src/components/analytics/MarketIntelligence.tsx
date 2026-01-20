
import { useState } from 'react';
import { getMarketTrends } from '@/actions/analytics';
import { getMarketInsight } from '@/actions/ai';
import MarketTrendChart from './MarketTrendChart'; // Assuming same directory
import { Search, Loader2, Activity, Sparkles, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function MarketIntelligence() {
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<any[]>([]);
    const [searchedTerm, setSearchedTerm] = useState('');
    const [error, setError] = useState('');

    // AI Insight State
    const [insightLoading, setInsightLoading] = useState(false);
    const [insight, setInsight] = useState<{ insight: string, sentiment: string, recommendation: string } | null>(null);

    const handleSearch = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!query.trim()) return;

        setLoading(true);
        setError('');
        setInsight(null); // Reset insight on new search

        const res = await getMarketTrends(query);

        if (res.success) {
            setData(res.data || []);
            setSearchedTerm(query);
            if (res.data?.length === 0) {
                setError('No se encontraron datos de mercado recientes para esta búsqueda.');
            }
        } else {
            setError('Error al obtener datos: ' + res.error);
        }

        setLoading(false);
    };

    const handleGetInsight = async () => {
        if (!data.length || !searchedTerm) return;

        setInsightLoading(true);

        // Calculate basic stats to send to AI
        const prices = data.map(d => d.price);
        const stats = {
            count: data.length,
            min: Math.min(...prices),
            max: Math.max(...prices),
            avg: Math.round(prices.reduce((a, b) => a + b, 0) / prices.length),
            trend: "Calculated from recent listings"
        };

        const res = await getMarketInsight(stats, searchedTerm);

        if (res.success) {
            setInsight(res.data);
        }

        setInsightLoading(false);
    };

    return (
        <div className="space-y-8">
            <div className="bg-white/60 dark:bg-black/40 backdrop-blur-xl rounded-[2.5rem] border border-gray-200/50 dark:border-white/10 p-8 shadow-apple-sm group transition-all duration-500 hover:shadow-apple-md">
                <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <div className="p-2 bg-blue-500/10 rounded-xl">
                                <Search className="text-blue-500" size={24} strokeWidth={2.5} />
                            </div>
                            <h2 className="text-2xl font-black tracking-tight text-gray-900 dark:text-white uppercase">
                                Market Pulse Explorer
                            </h2>
                        </div>
                        <p className="text-sm text-gray-400 font-medium ml-12">
                            Analiza la dispersión de precios real basada en {data.length > 0 ? data.length : 'miles de'} anuncios scrapeados.
                        </p>
                    </div>

                    <form onSubmit={handleSearch} className="flex gap-3 w-full xl:w-auto ml-12 xl:ml-0">
                        <div className="relative flex-1 xl:w-80 group/input">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within/input:text-blue-500 transition-colors" size={18} />
                            <input
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Ej: Roland Juno-106"
                                className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-bold text-gray-900 dark:text-white placeholder:text-gray-400"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading || !query}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-lg shadow-blue-500/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shrink-0"
                        >
                            {loading ? <Loader2 className="animate-spin" size={18} /> : <Activity size={18} />}
                            {loading ? 'Analizando...' : 'Escanear'}
                        </button>
                    </form>
                </div>

                {error && (
                    <div className="mt-8 p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl text-sm font-bold flex items-center gap-2 animate-in slide-in-from-top-2">
                        <Activity size={16} />
                        {error}
                    </div>
                )}

                {!searchedTerm && !loading && (
                    <div className="text-center py-20 group-hover:scale-[1.02] transition-transform duration-700">
                        <div className="w-24 h-24 bg-blue-500/5 rounded-full flex items-center justify-center mx-auto mb-6 relative">
                            <Search size={40} className="text-blue-500/30" />
                            <div className="absolute inset-0 border-2 border-dashed border-blue-500/10 rounded-full animate-[spin_10s_linear_infinite]" />
                        </div>
                        <h3 className="text-lg font-black text-gray-300 dark:text-gray-700 uppercase tracking-widest">Listo para Escanear</h3>
                        <p className="text-sm text-gray-400 mt-2 max-w-xs mx-auto font-medium">Introduce un modelo para visualizar la inteligencia de mercado en tiempo real.</p>
                    </div>
                )}
            </div>

            {searchedTerm && data.length > 0 && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-6">
                    <MarketTrendChart data={data} title={searchedTerm} />

                    {/* AI INSIGHT SECTION */}
                    <div className="glass-panel p-6 rounded-[2rem] border-purple-500/10 bg-purple-500/[0.02]">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-purple-500/10 text-purple-600 rounded-2xl">
                                    <Sparkles size={24} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Análisis Financiero IA</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Obtén una opinión cualitativa basada en estos datos.</p>
                                </div>
                            </div>

                            {!insight ? (
                                <Button
                                    onClick={handleGetInsight}
                                    isLoading={insightLoading}
                                    className="bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-500/20 border-none"
                                    icon={Sparkles}
                                >
                                    Generar Insight
                                </Button>
                            ) : (
                                <div className="hidden md:block">
                                    <span className="text-xs font-bold text-purple-400 uppercase tracking-widest">Análisis Generado</span>
                                </div>
                            )}
                        </div>

                        {insight && (
                            <div className="mt-6 pt-6 border-t border-purple-500/10 animate-in fade-in slide-in-from-top-2">
                                <div className="flex flex-col md:flex-row gap-6">
                                    <div className="flex-1">
                                        <p className="text-lg font-medium text-gray-800 dark:text-gray-200 leading-relaxed">
                                            "{insight.insight}"
                                        </p>
                                    </div>
                                    <div className="flex gap-3 shrink-0">
                                        <div className={`px-4 py-2 rounded-xl border flex flex-col items-center justify-center min-w-[100px] ${insight.sentiment === 'bullish' ? 'bg-green-500/10 border-green-500/20 text-green-600' :
                                            insight.sentiment === 'bearish' ? 'bg-red-500/10 border-red-500/20 text-red-600' :
                                                'bg-gray-500/10 border-gray-500/20 text-gray-600'
                                            }`}>
                                            {insight.sentiment === 'bullish' ? <TrendingUp size={20} className="mb-1" /> :
                                                insight.sentiment === 'bearish' ? <TrendingDown size={20} className="mb-1" /> :
                                                    <Minus size={20} className="mb-1" />}
                                            <span className="text-[10px] font-black uppercase tracking-wider">{insight.sentiment}</span>
                                        </div>

                                        <div className={`px-4 py-2 rounded-xl border flex flex-col items-center justify-center min-w-[100px] ${insight.recommendation === 'buy' ? 'bg-blue-500/10 border-blue-500/20 text-blue-600' :
                                            insight.recommendation === 'sell' ? 'bg-orange-500/10 border-orange-500/20 text-orange-600' :
                                                'bg-purple-500/10 border-purple-500/20 text-purple-600'
                                            }`}>
                                            <span className="text-xl font-black mb-1 leading-none">
                                                {insight.recommendation === 'buy' ? 'COMPRAR' :
                                                    insight.recommendation === 'sell' ? 'VENDER' : 'MANTENER'}
                                            </span>
                                            <span className="text-[10px] font-bold uppercase tracking-wider opacity-60">Recomendación</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

