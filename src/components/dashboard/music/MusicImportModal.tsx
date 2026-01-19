'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { X, Search, Plus, Music, Disc, Loader2, Check } from 'lucide-react';
import { searchMusic, importAlbum } from '@/actions/music';
import { toast } from 'sonner';
import Image from 'next/image';

interface MusicImportModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function MusicImportModal({ open, onOpenChange }: MusicImportModalProps) {
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<{ discogs: any[], spotify: any[] }>({ discogs: [], spotify: [] });
    const [importingId, setImportingId] = useState<string | null>(null);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;

        setLoading(true);
        try {
            const response = await searchMusic(query);
            if (response.success) {
                setResults({ discogs: response.discogs, spotify: response.spotify });
            } else {
                toast.error(response.error || 'Error en la búsqueda');
                setResults({ discogs: [], spotify: [] });
            }
        } catch (error) {
            console.error('Search error:', error);
            toast.error('Error en la búsqueda');
            setResults({ discogs: [], spotify: [] });
        } finally {
            setLoading(false);
        }
    };

    const handleImport = async (source: 'discogs' | 'spotify', id: string) => {
        setImportingId(id);
        try {
            const res = await importAlbum(source, id);
            if (res.success) {
                toast.success('Álbum añadido a tu colección');
                // Optional: refresh or close
            } else {
                toast.error(res.error || 'Error al importar');
            }
        } catch (error) {
            toast.error('Algo salió mal');
        } finally {
            setImportingId(null);
        }
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] w-full max-w-4xl max-h-[90vh] shadow-2xl overflow-hidden border border-gray-100 dark:border-white/5 flex flex-col animate-in zoom-in-95">

                {/* Header */}
                <div className="p-8 border-b border-gray-50 dark:border-white/5 flex justify-between items-center bg-gray-50/50 dark:bg-white/5">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Importar Música</h2>
                        <p className="text-sm text-gray-500">Busca en Discogs y Spotify para añadir a tu colección</p>
                    </div>
                    <button onClick={() => onOpenChange(false)} className="p-2 hover:bg-gray-200 dark:hover:bg-white/10 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Search Bar */}
                <div className="p-8 pb-4">
                    <form onSubmit={handleSearch} className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-ios-blue transition-colors" size={20} />
                        <input
                            autoFocus
                            className="w-full bg-gray-50 dark:bg-black/20 border-2 border-transparent focus:border-ios-blue/30 focus:bg-white dark:focus:bg-black/40 rounded-2xl py-4 pl-12 pr-4 outline-none transition-all text-lg font-medium"
                            placeholder="Artista, álbum o código de barras..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                        <Button
                            type="submit"
                            disabled={loading}
                            className="absolute right-2 top-1/2 -translate-y-1/2 h-10 px-6 rounded-xl"
                        >
                            {loading ? <Loader2 className="animate-spin" size={20} /> : 'Buscar'}
                        </Button>
                    </form>
                </div>

                {/* Results Area */}
                <div className="flex-1 overflow-y-auto p-8 pt-0 grid grid-cols-1 md:grid-cols-2 gap-10">

                    {/* Discogs Results */}
                    <div className="space-y-6">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
                            <Disc size={14} className="text-orange-500" /> Discogs (Vinilos / CDs)
                        </h3>
                        <div className="space-y-3">
                            {results.discogs.map((item: any) => (
                                <div key={item.id} className="flex gap-4 p-3 rounded-2xl bg-gray-50 dark:bg-white/5 border border-transparent hover:border-ios-blue/20 transition-all group">
                                    <div className="w-16 h-16 bg-gray-200 rounded-xl overflow-hidden shrink-0 relative shadow-sm">
                                        {item.cover_image && <Image src={item.cover_image} alt="cover" fill className="object-cover" />}
                                    </div>
                                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                                        <p className="font-bold text-sm truncate">{item.title}</p>
                                        <p className="text-[10px] text-gray-500 truncate">{item.label?.[0]} • {item.year}</p>
                                    </div>
                                    <button
                                        disabled={importingId === item.id.toString()}
                                        onClick={() => handleImport('discogs', item.id.toString())}
                                        className="self-center p-2 bg-white dark:bg-white/10 rounded-xl shadow-sm hover:scale-110 active:scale-95 transition-all text-ios-blue disabled:opacity-50"
                                    >
                                        {importingId === item.id.toString() ? <Loader2 className="animate-spin" size={20} /> : <Plus size={20} />}
                                    </button>
                                </div>
                            ))}
                            {!loading && results.discogs.length === 0 && query && (
                                <p className="text-xs text-gray-400 italic">No se encontraron resultados en Discogs</p>
                            )}
                        </div>
                    </div>

                    {/* Spotify Results */}
                    <div className="space-y-6">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
                            <Music size={14} className="text-green-500" /> Spotify (Digital / High Res Covers)
                        </h3>
                        <div className="space-y-3">
                            {results.spotify.map((item: any) => (
                                <div key={item.id} className="flex gap-4 p-3 rounded-2xl bg-gray-50 dark:bg-white/5 border border-transparent hover:border-ios-blue/20 transition-all group">
                                    <div className="w-16 h-16 bg-gray-200 rounded-xl overflow-hidden shrink-0 relative shadow-sm">
                                        {item.images?.[0]?.url && <Image src={item.images[0].url} alt="cover" fill className="object-cover" />}
                                    </div>
                                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                                        <p className="font-bold text-sm truncate">{item.name}</p>
                                        <p className="text-[10px] text-gray-500 truncate">{item.artists?.[0]?.name} • {item.release_date?.split('-')[0]}</p>
                                    </div>
                                    <button
                                        disabled={importingId === item.id}
                                        onClick={() => handleImport('spotify', item.id)}
                                        className="self-center p-2 bg-white dark:bg-white/10 rounded-xl shadow-sm hover:scale-110 active:scale-95 transition-all text-ios-blue disabled:opacity-50"
                                    >
                                        {importingId === item.id ? <Loader2 className="animate-spin" size={20} /> : <Plus size={20} />}
                                    </button>
                                </div>
                            ))}
                            {!loading && results.spotify.length === 0 && query && (
                                <p className="text-xs text-gray-400 italic">No se encontraron resultados en Spotify</p>
                            )}
                        </div>
                    </div>

                </div>

                {/* Footer */}
                <div className="p-6 bg-gray-50 dark:bg-white/5 border-t border-gray-100 dark:border-white/5 flex justify-between items-center">
                    <p className="text-[10px] text-gray-400 max-w-xs font-medium">
                        Las portadas se importan en alta resolución directamente de los proveedores oficiales.
                    </p>
                    <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>Cerrar</Button>
                </div>
            </div>
        </div>
    );
}
