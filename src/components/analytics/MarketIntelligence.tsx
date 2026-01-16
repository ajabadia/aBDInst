'use client';

import { useState } from 'react';
import { getMarketTrends } from '@/actions/analytics';
import MarketTrendChart from './MarketTrendChart'; // Assuming same directory
import { Search, Loader2 } from 'lucide-react';

export default function MarketIntelligence() {
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<any[]>([]);
    const [searchedTerm, setSearchedTerm] = useState('');
    const [error, setError] = useState('');

    const handleSearch = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!query.trim()) return;

        setLoading(true);
        setError('');

        const res = await getMarketTrends(query);

        if (res.success) {
            setData(res.data);
            setSearchedTerm(query);
            if (res.data.length === 0) {
                setError('No se encontraron datos de mercado recientes para esta búsqueda.');
            }
        } else {
            setError('Error al obtener datos: ' + res.error);
        }

        setLoading(false);
    };

    return (
        <div className="space-y-6">
            <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div>
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <Search className="text-blue-500" size={24} />
                            Explorador de Mercado
                        </h2>
                        <p className="text-sm text-gray-500">
                            Analiza la tendencia de precios real basada en anuncios scrapeados.
                        </p>
                    </div>

                    <form onSubmit={handleSearch} className="flex gap-2 w-full md:w-auto">
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Ej: Roland Juno-106"
                            className="apple-input w-full md:w-64"
                        />
                        <button
                            type="submit"
                            disabled={loading || !query}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-medium transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {loading ? <Loader2 className="animate-spin" size={20} /> : <Search size={20} />}
                            <span className="hidden md:inline">Analizar</span>
                        </button>
                    </form>
                </div>

                {error && (
                    <div className="p-4 bg-yellow-50 text-yellow-800 rounded-xl text-sm mb-4">
                        {error}
                    </div>
                )}

                {!searchedTerm && !loading && (
                    <div className="text-center py-10 text-gray-400">
                        <Search size={48} className="mx-auto mb-4 opacity-20" />
                        <p>Busca un instrumento para ver su gráfica de dispersión de precios.</p>
                    </div>
                )}

                {searchedTerm && data.length > 0 && (
                    <MarketTrendChart data={data} title={searchedTerm} />
                )}
            </div>
        </div>
    );
}
