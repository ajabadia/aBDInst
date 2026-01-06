import { auth } from '@/auth';
import { getInstruments, getMetadataMap } from '@/actions/catalog';
import Link from 'next/link';
import Search from '@/components/Search';
import InstrumentFilter from '@/components/InstrumentFilter';
import InstrumentGrid from '@/components/InstrumentGrid';
import { Plus, GitCompare } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import BulkImporter from '@/components/BulkImporter';
import { cleanData } from '@/lib/utils';

export default async function InstrumentsPage(props: {
    searchParams?: Promise<{
        query?: string;
        category?: string;
        brand?: string;
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
    const [rawInstruments, metadata] = await Promise.all([
        getInstruments(query, category, sortBy, sortOrder, undefined, true), // Fetch full for brand extraction if needed
        getMetadataMap()
    ]);

    const instruments = cleanData(rawInstruments);
    const role = (session?.user as any)?.role;
    const canEdit = ['admin', 'editor'].includes(role || '');

    // Extract unique brands from ALL instruments for the filter
    const availableBrands = Array.from(new Set(instruments.map((i: any) => i.brand))).sort() as string[];

    return (
        <div className="max-w-7xl mx-auto px-6 py-12 lg:py-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-8">
                <div className="space-y-2">
                    <h1 className="text-5xl font-bold tracking-tight text-gray-900 dark:text-white leading-tight">
                        Catálogo <span className="text-ios-blue">Maestro</span>
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 text-xl font-medium">
                        Explora la base de datos curada de instrumentos musicales.
                    </p>
                </div>
                <div className="flex flex-wrap gap-3">
                    <Link href="/instruments/compare">
                        <Button variant="secondary">
                            <GitCompare size={20} className="mr-2 stroke-[2.2px]" />
                            Comparar
                        </Button>
                    </Link>
                    {canEdit && (
                        <>
                            <BulkImporter />
                            <Link href="/instruments/new">
                                <Button>
                                    <Plus size={20} className="mr-2 stroke-[2.2px]" />
                                    Añadir nuevo
                                </Button>
                            </Link>
                        </>
                    )}
                </div>
            </div>

            <div className="mb-12 space-y-8">
                <div className="max-w-3xl">
                    <Search placeholder="Buscar por marca, modelo o tipo..." />
                </div>
                <InstrumentFilter availableBrands={availableBrands} />
            </div>

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
