import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Music, Calendar, TrendingUp, Package, ExternalLink } from 'lucide-react';
import dbConnect from '@/lib/db';
import CatalogMetadata from '@/models/CatalogMetadata';
import Instrument from '@/models/Instrument';
import MusicAlbum from '@/models/MusicAlbum';
import StatisticsCard from '@/components/catalog/StatisticsCard';
import { Button } from '@/components/ui/Button';

interface ArtistPageProps {
    params: { slug: string };
}

export async function generateMetadata({ params }: ArtistPageProps): Promise<Metadata> {
    await dbConnect();
    const artist = await CatalogMetadata.findOne({ type: 'artist', key: params.slug }).lean();

    if (!artist) {
        return { title: 'Artist Not Found' };
    }

    return {
        title: `${artist.label} - Artist Profile`,
        description: artist.description || `Explore instruments and albums by ${artist.label}`,
    };
}

export default async function ArtistPage({ params }: ArtistPageProps) {
    await dbConnect();

    // Fetch artist metadata
    const artist = await CatalogMetadata.findOne({ type: 'artist', key: params.slug })
        .populate('instruments')
        .lean();

    if (!artist) {
        notFound();
    }

    // Fetch instruments (using bidirectional link)
    const instruments = await Instrument.find({
        _id: { $in: artist.instruments || [] }
    })
        .select('brand model type genericImages years marketValue')
        .lean();

    // Fetch albums
    const albums = await MusicAlbum.find({
        artistRefs: artist._id
    })
        .select('title year coverImage genres')
        .lean();

    // Calculate statistics
    const stats = {
        totalInstruments: instruments.length,
        totalAlbums: albums.length,
        mostUsedType: getMostUsedType(instruments),
        activeDecades: getActiveDecades(instruments),
        avgValue: getAverageValue(instruments)
    };

    return (
        <div className="max-w-7xl mx-auto px-6 py-12 lg:py-20 space-y-12">
            {/* Hero Section */}
            <div className="flex flex-col md:flex-row gap-8 items-start">
                {/* Artist Image */}
                <div className="relative w-48 h-48 rounded-[3rem] overflow-hidden bg-gray-100 dark:bg-white/5 flex-shrink-0">
                    {artist.assetUrl ? (
                        <Image
                            src={artist.assetUrl}
                            alt={artist.label}
                            fill
                            className="object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <Music className="w-20 h-20 text-gray-300 dark:text-gray-600" />
                        </div>
                    )}
                </div>

                {/* Artist Info */}
                <div className="flex-1 space-y-4">
                    <h1 className="text-5xl font-bold tracking-tight text-gray-900 dark:text-white">
                        {artist.label}
                    </h1>
                    {artist.description && (
                        <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed max-w-3xl">
                            {artist.description}
                        </p>
                    )}

                    {/* Social Links */}
                    <div className="flex gap-3 pt-4">
                        {artist.images?.find(img => img.source === 'discogs')?.externalId && (
                            <Link
                                href={`https://www.discogs.com/artist/${artist.images.find(img => img.source === 'discogs')?.externalId}`}
                                target="_blank"
                            >
                                <Button variant="secondary" icon={ExternalLink} className="text-sm">
                                    Discogs
                                </Button>
                            </Link>
                        )}
                    </div>
                </div>
            </div>

            {/* Statistics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatisticsCard
                    icon={Package}
                    label="Instruments Used"
                    value={stats.totalInstruments}
                    subtitle="In catalog"
                />
                <StatisticsCard
                    icon={Music}
                    label="Albums"
                    value={stats.totalAlbums}
                    subtitle="In database"
                />
                <StatisticsCard
                    icon={TrendingUp}
                    label="Most Used Type"
                    value={stats.mostUsedType || 'N/A'}
                    subtitle={`${instruments.filter(i => i.type === stats.mostUsedType).length} instruments`}
                />
                <StatisticsCard
                    icon={Calendar}
                    label="Active Decades"
                    value={stats.activeDecades.length}
                    subtitle={stats.activeDecades.join(', ')}
                />
            </div>

            {/* Instruments Grid */}
            {instruments.length > 0 && (
                <section className="space-y-6">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                        Instruments Used
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {instruments.map((instrument: any) => (
                            <Link
                                key={instrument._id.toString()}
                                href={`/instruments/${instrument._id}`}
                                className="apple-card overflow-hidden hover:shadow-apple-lg transition-all duration-300 group"
                            >
                                <div className="relative h-48 bg-gray-100 dark:bg-white/5">
                                    {instrument.genericImages?.[0] ? (
                                        <Image
                                            src={instrument.genericImages[0]}
                                            alt={`${instrument.brand} ${instrument.model}`}
                                            fill
                                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <Music className="w-16 h-16 text-gray-300 dark:text-gray-600" />
                                        </div>
                                    )}
                                </div>
                                <div className="p-6">
                                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-1">
                                        {instrument.brand}
                                    </p>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                                        {instrument.model}
                                    </h3>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-500 dark:text-gray-400 capitalize">
                                            {instrument.type}
                                        </span>
                                        {instrument.years?.[0] && (
                                            <span className="text-gray-400 dark:text-gray-500">
                                                {instrument.years[0]}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
            )}

            {/* Albums Grid */}
            {albums.length > 0 && (
                <section className="space-y-6">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                        Albums
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                        {albums.map((album: any) => (
                            <div
                                key={album._id.toString()}
                                className="group cursor-pointer"
                            >
                                <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100 dark:bg-white/5 mb-3 shadow-lg group-hover:shadow-2xl transition-shadow duration-300">
                                    {album.coverImage ? (
                                        <Image
                                            src={album.coverImage}
                                            alt={album.title}
                                            fill
                                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <Music className="w-12 h-12 text-gray-300 dark:text-gray-600" />
                                        </div>
                                    )}
                                </div>
                                <h4 className="font-bold text-sm text-gray-900 dark:text-white line-clamp-2 mb-1">
                                    {album.title}
                                </h4>
                                {album.year && (
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {album.year}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Empty State */}
            {instruments.length === 0 && albums.length === 0 && (
                <div className="text-center py-20 bg-gray-50 dark:bg-white/5 rounded-[2.5rem]">
                    <Music className="w-24 h-24 mx-auto text-gray-300 dark:text-gray-600 mb-6" />
                    <h3 className="text-2xl font-bold mb-2">No data yet</h3>
                    <p className="text-gray-500 max-w-md mx-auto">
                        This artist doesn't have any instruments or albums linked yet.
                    </p>
                </div>
            )}
        </div>
    );
}

// Helper functions
function getMostUsedType(instruments: any[]): string | null {
    if (instruments.length === 0) return null;

    const typeCounts = instruments.reduce((acc, inst) => {
        acc[inst.type] = (acc[inst.type] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    return Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || null;
}

function getActiveDecades(instruments: any[]): string[] {
    const decades = new Set<string>();

    instruments.forEach(inst => {
        inst.years?.forEach((year: string) => {
            const decade = Math.floor(parseInt(year) / 10) * 10;
            if (!isNaN(decade)) {
                decades.add(`${decade}s`);
            }
        });
    });

    return Array.from(decades).sort();
}

function getAverageValue(instruments: any[]): number {
    const values = instruments
        .map(inst => inst.marketValue?.current?.value)
        .filter(v => v && v > 0);

    if (values.length === 0) return 0;

    return Math.round(values.reduce((sum, v) => sum + v, 0) / values.length);
}
