
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ArrowLeft, Music2, Disc3, Guitar } from 'lucide-react';
import Link from 'next/link';

import dbConnect from '@/lib/db';
import CatalogMetadata, { ICatalogMetadata } from '@/models/CatalogMetadata';
import InstrumentArtist from '@/models/InstrumentArtist';
import MusicAlbum from '@/models/MusicAlbum';
import Instrument from '@/models/Instrument';
import InstrumentCard from '@/components/InstrumentCard';
import AlbumCard from '@/components/instrument/AlbumCard';

interface Props {
    params: {
        key: string;
    };
}

// SEO Metadata
export async function generateMetadata({ params }: Props): Promise<Metadata> {
    await dbConnect();
    const artist = await CatalogMetadata.findOne({
        type: 'artist',
        key: params.key
    }).lean() as unknown as ICatalogMetadata | null;

    if (!artist) return { title: 'Artista no encontrado' };

    return {
        title: `${artist.label} - Instrumentos y Discografía`,
        description: `Explora los instrumentos y álbumes asociados a ${artist.label} en nuestra colección.`
    };
}

async function getArtistData(key: string) {
    await dbConnect();

    // 1. Fetch Artist Metadata
    const artist = await CatalogMetadata.findOne({
        type: 'artist',
        key: key
    }).lean() as unknown as ICatalogMetadata | null;

    if (!artist) return null;

    // 2. Fetch Associated Instruments
    // Find all relationships for this artist
    const instrumentRelations = await InstrumentArtist.find({
        artistId: artist._id
    }).populate({
        path: 'instrumentId',
        model: Instrument, // Explicitly state model if needed
        select: 'brand model type images status slug year'
    }).lean();

    const instruments = instrumentRelations
        .map(rel => rel.instrumentId)
        .filter(inst => inst != null); // Filter out nulls if instrument was deleted

    // 3. Fetch Associated Albums (using string match on name for now as per schema)
    const albums = await MusicAlbum.find({
        artist: { $regex: new RegExp(`^${artist.label}$`, 'i') } // Case insensitive match
    }).sort({ year: 1 }).lean();

    return {
        artist,
        instruments: instruments as any[],
        albums: albums as any[]
    };
}

export default async function ArtistDetailPage({ params }: Props) {
    const data = await getArtistData(params.key);

    if (!data) {
        notFound();
    }

    const { artist, instruments, albums } = data;
    const primaryImage = artist.images?.find(img => img.isPrimary)?.url || artist.assetUrl;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
            {/* Header / Hero */}
            <div className="relative bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
                    <Link
                        href="/dashboard/admin/metadata?tab=artist"
                        className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white mb-6 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Volver al Catálogo
                    </Link>

                    <div className="flex flex-col md:flex-row gap-8 items-start">
                        {/* Artist Image */}
                        <div className="w-32 h-32 md:w-48 md:h-48 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700 shadow-xl border-4 border-white dark:border-gray-600 shrink-0">
                            {primaryImage ? (
                                <img
                                    src={primaryImage}
                                    alt={artist.label}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <Music2 className="w-16 h-16 text-gray-300 dark:text-gray-500" />
                                </div>
                            )}
                        </div>

                        {/* Info */}
                        <div className="flex-1">
                            <h1 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight mb-4">
                                {artist.label}
                            </h1>
                            {artist.description && (
                                <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl leading-relaxed">
                                    {artist.description}
                                </p>
                            )}

                            <div className="flex flex-wrap gap-4 mt-6">
                                <div className="px-4 py-2 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-100 dark:border-purple-900/30">
                                    <span className="block text-2xl font-bold text-purple-600 dark:text-purple-400">
                                        {instruments.length}
                                    </span>
                                    <span className="text-xs font-semibold text-purple-400 dark:text-purple-300 uppercase tracking-wider">
                                        Instrumentos
                                    </span>
                                </div>
                                <div className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-900/30">
                                    <span className="block text-2xl font-bold text-blue-600 dark:text-blue-400">
                                        {albums.length}
                                    </span>
                                    <span className="text-xs font-semibold text-blue-400 dark:text-blue-300 uppercase tracking-wider">
                                        Álbumes
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">

                {/* Instruments Section */}
                <section>
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-2 bg-purple-100 dark:bg-purple-900/40 rounded-lg">
                            <Guitar className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Instrumentos en la Colección
                        </h2>
                    </div>

                    {instruments.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {instruments.map(inst => (
                                <InstrumentCard key={inst._id} inst={inst} />
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 text-center border border-dashed border-gray-300 dark:border-gray-700">
                            <Guitar className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                            <p className="text-gray-500">No hay instrumentos vinculados a este artista.</p>
                        </div>
                    )}
                </section>

                {/* Albums Section */}
                <section>
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-lg">
                            <Disc3 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Discografía Asociada
                        </h2>
                    </div>

                    {albums.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                            {albums.map(album => (
                                <AlbumCard
                                    key={album._id}
                                    album={{
                                        ...album,
                                        _id: album._id.toString(), // Ensure string ID
                                    }}
                                // Read-only mode
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 text-center border border-dashed border-gray-300 dark:border-gray-700">
                            <Disc3 className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                            <p className="text-gray-500">No hay álbumes registrados de este artista.</p>
                        </div>
                    )}
                </section>

            </div>
        </div>
    );
}
