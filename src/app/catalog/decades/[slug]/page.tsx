import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, Music, TrendingUp, History, Package } from 'lucide-react';
import dbConnect from '@/lib/db';
import CatalogMetadata from '@/models/CatalogMetadata';
import Instrument from '@/models/Instrument';
import StatisticsCard from '@/components/catalog/StatisticsCard';

interface DecadePageProps {
    params: { slug: string };
}

export async function generateMetadata({ params }: DecadePageProps): Promise<Metadata> {
    await dbConnect();
    const decade = await CatalogMetadata.findOne({ type: 'decade', key: params.slug }).lean();

    if (!decade) {
        return { title: 'Decade Not Found' };
    }

    return {
        title: `${decade.label} Era - Instrument Catalog`,
        description: decade.description || `Explore the sounds and instruments of the ${decade.label}.`,
    };
}

export default async function DecadePage({ params }: DecadePageProps) {
    await dbConnect();

    // Fetch decade metadata
    const decadeMetadata = await CatalogMetadata.findOne({ type: 'decade', key: params.slug }).lean();

    if (!decadeMetadata) {
        notFound();
    }

    // Extract decade prefix (e.g., "1980" from "1980s")
    const decadeYear = params.slug.replace('s', '');
    const decadePrefix = decadeYear.substring(0, 3);

    // Fetch instruments from this decade
    // We search for instruments that have at least one year starting with the decade prefix
    const instruments = await Instrument.find({
        years: { $regex: new RegExp(`^${decadePrefix}`) }
    })
        .select('brand model type genericImages years marketValue')
        .sort({ years: 1, brand: 1, model: 1 })
        .lean();

    // Calculate statistics
    const stats = {
        totalInstruments: instruments.length,
        topBrand: getTopBrand(instruments),
        topType: getTopType(instruments),
        avgValue: getAverageValue(instruments),
        totalBrandCount: new Set(instruments.map(i => i.brand)).size
    };

    return (
        <div className="max-w-7xl mx-auto px-6 py-12 lg:py-20 space-y-12">
            {/* Hero Section */}
            <div className="flex flex-col md:flex-row gap-8 items-start">
                {/* Era Icon/Image */}
                <div className="relative w-48 h-48 rounded-[3rem] overflow-hidden bg-ios-blue/10 dark:bg-ios-blue/5 flex-shrink-0 flex items-center justify-center">
                    {decadeMetadata.assetUrl ? (
                        <Image
                            src={decadeMetadata.assetUrl}
                            alt={decadeMetadata.label}
                            fill
                            className="object-cover"
                        />
                    ) : (
                        <History className="w-24 h-24 text-ios-blue" />
                    )}
                </div>

                {/* Era Info */}
                <div className="flex-1 space-y-4">
                    <div className="flex items-center gap-3">
                        <span className="px-3 py-1 bg-ios-blue/10 text-ios-blue text-xs font-bold rounded-full uppercase tracking-widest">
                            Era / Decade
                        </span>
                    </div>
                    <h1 className="text-5xl font-bold tracking-tight text-gray-900 dark:text-white">
                        {decadeMetadata.label}
                    </h1>
                    {decadeMetadata.description && (
                        <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed max-w-3xl">
                            {decadeMetadata.description}
                        </p>
                    )}
                </div>
            </div>

            {/* Statistics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatisticsCard
                    icon={Package}
                    label="Instruments"
                    value={stats.totalInstruments}
                    subtitle={`From ${stats.totalBrandCount} brands`}
                />
                <StatisticsCard
                    icon={TrendingUp}
                    label="Top Brand"
                    value={stats.topBrand || 'N/A'}
                    subtitle="Most active in era"
                />
                <StatisticsCard
                    icon={Music}
                    label="Leading Type"
                    value={stats.topType || 'N/A'}
                    subtitle="Primary technology"
                />
                <StatisticsCard
                    icon={Calendar}
                    label="Avg. Market Value"
                    value={stats.avgValue > 0 ? `$${stats.avgValue.toLocaleString()}` : 'N/A'}
                    subtitle="Portfolio estimate"
                />
            </div>

            {/* Instruments Grid Section */}
            <section className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                        Iconic Instruments
                    </h2>
                    <span className="text-sm text-gray-500 font-medium">
                        {instruments.length} items found
                    </span>
                </div>

                {instruments.length > 0 ? (
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
                                    <div className="absolute top-4 right-4 px-3 py-1 bg-white/90 dark:bg-black/80 backdrop-blur-sm rounded-full text-xs font-bold text-gray-900 dark:text-white shadow-sm">
                                        {instrument.years?.[0] || decadeMetadata.label}
                                    </div>
                                </div>
                                <div className="p-6">
                                    <p className="text-sm text-gray-400 font-bold uppercase tracking-widest mb-1">
                                        {instrument.brand}
                                    </p>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                                        {instrument.model}
                                    </h3>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-gray-500 dark:text-gray-400 capitalize bg-gray-100 dark:bg-white/5 px-2 py-0.5 rounded-lg border border-gray-200 dark:border-white/10">
                                            {instrument.type}
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-gray-50 dark:bg-white/5 rounded-[2.5rem]">
                        <History className="w-24 h-24 mx-auto text-gray-300 dark:text-gray-600 mb-6" />
                        <h3 className="text-2xl font-bold mb-2">Era empty</h3>
                        <p className="text-gray-500 max-w-md mx-auto">
                            We haven't categorized any instruments from the {decadeMetadata.label} yet.
                        </p>
                    </div>
                )}
            </section>
        </div>
    );
}

// Helper functions
function getTopBrand(instruments: any[]): string | null {
    if (instruments.length === 0) return null;
    const counts = instruments.reduce((acc, inst) => {
        acc[inst.brand] = (acc[inst.brand] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || null;
}

function getTopType(instruments: any[]): string | null {
    if (instruments.length === 0) return null;
    const counts = instruments.reduce((acc, inst) => {
        acc[inst.type] = (acc[inst.type] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || null;
}

function getAverageValue(instruments: any[]): number {
    const values = instruments
        .map(inst => inst.marketValue?.current?.value)
        .filter(v => v && v > 0);
    if (values.length === 0) return 0;
    return Math.round(values.reduce((sum, v) => sum + v, 0) / values.length);
}
