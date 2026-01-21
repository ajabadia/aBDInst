import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Music, TrendingUp, Calendar, Layers, Package } from 'lucide-react';
import dbConnect from '@/lib/db';
import CatalogMetadata from '@/models/CatalogMetadata';
import Instrument from '@/models/Instrument';
import StatisticsCard from '@/components/catalog/StatisticsCard';

interface TypePageProps {
    params: { slug: string };
}

export async function generateMetadata({ params }: TypePageProps): Promise<Metadata> {
    await dbConnect();
    const typeMetadata = await CatalogMetadata.findOne({ type: 'type', key: params.slug }).lean();

    if (!typeMetadata) {
        return { title: 'Category Not Found' };
    }

    return {
        title: `${typeMetadata.label} Catalog - Museum`,
        description: typeMetadata.description || `Browse our collection of ${typeMetadata.label} instruments.`,
    };
}

export default async function TypePage({ params }: TypePageProps) {
    await dbConnect();

    // Fetch type metadata
    const typeMetadata = await CatalogMetadata.findOne({ type: 'type', key: params.slug }).lean();

    if (!typeMetadata) {
        notFound();
    }

    // Fetch instruments of this type
    const instruments = await Instrument.find({
        type: { $regex: new RegExp(`^${params.slug}$`, 'i') }
    })
        .select('brand model type genericImages years marketValue')
        .sort({ brand: 1, model: 1 })
        .lean();

    // Calculate statistics
    const stats = {
        totalInstruments: instruments.length,
        topBrand: getTopBrand(instruments),
        priceRange: getPriceRange(instruments),
        avgValue: getAverageValue(instruments),
        topDecade: getTopDecade(instruments)
    };

    return (
        <div className="max-w-7xl mx-auto px-6 py-12 lg:py-20 space-y-12">
            {/* Hero Section */}
            <div className="flex flex-col md:flex-row gap-8 items-start">
                {/* Category Icon */}
                <div className="relative w-48 h-48 rounded-[3rem] overflow-hidden bg-purple-100 dark:bg-purple-900/20 flex-shrink-0 flex items-center justify-center">
                    {typeMetadata.assetUrl ? (
                        <Image
                            src={typeMetadata.assetUrl}
                            alt={typeMetadata.label}
                            fill
                            className="object-cover"
                        />
                    ) : (
                        <Layers className="w-24 h-24 text-purple-600 dark:text-purple-400" />
                    )}
                </div>

                {/* Category Info */}
                <div className="flex-1 space-y-4">
                    <div className="flex items-center gap-3">
                        <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 text-xs font-bold rounded-full uppercase tracking-widest">
                            Instrument Category
                        </span>
                    </div>
                    <h1 className="text-5xl font-bold tracking-tight text-gray-900 dark:text-white capitalize">
                        {typeMetadata.label}
                    </h1>
                    {typeMetadata.description && (
                        <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed max-w-3xl">
                            {typeMetadata.description}
                        </p>
                    )}
                </div>
            </div>

            {/* Statistics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatisticsCard
                    icon={Package}
                    label="Items"
                    value={stats.totalInstruments}
                    subtitle={`Total ${typeMetadata.label} units`}
                />
                <StatisticsCard
                    icon={TrendingUp}
                    label="Specialized Brand"
                    value={stats.topBrand || 'N/A'}
                    subtitle="Most items in this category"
                />
                <StatisticsCard
                    icon={Calendar}
                    label="Peak Decade"
                    value={stats.topDecade || 'N/A'}
                    subtitle="Most releases"
                />
                <StatisticsCard
                    icon={Layers}
                    label="Value Range"
                    value={stats.priceRange}
                    subtitle="Market estimation"
                />
            </div>

            {/* Instruments Grid Section */}
            <section className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                        {typeMetadata.label} Catalog
                    </h2>
                    <span className="text-sm text-gray-400 font-medium">
                        Showing all {instruments.length} items
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
                                </div>
                                <div className="p-6">
                                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-1">
                                        {instrument.brand}
                                    </p>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                                        {instrument.model}
                                    </h3>
                                    <div className="flex items-center justify-between">
                                        <div className="flex gap-1">
                                            {instrument.years?.slice(0, 2).map((year: string) => (
                                                <span key={year} className="text-[10px] bg-ios-blue/10 text-ios-blue px-1.5 py-0.5 rounded font-bold">
                                                    {year}
                                                </span>
                                            ))}
                                        </div>
                                        {instrument.marketValue?.current?.value > 0 && (
                                            <span className="text-sm font-bold text-gray-900 dark:text-white">
                                                ${instrument.marketValue.current.value.toLocaleString()}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-gray-50 dark:bg-white/5 rounded-[2.5rem]">
                        <Layers className="w-24 h-24 mx-auto text-gray-300 dark:text-gray-600 mb-6" />
                        <h3 className="text-2xl font-bold mb-2">Category empty</h3>
                        <p className="text-gray-500 max-w-md mx-auto">
                            No instruments have been tagged as {typeMetadata.label} yet.
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

function getPriceRange(instruments: any[]): string {
    const values = instruments
        .map(inst => inst.marketValue?.current?.value)
        .filter(v => v && v > 0);
    if (values.length === 0) return 'N/A';
    const min = Math.min(...values);
    const max = Math.max(...values);
    if (min === max) return `$${min.toLocaleString()}`;
    return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
}

function getAverageValue(instruments: any[]): number {
    const values = instruments
        .map(inst => inst.marketValue?.current?.value)
        .filter(v => v && v > 0);
    if (values.length === 0) return 0;
    return Math.round(values.reduce((sum, v) => sum + v, 0) / values.length);
}

function getTopDecade(instruments: any[]): string | null {
    if (instruments.length === 0) return null;
    const decades = instruments.flatMap(inst =>
        (inst.years || []).map((y: string) => Math.floor(parseInt(y) / 10) * 10)
    ).filter(d => !isNaN(d));

    if (decades.length === 0) return null;

    const counts = decades.reduce((acc, d) => {
        const key = `${d}s`;
        acc[key] = (acc[key] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || null;
}
