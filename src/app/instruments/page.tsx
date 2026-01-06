import { auth } from '@/auth';
import { getInstruments, getBrands } from '@/actions/instrument';
import Link from 'next/link';
import Search from '@/components/Search';
import InstrumentFilter from '@/components/InstrumentFilter';
import InstrumentGrid from '@/components/InstrumentGrid';
import { Plus, GitCompare } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import BulkImporter from '@/components/BulkImporter';
import { cleanData } from '@/lib/utils';
import { getMetadataMap } from '@/actions/metadata';

export default async function InstrumentsPage(props: {
    searchParams?: Promise<{
        query?: string;
        category?: string;
        sortBy?: 'brand' | 'model' | 'year' | 'type';
        sortOrder?: 'asc' | 'desc';
    }>;
}) {
    const searchParams = await props.searchParams;
    const query = searchParams?.query || '';
    const category = searchParams?.category || null;
    const brand = searchParams?.brand || null;
    const sortBy = searchParams?.sortBy || 'brand';
    const sortOrder = searchParams?.sortOrder || 'asc';

    const session = await auth();
    const [rawInstruments, metadata, brands] = await Promise.all([
        getInstruments(query, category, sortBy, sortOrder, brand),
        getMetadataMap(),
        getBrands()
    ]);

    const instruments = cleanData(rawInstruments);
    const role = session?.user?.role;
    const canEdit = ['admin', 'editor'].includes(role || '');

    return (
        <div className="max-w-7xl mx-auto px-6 py-12 lg:py-20">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-8">
                <div className="space-y-2">
                    <h1 className="text-5xl font-bold tracking-tight text-gray-900 dark:text-white">
                        Catálogo <span className="text-ios-blue">Maestro</span>
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 text-xl font-medium">
                        Explora la base de datos curada de instrumentos musicales.
                    </p>
                </div>
                <div className="flex flex-wrap gap-3">
                    <Link href="/instruments/compare">
                        <Button variant="secondary" icon={<GitCompare />}>
                            Comparar
                        </Button>
                    </Link>
                    {canEdit && (
                        <>
                            <BulkImporter />
                            <Link href="/instruments/new">
                                <Button icon={<Plus />}>
                                    Añadir nuevo
                                </Button>
                            </Link>
                        </>
                    )}
                </div>
            </div>

            {/* Search & Filter Bar */}
            <div className="mb-12 space-y-8">
                <div className="max-w-3xl">
                    <Search placeholder="Buscar por marca, modelo o tipo..." />
                </div>
                <InstrumentFilter availableBrands={brands} />
            </div>

            {/* Main Content Grid */}
            <div className="animate-in fade-in duration-700">
                <InstrumentGrid
                    instruments={instruments}
                    sortBy={sortBy}
                    metadata={metadata}
                />
            </div>
        </div>
    );
}
