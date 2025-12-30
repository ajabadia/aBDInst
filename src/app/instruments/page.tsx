import { auth } from '@/auth';
import { getInstruments } from '@/actions/instrument';
import Link from 'next/link';
import Search from '@/components/Search';

export default async function InstrumentsPage(props: {
    searchParams?: Promise<{
        query?: string;
    }>;
}) {
    const searchParams = await props.searchParams;
    const query = searchParams?.query || '';

    const session = await auth();
    const instruments = await getInstruments(query);
    const role = (session?.user as any)?.role;
    const canEdit = ['admin', 'editor'].includes(role);

    return (
        <div className="container mx-auto p-4 max-w-6xl">
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <h1 className="text-3xl font-bold dark:text-white">Catálogo de Instrumentos</h1>
                {canEdit && (
                    <Link
                        href="/instruments/new"
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition w-full md:w-auto text-center"
                    >
                        Añadir Nuevo
                    </Link>
                )}
            </div>

            <div className="mb-6">
                <Search placeholder="Buscar por marca o modelo..." />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {instruments.map((inst: any) => (
                    <Link key={inst._id} href={`/instruments/${inst._id}`} className="block group">
                        <div className="border rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300 dark:bg-gray-800 dark:border-gray-700 bg-white">
                            <div className="aspect-video bg-gray-100 dark:bg-gray-900 flex items-center justify-center text-gray-500 overflow-hidden relative">
                                {inst.genericImages?.[0] ? (
                                    <img src={inst.genericImages[0]} alt={inst.model} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                ) : (
                                    <span className="text-4xl text-gray-300 dark:text-gray-600">🎸</span>
                                )}
                            </div>
                            <div className="p-5">
                                <h2 className="text-xl font-bold group-hover:text-blue-600 dark:text-white transition-colors">
                                    {inst.brand} {inst.model}
                                </h2>
                                <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 mt-1">{inst.type} {inst.subtype && `• ${inst.subtype}`}</p>

                                <div className="flex flex-wrap gap-2">
                                    {inst.years && inst.years.length > 0 && (
                                        <span className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs px-2 py-1 rounded-full font-medium">
                                            {inst.years.join(', ')}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}

                {instruments.length === 0 && (
                    <div className="col-span-full text-center py-20">
                        <div className="text-6xl mb-4">🔍</div>
                        <h3 className="text-xl font-semibold mb-2 dark:text-gray-200">No se encontraron instrumentos</h3>
                        <p className="text-gray-500">Prueba con otra búsqueda o añade uno nuevo.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
