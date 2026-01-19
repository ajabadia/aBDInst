'use client';

import { useState } from 'react';
import { Music2, Users, Disc3, Edit, Save, X, Plus, Search, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { toast } from 'sonner';
import { removeArtistRelation, removeAlbumRelation } from '@/actions/instrument-relationships';

interface Artist {
    _id: string;
    name: string;
    key: string;
    assetUrl?: string;
    yearsUsed?: string;
    notes?: string;
}

interface Album {
    _id: string;
    title: string;
    artist: string;
    year?: number;
    coverImage?: string;
    format?: string;
    isMaster?: boolean;
    masterId?: string;
    notes?: string;
}

interface MusicalContextSectionProps {
    artists: Artist[];
    albums: Album[];
    availableArtists: any[]; // New prop
    canEdit: boolean;
    instrumentId: string;
}

export default function MusicalContextSection({
    artists: initialArtists,
    albums: initialAlbums,
    availableArtists,
    canEdit,
    instrumentId
}: MusicalContextSectionProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [artists, setArtists] = useState(initialArtists);
    const [albums, setAlbums] = useState(initialAlbums);
    const [isSaving, setIsSaving] = useState(false);
    const [showArtistSelector, setShowArtistSelector] = useState(false);

    const hasContent = artists.length > 0 || albums.length > 0;

    const handleRemoveArtist = async (relationId: string) => {
        setIsSaving(true);
        const result = await removeArtistRelation(relationId, instrumentId);
        if (result.success) {
            setArtists(artists.filter(a => a._id !== relationId));
            toast.success('Artista desvinculado');
        } else {
            toast.error('Error al desvincular artista: ' + result.error);
        }
        setIsSaving(false);
    };

    const handleRemoveAlbum = async (relationId: string) => {
        setIsSaving(true);
        const result = await removeAlbumRelation(relationId, instrumentId);
        if (result.success) {
            setAlbums(albums.filter(a => a._id !== relationId));
            toast.success('Álbum desvinculado');
        } else {
            toast.error('Error al desvincular álbum: ' + result.error);
        }
        setIsSaving(false);
    };

    if (!hasContent && !canEdit) {
        return null; // Don't show section if no content and user can't edit
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="apple-card p-6 md:p-8 bg-gradient-to-br from-purple-50/50 to-blue-50/50 dark:from-purple-900/10 dark:to-blue-900/10 border border-purple-100 dark:border-purple-900/30"
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                        <Music2 className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                            Musical Context
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            Artistas y álbumes donde destaca este instrumento
                        </p>
                    </div>
                </div>

                {canEdit && (
                    <div className="flex gap-2">
                        {isEditing && (
                            <Button
                                variant="primary"
                                size="sm"
                                icon={Save}
                                isLoading={isSaving}
                                onClick={() => setIsEditing(false)}
                            >
                                Guardar
                            </Button>
                        )}
                        <Button
                            variant={isEditing ? 'secondary' : 'primary'}
                            size="sm"
                            icon={isEditing ? X : Edit}
                            onClick={() => setIsEditing(!isEditing)}
                            disabled={isSaving}
                        >
                            {isEditing ? 'Cancelar' : 'Editar'}
                        </Button>
                    </div>
                )}
            </div>

            {/* Content */}
            {!hasContent && !isEditing ? (
                <div className="text-center py-12 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl">
                    <Music2 className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                        Aún no se ha añadido contexto musical
                    </p>
                    {canEdit && (
                        <Button
                            variant="primary"
                            size="sm"
                            onClick={() => setIsEditing(true)}
                        >
                            Añadir Artistas o Álbumes
                        </Button>
                    )}
                </div>
            ) : (
                <div className="space-y-8">
                    {/* Artists Section */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <Users className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                                <h4 className="font-semibold text-sm text-gray-700 dark:text-gray-300 text-uppercase tracking-wider">
                                    ARTISTAS {artists.length > 0 && `(${artists.length})`}
                                </h4>
                            </div>
                            {isEditing && (
                                <button
                                    onClick={() => setShowArtistSelector(!showArtistSelector)}
                                    className="text-xs font-bold text-ios-blue hover:underline flex items-center gap-1"
                                >
                                    {showArtistSelector ? <X size={12} /> : <Plus size={12} />}
                                    {showArtistSelector ? 'Cerrar' : 'Añadir Artista'}
                                </button>
                            )}
                        </div>

                        {showArtistSelector && (
                            <div className="mb-4 p-4 bg-white/50 dark:bg-black/20 rounded-2xl border border-ios-blue/10">
                                <p className="text-xs font-bold text-gray-400 mb-3 uppercase tracking-widest">Seleccionar Artista del Catálogo</p>
                                <div className="flex flex-wrap gap-2">
                                    {availableArtists
                                        .filter(aa => !artists.some(a => a.key === aa.key))
                                        .map(aa => (
                                            <button
                                                key={aa.id}
                                                onClick={async () => {
                                                    setIsSaving(true);
                                                    const { addArtistRelation } = await import('@/actions/instrument-relationships');
                                                    const res = await addArtistRelation(instrumentId, aa.key);
                                                    if (res.success) {
                                                        // Refreshing would be better, but let's optimistic update
                                                        window.location.reload();
                                                    } else {
                                                        toast.error('Error al vincular');
                                                    }
                                                    setIsSaving(false);
                                                }}
                                                className="px-3 py-1.5 rounded-full bg-ios-blue/5 border border-ios-blue/20 hover:bg-ios-blue/10 text-xs font-semibold text-ios-blue transition-all"
                                            >
                                                {aa.label}
                                            </button>
                                        ))}
                                </div>
                            </div>
                        )}

                        {artists.length > 0 ? (
                            <div className="flex flex-wrap gap-3">
                                <AnimatePresence mode="popLayout">
                                    {artists.map((artist) => (
                                        <ArtistPill
                                            key={artist._id}
                                            artist={artist}
                                            isEditing={isEditing}
                                            onRemove={() => handleRemoveArtist(artist._id)}
                                        />
                                    ))}
                                </AnimatePresence>
                            </div>
                        ) : isEditing && (
                            <p className="text-xs text-gray-400 italic">No hay artistas vinculados</p>
                        )}
                    </div>

                    {/* Albums Section */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <Disc3 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                <h4 className="font-semibold text-sm text-gray-700 dark:text-gray-300 text-uppercase tracking-wider">
                                    ÁLBUMES {albums.length > 0 && `(${albums.length})`}
                                </h4>
                            </div>
                            {isEditing && (
                                <button className="text-xs font-bold text-ios-blue hover:underline flex items-center gap-1">
                                    <Plus size={12} /> Añadir Álbum
                                </button>
                            )}
                        </div>

                        {albums.length > 0 ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                <AnimatePresence mode="popLayout">
                                    {albums.map((album) => (
                                        <AlbumCard
                                            key={album._id}
                                            album={album}
                                            isEditing={isEditing}
                                            onRemove={() => handleRemoveAlbum(album._id)}
                                        />
                                    ))}
                                </AnimatePresence>
                            </div>
                        ) : isEditing && (
                            <p className="text-xs text-gray-400 italic">No hay álbumes vinculados</p>
                        )}
                    </div>
                </div>
            )}
        </motion.div>
    );
}

// Artist Pill Component
function ArtistPill({
    artist,
    isEditing,
    onRemove
}: {
    artist: Artist;
    isEditing: boolean;
    onRemove: () => void;
}) {
    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="group relative"
        >
            <div className="flex items-center gap-3 px-4 py-2.5 bg-white dark:bg-gray-800 rounded-full border border-purple-100 dark:border-purple-900/30 hover:border-purple-300 dark:hover:border-purple-700 transition-all cursor-pointer shadow-sm hover:shadow-md">
                <div className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center overflow-hidden">
                    {artist.assetUrl ? (
                        <img
                            src={artist.assetUrl}
                            alt={artist.name}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <Users className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                    )}
                </div>
                <div className="flex flex-col">
                    <span className="font-bold text-sm text-gray-900 dark:text-white leading-tight">
                        {artist.name}
                    </span>
                    {artist.yearsUsed && (
                        <span className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">
                            {artist.yearsUsed}
                        </span>
                    )}
                </div>

                {isEditing && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onRemove();
                        }}
                        className="ml-1 -mr-1 p-1 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
                    >
                        <X className="w-3.5 h-3.5" />
                    </button>
                )}
            </div>
        </motion.div>
    );
}

