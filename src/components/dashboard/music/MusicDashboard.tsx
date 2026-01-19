'use client';

import { useState } from 'react';
import { Plus, Disc, Music, Grid, List, Search, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import Image from 'next/image';
import MusicImportModal from './MusicImportModal';

interface MusicDashboardProps {
    collection: any[];
    user: any;
}

export default function MusicDashboard({ collection, user }: MusicDashboardProps) {
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const filteredCollection = collection.filter(item => {
        const album = item.albumId;
        const searchStr = `${album.artist} ${album.title} ${album.genres?.join(' ')}`.toLowerCase();
        return searchStr.includes(searchQuery.toLowerCase());
    });

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

            {/* --- 1. HEADER & ACTIONS --- */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight">Mi Discoteca</h1>
                    <p className="text-gray-500">Gestiona tus vinilos, CDs y álbumes digitales.</p>
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                    <Button
                        onClick={() => setIsImportModalOpen(true)}
                        className="bg-ios-blue text-white rounded-2xl px-6 h-12 shadow-lg shadow-ios-blue/20 hover:scale-105 transition-all text-sm font-bold"
                        icon={Plus}
                    >
                        Importar Álbum
                    </Button>
                </div>
            </div>

            {/* --- 2. FILTERS & SEARCH --- */}
            <div className="flex flex-col md:flex-row gap-4 items-center bg-white dark:bg-white/5 p-4 rounded-3xl border border-black/5 dark:border-white/5 shadow-sm">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        className="w-full bg-gray-50 dark:bg-black/20 border-none rounded-2xl py-3 pl-11 pr-4 outline-none text-sm transition-all focus:ring-2 ring-ios-blue/20"
                        placeholder="Buscar en tu discoteca..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex gap-2 bg-gray-100 dark:bg-black/40 p-1.5 rounded-2xl">
                    <button
                        onClick={() => setViewMode('grid')}
                        className={`p-2 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-white/10 shadow-sm text-ios-blue' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        <Grid size={20} />
                    </button>
                    <button
                        onClick={() => setViewMode('list')}
                        className={`p-2 rounded-xl transition-all ${viewMode === 'list' ? 'bg-white dark:bg-white/10 shadow-sm text-ios-blue' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        <List size={20} />
                    </button>
                </div>
                <Button variant="outline" className="rounded-2xl h-12 px-5 border-black/5 dark:border-white/5" icon={SlidersHorizontal}>
                    Filtros
                </Button>
            </div>

            {/* --- 3. COLLECTION GRID/LIST --- */}
            {filteredCollection.length > 0 ? (
                <div className={viewMode === 'grid'
                    ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6"
                    : "space-y-4"
                }>
                    {filteredCollection.map((item) => (
                        <div
                            key={item._id}
                            className={`group cursor-pointer transition-all ${viewMode === 'grid'
                                    ? 'space-y-3'
                                    : 'flex items-center gap-6 p-4 bg-white dark:bg-white/5 rounded-3xl border border-black/5 dark:border-white/5'
                                }`}
                        >
                            <div className={`relative bg-gray-200 dark:bg-black/40 rounded-[1.5rem] overflow-hidden shadow-apple-sm transition-all group-hover:shadow-apple-lg group-hover:-translate-y-1 ${viewMode === 'grid' ? 'aspect-square' : 'w-24 h-24 shrink-0'
                                }`}>
                                {item.albumId.coverImage ? (
                                    <Image
                                        src={item.albumId.coverImage}
                                        alt={item.albumId.title}
                                        fill
                                        className="object-cover"
                                    />
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                                        <Disc size={viewMode === 'grid' ? 48 : 32} />
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                            </div>

                            <div className="min-w-0">
                                <h3 className={`font-bold tracking-tight truncate ${viewMode === 'grid' ? 'text-sm' : 'text-lg'}`}>
                                    {item.albumId.title}
                                </h3>
                                <p className={`text-gray-500 truncate ${viewMode === 'grid' ? 'text-xs' : 'text-base'}`}>
                                    {item.albumId.artist}
                                </p>
                                {viewMode === 'list' && (
                                    <div className="flex gap-2 mt-2">
                                        {item.albumId.genres?.slice(0, 3).map((g: string) => (
                                            <span key={g} className="px-2 py-0.5 bg-gray-100 dark:bg-white/5 rounded-full text-[10px] font-bold text-gray-400 uppercase tracking-wider">{g}</span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="py-20 text-center space-y-4">
                    <div className="inline-block p-6 bg-gray-50 dark:bg-white/5 rounded-full text-gray-300">
                        <Music size={48} />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold">No hay álbumes en tu colección</h3>
                        <p className="text-gray-500">Empieza importando tus discos favoritos.</p>
                    </div>
                    <Button onClick={() => setIsImportModalOpen(true)} className="mt-4">Importar mi primer álbum</Button>
                </div>
            )}

            <MusicImportModal
                open={isImportModalOpen}
                onOpenChange={setIsImportModalOpen}
            />
        </div>
    );
}
