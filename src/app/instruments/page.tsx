import { auth } from '@/auth';
import { getInstruments } from '@/actions/instrument';
import Link from 'next/link';

export default async function InstrumentsPage() {
    const session = await auth();
    const instruments = await getInstruments();
    const role = (session?.user as any)?.role;
    const canEdit = ['admin', 'editor'].includes(role);

    return (
        <div className="container mx-auto p-4 max-w-4xl">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold dark:text-white">Catálogo de Instrumentos</h1>
                {canEdit && (
                    <Link
                        href="/instruments/new"
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                    >
                        Añadir Nuevo
                    </Link>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {instruments.map((inst: any) => (
                    <Link key={inst._id} href={`/instruments/${inst._id}`} className="block group">
                        <div className="border rounded-lg p-4 shadow hover:shadow-lg transition dark:bg-gray-800 dark:border-gray-700">
                            <div className="aspect-video bg-gray-200 dark:bg-gray-700 mb-4 rounded flex items-center justify-center text-gray-500">
                                {inst.genericImages?.[0] ? (
                                    <img src={inst.genericImages[0]} alt={inst.model} className="w-full h-full object-cover rounded" />
                                ) : (
                                    <span>Sin imagen</span>
                                )}
                            </div>
                            <h2 className="text-xl font-semibold group-hover:text-blue-600 dark:text-white">
                                {inst.brand} {inst.model}
                            </h2>
                            <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">{inst.type} {inst.subtype && `• ${inst.subtype}`}</p>
                            {inst.years && inst.years.length > 0 && (
                                <span className="inline-block bg-gray-100 dark:bg-gray-700 text-xs px-2 py-1 rounded">
                                    {inst.years.join(', ')}
                                </span>
                            )}
                        </div>
                    </Link>
                ))}

                {instruments.length === 0 && (
                    <div className="col-span-full text-center py-12 text-gray-500">
                        No hay instrumentos en el catálogo aún.
                    </div>
                )}
            </div>
        </div>
    );
}
