'use client';

import React, { useState } from 'react';
import { Search, Loader2, Image as ImageIcon, ExternalLink } from 'lucide-react';
import { searchHighResStock } from '@/actions/unsplash';
import { toast } from 'sonner';

interface UnsplashImage {
    id: string;
    url: string;
    thumb: string;
    full: string;
    attribution: string;
    user: string;
    userLink: string;
}

interface UnsplashImagePickerProps {
    onSelect: (image: UnsplashImage) => void;
    defaultQuery?: string;
}

/**
 * Admin component to search and pick high-resolution imagery from Unsplash.
 */
export default function UnsplashImagePicker({ onSelect, defaultQuery = '' }: UnsplashImagePickerProps) {
    const [query, setQuery] = useState(defaultQuery);
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<UnsplashImage[]>([]);

    const handleSearch = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (query.trim().length < 2) return;

        setLoading(true);
        try {
            const response = await searchHighResStock({ query, per_page: 12 });
            if (response.success && response.data) {
                setResults(response.data);
                if (response.data.length === 0) {
                    toast.info('No se encontraron imágenes');
                }
            } else {
                toast.error(response.error || 'Error en la búsqueda');
            }
        } catch (error) {
            toast.error('Error al conectar con el servidor');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-4 p-4 border rounded-xl bg-gray-50 dark:bg-gray-900/50">
            <div className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-blue-500" />
                <h3 className="font-semibold">Buscar en Unsplash</h3>
            </div>

            <form onSubmit={handleSearch} className="flex gap-2">
                <div className="relative flex-1">
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Ej: Fender Stratocaster, Moog Synth..."
                        className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                </div>
                <button
                    type="submit"
                    disabled={loading || query.length < 2}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 transition-colors flex items-center gap-2"
                >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Buscar'}
                </button>
            </form>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-96 overflow-y-auto pr-2">
                {results.map((img) => (
                    <div
                        key={img.id}
                        className="group relative aspect-square rounded-lg overflow-hidden border border-transparent hover:border-blue-500 cursor-pointer transition-all"
                        onClick={() => onSelect(img)}
                    >
                        <img src={img.thumb} alt={img.attribution} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="text-white text-xs font-medium bg-blue-600/80 px-2 py-1 rounded">Seleccionar</span>
                        </div>
                        <a
                            href={img.userLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="absolute bottom-1 right-1 p-1 bg-black/50 rounded-full text-white/70 hover:text-white"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <ExternalLink className="w-3 h-3" />
                        </a>
                    </div>
                ))}
            </div>

            {results.length > 0 && (
                <p className="text-[10px] text-gray-400 text-center italic">
                    Las imágenes se importarán con los créditos correspondientes según los términos de Unsplash.
                </p>
            )}
        </div>
    );
}
