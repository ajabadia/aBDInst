import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Package, TrendingUp, Calendar, Info, Music } from 'lucide-react';
import dbConnect from '@/lib/db';
import CatalogMetadata from '@/models/CatalogMetadata';
import Instrument from '@/models/Instrument';
import StatisticsCard from '@/components/catalog/StatisticsCard';

interface BrandPageProps {
    params: { slug: string };
}

export async function generateMetadata({ params }: BrandPageProps): Promise<Metadata> {
    await dbConnect();
    const brand = await CatalogMetadata.findOne({ type: 'brand', key: params.slug }).lean();

    if (!brand) {
        return { title: 'Brand Not Found' };
    }

    return {
        title: `${brand.label} Catalog - Museum`,
        description: brand.description || `Explore all instruments from ${brand.label} in our catalog.`,
    };
}

export default async function BrandPage({ params }: BrandPageProps) {
    await dbConnect();

    // Fetch brand metadata
    const brand = await CatalogMetadata.findOne({ type: 'brand', key: params.slug }).lean();

    if (!brand) {
        notFound();
    }

    // Fetch instruments by this brand
    // We search by label match because Instrument model currently stores brand as string
    const instruments = await Instrument.find({
        brand: { $regex: new RegExp(`^${brand.label}$`, 'i') }
    })
        .select('brand model type genericImages years marketValue')
        .sort({ model: 1 })
        .lean();

    // Calculate statistics
    const stats = {
        totalInstruments: instruments.length,
        mostPopularType: getMostPopularType(instruments),
        priceRange: getPriceRange(instruments),
        avgValue: getAverageValue(instruments),
        productionSpan: getProductionSpan(instruments)
    };

    return (
        <div className="max-w-7xl mx-auto px-6 py-12 lg:py-20 space-y-12">
            {/* Hero Section */}
            <div className="flex flex-col md:flex-row gap-8 items-start">
                {/* Brand Logo/Image */}
                <div className="relative w-48 h-48 rounded-[3rem] overflow-hidden bg-white shadow-xl dark:bg-white/5 p-8 flex-shrink-0 flex items-center justify-center">
                    {brand.assetUrl ? (
                        <div className="relative w-full h-full">
                            <Image
                                src={brand.assetUrl}
                                alt={brand.label}
                                fill
                                className="object-contain"
                            />
                        </div>
                    ) : (
                        <Package className="w-20 h-20 text-gray-300 dark:text-gray-600" />
                    )}
                </div>

                {/* Brand Info */}
                <div className="flex-1 space-y-4">
                    <div className="flex items-center gap-3">
                        <span className="px-3 py-1 bg-ios-blue text-white text-xs font-bold rounded-full uppercase tracking-widest">
                            Brand
                        </span>
                    </div>
                    <h1 className="text-5xl font-bold tracking-tight text-gray-900 dark:text-white uppercase">
                        {brand.label}
                    </h1>
                    {brand.description && (
                        <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed max-w-3xl">
                            {brand.description}
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
                    subtitle="In our catalog"
                />
                <StatisticsCard
                    icon={TrendingUp}
                    label="Top Category"
                    value={stats.mostPopularType || 'N/A'}
                    subtitle={`${instruments.filter(i => i.type === stats.mostPopularType).length} instruments`}
                />
                <StatisticsCard
                    icon={Info}
                    label="Price Range"
                    value={stats.priceRange}
                    subtitle="Estimated current value"
                />
                <StatisticsCard
                    icon={Calendar}
                    label="Production Span"
                    value={stats.productionSpan.label}
                    subtitle={stats.productionSpan.range}
                />
            </div>

            {/* Instruments Grid Section */}
            <section className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                        Collection Catalog
                    </h2>
                    <span className="text-sm text-gray-500 font-medium">
                        Showing {instruments.length} instruments
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
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                                        {instrument.model}
                                    </h3>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-500 dark:text-gray-400 capitalize bg-gray-100 dark:bg-white/5 px-2 py-0.5 rounded-lg">
                                            {instrument.type}
                                        </span>
                                        {instrument.years?.[0] && (
                                            <span className="text-gray-400 dark:text-gray-500 font-medium">
                                                {instrument.years[0]}
                                            </span>
                                        )}
                                    </div>
                                    {instrument.marketValue?.current?.value > 0 && (
                                        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-white/5 flex items-center justify-between">
                                            <span className="text-xs text-gray-400 uppercase font-bold tracking-widest">Market Value</span>
                                            <span className="font-bold text-ios-blue">
                                                ${instrument.marketValue.current.value.toLocaleString()}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-gray-50 dark:bg-white/5 rounded-[2.5rem]">
                        <Package className="w-24 h-24 mx-auto text-gray-300 dark:text-gray-600 mb-6" />
                        <h3 className="text-2xl font-bold mb-2">No instruments yet</h3>
                        <p className="text-gray-500 max-w-md mx-auto">
                            We haven't added any instruments from {brand.label} to our catalog yet.
                        </p>
                    </div>
                )}
            </section>
        </div>
    );
}

// Helper functions
function getMostPopularType(instruments: any[]): string | null {
    if (instruments.length === 0) return null;
    const typeCounts = instruments.reduce((acc, inst) => {
        acc[inst.type] = (acc[inst.type] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);
    return Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || null;
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

function getProductionSpan(instruments: any[]): { label: string, range: string } {
    const years = instruments
        .flatMap(inst => inst.years || [])
        .map(y => parseInt(y))
        .filter(y => !isNaN(y));

    if (years.length === 0) return { label: 'Unknown', range: 'N/A' };

    const min = Math.min(...years);
    const max = Math.max(...years);
    const diff = max - min;

    if (diff === 0) return { label: 'Single Year', range: `${min}` };
    return {
        label: `${diff + 1} Years`,
        range: `${min} - ${max}`
    };
}
