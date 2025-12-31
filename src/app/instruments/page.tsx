import { auth } from '@/auth';
import { getInstruments } from '@/actions/instrument';
import Link from 'next/link';
import Search from '@/components/Search';
import EmptyState from '@/components/EmptyState';
import InstrumentCard from '@/components/InstrumentCard';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';

import { cleanData } from '@/lib/utils';

export default async function InstrumentsPage(props: {
    searchParams?: Promise<{
        query?: string;
    }>;
}) {
    const searchParams = await props.searchParams;
    const query = searchParams?.query || '';

    const session = await auth();
    const rawInstruments = await getInstruments(query);
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
                {canEdit && (
                    <Link href="/instruments/new">
                        <Button icon={Plus}>Añadir nuevo</Button>
                    </Link>
                )}
            </div>

            <div className="mb-10">
                <Search placeholder="Buscar por marca, modelo o tipo..." />
            </div>

            {/* GRID: Gap grande para que cada tarjeta respire */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
                {instruments.map((inst: any) => (
                    <InstrumentCard key={inst._id} inst={inst} />
                ))}

                {instruments.length === 0 && (
                    <div className="col-span-full">
                        <EmptyState
                            title="No se encontraron instrumentos"
                            description="Prueba con otros términos de búsqueda o añade una nueva joya a tu catálogo."
                            actionLabel="Añadir Instrumento"
                            actionHref="/instruments/new"
                            icon="🎸"
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
