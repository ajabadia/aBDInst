'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { Music2, Users, Disc3, Edit, Save, X, Plus, Search, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { toast } from 'sonner';
import { removeArtistRelation, removeAlbumRelation } from '@/actions/instrument-relationships';
import AlbumCard from '@/components/instrument/AlbumCard';
import ArtistPill from '@/components/instrument/ArtistPill';

// Lazy load the new manager to avoid circular deps if any
const UnifiedAssociationManager = dynamic(() => import('@/components/shared/UnifiedAssociationManager'), {
    loading: () => <div className="bg-white p-6 rounded-2xl text-center"><Loader2 className="animate-spin mx-auto text-ios-blue" /></div>
});

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
    availableArtists: any[];
    canEdit: boolean;
    instrumentId: string;
    forceEditMode?: boolean; // New prop for Editor integration
}

export default function MusicalContextSection({
    artists: initialArtists,
    albums: initialAlbums,
    availableArtists,
    canEdit,
    instrumentId,
    forceEditMode = false
}: MusicalContextSectionProps) {
    const [isEditing, setIsEditing] = useState(forceEditMode);
    const [artists, setArtists] = useState(initialArtists);
    const [albums, setAlbums] = useState(initialAlbums);
    const [isSaving, setIsSaving] = useState(false);
    const router = useRouter();

    // Manager State
    const [showManager, setShowManager] = useState(false);
    const [managerType, setManagerType] = useState<'artist' | 'album'>('artist');

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
        return null;
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

                {canEdit && !forceEditMode && (
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
                            onClick={() => {
                                setManagerType('artist');
                                setShowManager(true);
                            }}
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
                        </div>
                        {isEditing && (
                            <button
                                type="button"
                                onClick={() => {
                                    setManagerType('artist');
                                    setShowManager(true);
                                }}
                                className="text-xs font-bold text-ios-blue hover:underline flex items-center gap-1"
                            >
                                <Plus size={12} /> Añadir Artista
                            </button>
                        )}
                    </div>

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
                                <button
                                    type="button"
                                    onClick={() => {
                                        setManagerType('album');
                                        setShowManager(true);
                                    }}
                                    className="text-xs font-bold text-ios-blue hover:underline flex items-center gap-1"
                                >
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

            {/* Unified Association Manager Modal */}
            <AnimatePresence>
                {showManager && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="w-full max-w-lg"
                        >
                            <UnifiedAssociationManager
                                entityType={managerType}
                                onCancel={() => setShowManager(false)}
                                excludeIds={
                                    managerType === 'artist'
                                        ? artists.map(a => a.key)
                                        : albums.map(a => a._id) // Use _id for albums as they are documents
                                }
                                onSelect={async (item: any) => {
                                    setShowManager(false);
                                    setIsSaving(true);
                                    if (managerType === 'artist') {
                                        const { addArtistRelation } = await import('@/actions/instrument-relationships');
                                        const res = await addArtistRelation(instrumentId, item.key);
                                        if (res.success) router.refresh();
                                        else toast.error('Error al vincular artista');
                                    } else {
                                        const { addAlbumRelation } = await import('@/actions/instrument-relationships');
                                        const res = await addAlbumRelation(
                                            instrumentId,
                                            item.albumId?._id || item._id // Handle both populated and direct objects
                                        );
                                        if (res.success) router.refresh();
                                        else toast.error('Error al vincular álbum');
                                    }
                                    setIsSaving(false);
                                }}
                            />
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
