import { auth } from '@/auth';
import { getUserCollection } from '@/actions/collection';
import { redirect } from 'next/navigation';
import CollectionStats from '@/components/CollectionStats';
import CollectionItemCard from '@/components/CollectionItemCard';
import ExportButtons from '@/components/ExportButtons';
import { Button } from '@/components/ui/Button';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import EmptyState from '@/components/EmptyState';

import { cleanData } from '@/lib/utils'; // Make sure to import this

export default async function DashboardPage() {
    const session = await auth();
    if (!session) redirect('/api/auth/signin');

    const rawCollection = await getUserCollection();
    const collection = cleanData(rawCollection);

    return (
        <div className="container mx-auto px-6 py-12 max-w-6xl">
            {/* HEADER PRO */}
            <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
                <div className="space-y-4 text-left">
                    <p className="text-blue-600 font-semibold uppercase tracking-[0.3em] text-xs">Panel de Control</p>
                    <h1 className="text-5xl font-semibold tracking-tighter text-gray-900 dark:text-white leading-none">
                        Tu estudio. <br /> <span className="text-gray-400">Organizado.</span>
                    </h1>
                </div>
                <div className="flex items-center gap-3">
                    <ExportButtons data={collection} />
                    <Link href="/instruments">
                        <Button icon={Plus} className="shadow-2xl">Añadir Unidad</Button>
                    </Link>
                </div>
            </div>

            {/* ESTADÍSTICAS */}
            {collection.length > 0 && <CollectionStats collection={collection} />}

            {/* LISTADO DE ITEMS */}
            {collection.length > 0 && (
                <div className="space-y-6">
                    <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 ml-4 mb-4">
                        Inventario Personal ({collection.length})
                    </h2>
                    <div className="grid grid-cols-1 gap-6">
                        {collection.map((item: any) => (
                            <CollectionItemCard key={item._id} item={item} />
                        ))}
                    </div>
                </div>
            )}

            {/* EMPTY STATE MEJORADO */}
            {collection.length === 0 && (
                <div className="mt-12">
                    <EmptyState
                        title="Tu colección está vacía"
                        description="Empieza a construir tu legado musical añadiendo tu primera pieza."
                        actionLabel="Explorar Catálogo"
                        actionHref="/instruments"
                        icon="🎹"
                    />
                </div>
            )}
        </div>
    );
}
