import { auth } from '@/auth';
import { getInstruments } from '@/actions/instrument';
import Link from 'next/link';
import Search from '@/components/Search';
import InstrumentFilter from '@/components/InstrumentFilter';
import InstrumentGrid from '@/components/InstrumentGrid';
import EmptyState from '@/components/EmptyState';
import InstrumentCard from '@/components/InstrumentCard';
import { Plus, GitCompare } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import BulkImporter from '@/components/BulkImporter';

import { cleanData } from '@/lib/utils';

export default async function InstrumentsPage(props: {
    searchParams?: Promise<{
        query?: string;
        category?: string;
    }>;
}) {
    const searchParams = await props.searchParams;
    const query = searchParams?.query || '';
    const category = searchParams?.category || null;

    const session = await auth();
    const rawInstruments = await getInstruments(query, category);
    const instruments = cleanData(rawInstruments);
    const role = (session?.user as any)?.role;
    const canEdit = ['admin', 'editor'].includes(role);

    return (
        <div className="container mx-auto p-8 max-w-7xl">
            <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
                <div className="space-y-2">
                    <h1 className="text-4xl font-semibold tracking-tighter text-gray-900 dark:text-white">
                        Catálogo maestro.
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 text-lg">
                        Explora la base de datos curada de instrumentos.
                    </p>
                </div>
                <div className="flex gap-3">
                    <Link href="/instruments/compare">
                        <Button variant="secondary" icon={GitCompare}>Comparar</Button>
                    </Link>
                    {canEdit && (
                        <>
                            <BulkImporter />
                            <Link href="/instruments/new">
                                <Button icon={Plus}>Añadir nuevo</Button>
                            </Link>
                        </>
                    )}
                </div>
            </div>

            <div className="mb-10 space-y-6">
                <Search placeholder="Buscar por marca, modelo o tipo..." />
                <InstrumentFilter />
            </div>

            {/* GRID: Gap grande para que cada tarjeta respire */}
            {/* Client-side Grid for animations */}
            <InstrumentGrid instruments={instruments} />
        </div>
    );
}
