import { auth } from '@/auth';
import { getUserCollection } from '@/actions/collection';
import { getAllUserTags } from '@/actions/tags';
import { redirect } from 'next/navigation';
import EnhancedStats from '@/components/EnhancedStats';
import ValueEvolutionChart from '@/components/ValueEvolutionChart';
import DistributionCharts from '@/components/DistributionCharts';
import CollectionItemCard from '@/components/CollectionItemCard';
import ExportCollectionButton from '@/components/ExportCollectionButton';
import { Button } from '@/components/ui/Button';
import { Plus, Music, Settings, GitCompare } from 'lucide-react';
import Link from 'next/link';
import EmptyState from '@/components/EmptyState';
import StudioCollection from '@/components/StudioCollection';
import TagFilter from '@/components/TagFilter';

import { cleanData } from '@/lib/utils'; // Make sure to import this

export default async function DashboardPage() {
    const session = await auth();
    if (!session) redirect('/api/auth/signin');

    const rawCollection = await getUserCollection();
    const collection = cleanData(rawCollection);
    const allTags = await getAllUserTags();

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
                    <Link href="/dashboard/settings">
                        <Button variant="secondary" icon={Settings}>Ajustes</Button>
                    </Link>
                    <Link href="/dashboard/compare">
                        <Button variant="secondary" icon={GitCompare}>Comparar</Button>
                    </Link>
                    <ExportCollectionButton />
                    <Link href="/instruments">
                        <Button icon={Plus} className="shadow-2xl">Añadir Unidad</Button>
                    </Link>
                </div>
            </div>

            {/* ESTADÍSTICAS AVANZADAS */}
            {collection.length > 0 && <EnhancedStats collection={collection} />}

            {/* EVOLUCIÓN DE VALOR */}
            {collection.length > 0 && <ValueEvolutionChart collection={collection} />}

            {/* GRÁFICOS DE DISTRIBUCIÓN */}
            {collection.length > 0 && <DistributionCharts collection={collection} />}

            {/* FILTRO DE ETIQUETAS */}
            {collection.length > 0 && allTags.length > 0 && (
                <div className="mb-8">
                    <TagFilter
                        allTags={allTags}
                        selectedTags={[]}
                        onTagsChange={() => { }}
                    />
                </div>
            )}

            {/* LISTADO INTERACTIVO POR UBICACIONES */}
            {collection.length > 0 && (
                <StudioCollection collection={collection} allTags={allTags} />
            )}

            {/* EMPTY STATE MEJORADO */}
            {collection.length === 0 && (
                <div className="mt-12">
                    <EmptyState
                        title="Tu colección está vacía"
                        description="Empieza a construir tu legado musical añadiendo tu primera pieza."
                        actionLabel="Explorar Catálogo"
                        actionHref="/instruments"
                        icon={<Music size={64} className="text-gray-300 mx-auto" />}
                    />
                </div>
            )}
        </div>
    );
}