// Album Card Component
function AlbumCard({
    album,
    isEditing,
    onRemove
}: {
    album: Album;
    isEditing: boolean;
    onRemove: () => void;
}) {
    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="group relative"
        >
            <div className="apple-card p-3 bg-white dark:bg-gray-800 hover:shadow-xl transition-all h-full flex flex-col items-center text-center border-purple-50 dark:border-purple-900/10">
                {isEditing && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onRemove();
                        }}
                        className="absolute -top-1 -right-1 z-20 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg border-2 border-white dark:border-gray-800"
                    >
                        <X className="w-3.5 h-3.5" />
                    </button>
                )}

                <div className="w-full aspect-square bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-xl mb-3 overflow-hidden shadow-inner group-hover:scale-[1.02] transition-transform duration-300">
                    {album.coverImage ? (
                        <img
                            src={album.coverImage}
                            alt={album.title}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center grayscale opacity-30">
                            <Disc3 className="w-10 h-10 text-gray-400" />
                        </div>
                    )}
                </div>

                <div className="w-full">
                    <h5 className="font-bold text-sm text-gray-900 dark:text-white truncate mb-0.5" title={album.title}>
                        {album.title}
                    </h5>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate font-semibold">
                        {album.artist}
                    </p>
                    <div className="flex items-center gap-1.5 justify-center mt-1.5">
                        {album.isMaster ? (
                            <span className="text-[9px] font-black bg-ios-blue/10 text-ios-blue px-1.5 py-0.5 rounded uppercase tracking-wider border border-ios-blue/10">
                                Master
                            </span>
                        ) : album.format && (
                            <span className="text-[9px] font-bold bg-black/5 dark:bg-white/5 text-gray-400 px-1.5 py-0.5 rounded uppercase tracking-tight">
                                {album.format}
                            </span>
                        )}
                        {album.year && (
                            <span className="text-[9px] text-gray-400 dark:text-gray-500 font-medium">
                                {album.year}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
