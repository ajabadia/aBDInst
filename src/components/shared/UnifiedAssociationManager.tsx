'use client';

import { useState, useEffect } from 'react';
import { Search, Plus, Globe, Loader2, Music2, Disc3, Check, X, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { motion, AnimatePresence } from 'framer-motion';
import { useDebounce } from '@/hooks/use-debounce';
import Image from 'next/image';
import { toast } from 'sonner';

// Actions
import { getCatalogMetadata, upsertMetadata } from '@/actions/metadata';
import { searchMusic, searchArtistExternal, fetchArtistExternal, importAlbum } from '@/actions/music';

interface Props {
    entityType: 'artist' | 'album';
    onSelect: (item: any) => void;
    onCancel: () => void;
    excludeIds?: string[];
}

export default function UnifiedAssociationManager({ entityType, onSelect, onCancel, excludeIds = [] }: Props) {
    const [mode, setMode] = useState<'search' | 'create'>('search');
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [localResults, setLocalResults] = useState<any[]>([]);

    // Create Mode State
    const [newItem, setNewItem] = useState<{
        name: string;
        key: string;
        assetUrl?: string;
        description?: string;
        discogsId?: string;
        images?: any[];
    }>({ name: '', key: '' });

    // External Search State (for Auto-Enrichment)
    const [externalQuery, setExternalQuery] = useState('');
    const [externalResults, setExternalResults] = useState<any[]>([]);
    const [searchingExternal, setSearchingExternal] = useState(false);
    const debouncedExternalQuery = useDebounce(externalQuery, 500);

    // Initial load of local data
    useEffect(() => {
        if (mode === 'search') {
            loadLocalData();
        }
    }, [mode, entityType]);

    // Handle Local Search
    const loadLocalData = async () => {
        setLoading(true);
        if (entityType === 'artist') {
            const data = await getCatalogMetadata('artist');
            setLocalResults(data as any[]);
        } else {
            const { getUserMusicCollection } = await import('@/actions/music');
            const data = await getUserMusicCollection();
            setLocalResults(data);
        }
        setLoading(false);
    };

    // Handle External Search (Auto-Enrichment)
    useEffect(() => {
        if (debouncedExternalQuery && mode === 'create') {
            if (entityType === 'artist') {
                performExternalArtistSearch();
            } else {
                performExternalAlbumSearch();
            }
        }
    }, [debouncedExternalQuery]);

    const performExternalArtistSearch = async () => {
        setSearchingExternal(true);
        const res = await searchArtistExternal(debouncedExternalQuery);
        if (res.success) setExternalResults(res.data || []);
        setSearchingExternal(false);
    };

    const performExternalAlbumSearch = async () => {
        setSearchingExternal(true);
        const res = await searchMusic(debouncedExternalQuery);
        if (res.success) {
            // Combine Discogs and Spotify results for the picker
            const combined = [
                ...(res.discogs || []).map((d: any) => ({ ...d, source: 'discogs' })),
                ...(res.spotify || []).map((s: any) => ({ ...s, source: 'spotify' }))
            ];
            setExternalResults(combined);
        }
        setSearchingExternal(false);
    };

    // Filter local results based on query
    const filteredResults = localResults.filter(item => {
        const label = entityType === 'artist' ? item.label : item.albumId?.title || item.title;
        const id = entityType === 'artist' ? item.key : item.albumId?._id || item._id;

        if (excludeIds.includes(id)) return false;
        if (!query) return true;
        return label?.toLowerCase().includes(query.toLowerCase());
    });

    const handleCreateArtist = async () => {
        if (!newItem.name || !newItem.key) return;

        setLoading(true);
        // If we have selected a Discogs ID, fetch full details first to get all images
        let finalImages = newItem.images || [];

        if (newItem.discogsId) {
            const enrichment = await fetchArtistExternal(newItem.discogsId);
            if (enrichment.success && enrichment.data?.images) {
                finalImages = enrichment.data.images.map((img: any, idx: number) => ({
                    url: img.resource_url,
                    isPrimary: idx === 0,
                    source: 'discogs',
                    externalId: newItem.discogsId
                }));
            }
        }

        const res = await upsertMetadata({
            type: 'artist',
            key: newItem.key.toLowerCase().trim().replace(/\s+/g, '-'),
            label: newItem.name,
            assetUrl: finalImages.find(i => i.isPrimary)?.url || newItem.assetUrl,
            images: finalImages,
            description: newItem.description
        });

        if (res.success) {
            toast.success('Artista creado correctamente');
            onSelect(res.data);
        } else {
            toast.error('Error al crear artista: ' + res.error);
        }
        setLoading(false);
    };

    const handleSelectExternalArtist = (artist: any) => {
        setNewItem({
            ...newItem,
            name: artist.title,
            key: artist.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            assetUrl: artist.thumb,
            discogsId: artist.id.toString(),
            images: [{ url: artist.thumb, isPrimary: true, source: 'discogs' }]
        });
        setExternalResults([]);
        setExternalQuery('');
        toast.info('Datos importados de Discogs. Revisa y guarda.');
    };

    const handleImportAlbum = async (album: any) => {
        setLoading(true);
        const source = album.source || (album.uri?.includes('spotify') ? 'spotify' : 'discogs');
        const id = album.id?.toString() || album.uri?.split(':').pop();

        if (!id) {
            toast.error('No se pudo determinar el ID del álbum');
            setLoading(false);
            return;
        }

        const res = await importAlbum(source as 'discogs' | 'spotify', id);

        if (res.success) {
            toast.success('Álbum importado y guardado');
            // Re-fetch local data to include the new album
            await loadLocalData();
            setMode('search');
            setExternalQuery('');
            setExternalResults([]);
            // Optionally select it automatically
            if (res.data) onSelect(res.data);
        } else {
            toast.error('Error al importar álbum: ' + res.error);
        }
        setLoading(false);
    };

    return (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden flex flex-col max-h-[80vh]">

            {/* Header */}
            <div className="p-4 border-b border-black/5 dark:border-white/5 bg-gray-50 dark:bg-black/20 flex justify-between items-center">
                <h3 className="font-bold text-lg flex items-center gap-2">
                    {mode === 'search' ? (
                        <>
                            <Search className="w-5 h-5 text-ios-blue" />
                            {entityType === 'artist' ? 'Vincular Artista' : 'Vincular Álbum'}
                        </>
                    ) : (
                        <>
                            <Plus className="w-5 h-5 text-ios-green" />
                            {entityType === 'artist' ? 'Crear Nuevo Artista' : 'Importar Álbum'}
                        </>
                    )}
                </h3>
                <Button variant="ghost" size="sm" onClick={onCancel}><X size={18} /></Button>
            </div>

            {/* Mode: Search (Default) */}
            {mode === 'search' && (
                <div className="flex-1 overflow-hidden flex flex-col">
                    <div className="p-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
                            <input
                                type="text"
                                placeholder={`Buscar ${entityType === 'artist' ? 'artista...' : 'álbum...'}`}
                                className="w-full pl-10 pr-4 py-2.5 bg-gray-100 dark:bg-black/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-ios-blue/50"
                                value={query}
                                onChange={e => setQuery(e.target.value)}
                                autoFocus
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-2 space-y-1">
                        {loading && <div className="p-4 text-center"><Loader2 className="animate-spin mx-auto text-ios-blue" /></div>}

                        {!loading && filteredResults.length === 0 && (
                            <div className="text-center py-8">
                                <p className="text-sm text-gray-500 mb-4">No se encontraron resultados locales.</p>
                                <Button onClick={() => setMode('create')} variant="primary" icon={Plus}>
                                    {entityType === 'artist' ? 'Crear Artista Nuevo' : 'Buscar en Discogs/Spotify'}
                                </Button>
                            </div>
                        )}

                        {filteredResults.map((item) => (
                            <button
                                key={item.id || item._id}
                                onClick={() => onSelect(item)}
                                className="w-full text-left p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 flex items-center gap-3 transition-colors group"
                            >
                                <div className="w-10 h-10 rounded-lg bg-gray-200 dark:bg-gray-800 overflow-hidden flex-shrink-0">
                                    {/* Handle different image structures */}
                                    {(item.assetUrl || item.albumId?.coverImage || item.coverImage) ? (
                                        <Image
                                            src={item.assetUrl || item.albumId?.coverImage || item.coverImage}
                                            alt="cover"
                                            width={40}
                                            height={40}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                                            {entityType === 'artist' ? <Globe size={18} /> : <Disc3 size={18} />}
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-sm text-gray-900 dark:text-white truncate">
                                        {entityType === 'artist' ? item.label : (item.albumId?.title || item.title)}
                                    </p>
                                    <p className="text-xs text-gray-500 truncate">
                                        {entityType === 'artist' ? (item.key || 'Sin ID') : (item.albumId?.artist || item.artist)}
                                    </p>
                                </div>
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                    <div className="w-6 h-6 rounded-full bg-ios-blue text-white flex items-center justify-center">
                                        <Plus size={14} />
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Mode: Create (Artist or Album) */}
            {mode === 'create' && (
                <div className="p-6 space-y-6 overflow-y-auto">
                    {/* Auto-Enrichment Search (Unified for Artist/Album) */}
                    <div className="bg-ios-blue/5 border border-ios-blue/10 rounded-2xl p-4 space-y-3">
                        <label className="text-xs font-bold text-ios-blue uppercase tracking-wider flex items-center gap-2">
                            <Globe size={12} /> {entityType === 'artist' ? 'Importar Artista desde Discogs' : 'Importar Álbum desde Discogs/Spotify'}
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                placeholder={entityType === 'artist' ? "Escribe el nombre del artista..." : "Escribe el título del álbum o artista..."}
                                className="w-full px-4 py-2 bg-white dark:bg-black/20 border border-ios-blue/20 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ios-blue"
                                value={externalQuery}
                                onChange={(e) => setExternalQuery(e.target.value)}
                            />
                            {searchingExternal && <Loader2 className="absolute right-3 top-2.5 w-4 h-4 animate-spin text-ios-blue" />}
                        </div>

                        {/* External Results Dropdown */}
                        {externalResults.length > 0 && (
                            <div className="max-h-60 overflow-y-auto bg-white dark:bg-gray-800 rounded-xl border border-black/5 shadow-lg mt-2">
                                {externalResults.map(res => (
                                    <button
                                        type="button"
                                        key={res.id || res.uri}
                                        onClick={() => {
                                            if (entityType === 'artist') {
                                                handleSelectExternalArtist(res);
                                            } else {
                                                handleImportAlbum(res);
                                            }
                                        }}
                                        className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-white/5 flex items-center gap-3 border-b border-gray-100 dark:border-white/5 last:border-0"
                                    >
                                        <div className="w-10 h-10 rounded bg-gray-200 overflow-hidden flex-shrink-0">
                                            {(res.thumb || res.images?.[0]?.url) ? (
                                                <img src={res.thumb || res.images?.[0]?.url} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                    {entityType === 'artist' ? <Users size={16} /> : <Disc3 size={16} />}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-bold text-gray-900 dark:text-gray-100 truncate">{res.title || res.name}</p>
                                            <p className="text-[10px] text-gray-500 truncate">
                                                {entityType === 'artist' ? 'Artista' : (res.artist || res.artists?.[0]?.name || 'Álbum')}
                                            </p>
                                        </div>
                                        <div className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 dark:bg-white/10 text-gray-500 uppercase">
                                            {res.uri?.includes('spotify') ? 'Spotify' : 'Discogs'}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Artist Creation Fields (Only for Artists) */}
                    {entityType === 'artist' && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold">Nombre del Artista</label>
                                    <input
                                        type="text"
                                        className="apple-input-field"
                                        value={newItem.name}
                                        onChange={e => setNewItem({ ...newItem, name: e.target.value, key: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-') })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold">Identificador (Key)</label>
                                    <input
                                        type="text"
                                        className="apple-input-field font-mono text-xs"
                                        value={newItem.key}
                                        onChange={e => setNewItem({ ...newItem, key: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold">URL de Imagen (Logo/Foto)</label>
                                <div className="flex gap-4">
                                    <div className="w-16 h-16 rounded-xl bg-gray-100 dark:bg-black/40 flex-shrink-0 overflow-hidden border border-black/5 flex items-center justify-center">
                                        {newItem.assetUrl ? (
                                            <img src={newItem.assetUrl} className="w-full h-full object-cover" />
                                        ) : (
                                            <Globe className="text-gray-400" />
                                        )}
                                    </div>
                                    <input
                                        type="text"
                                        className="apple-input-field flex-1"
                                        value={newItem.assetUrl || ''}
                                        onChange={e => setNewItem({ ...newItem, assetUrl: e.target.value })}
                                        placeholder="https://"
                                    />
                                </div>
                            </div>

                            {newItem.discogsId && (
                                <div className="p-3 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-xs rounded-xl flex items-center gap-2">
                                    <Check size={14} />
                                    Vinculado a Discogs ID: {newItem.discogsId}. Se importarán imágenes adicionales automáticamente.
                                </div>
                            )}
                        </div>
                    )}

                    {/* Album Note (Only for Albums) */}
                    {entityType === 'album' && (
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 text-xs rounded-xl border border-blue-100 dark:border-blue-900/30">
                            <AlertCircle className="w-4 h-4 mb-2" />
                            Busca un álbum arriba para importarlo desde fuentes externas. Los álbumes importados se añadirán a tu catálogo y estarán disponibles para vincular.
                        </div>
                    )}

                    <div className="flex gap-3 pt-4">
                        <Button variant="ghost" onClick={() => setMode('search')} className="flex-1">Volver</Button>
                        {entityType === 'artist' && (
                            <Button variant="primary" onClick={handleCreateArtist} isLoading={loading} className="flex-1">Guardar Artista</Button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
