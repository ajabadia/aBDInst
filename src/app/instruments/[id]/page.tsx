import { auth } from '@/auth';
import { getInstrumentById } from '@/actions/instrument';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import AddToCollectionButton from '@/components/AddToCollectionButton';

export default async function InstrumentDetailPage({ params }: { params: { id: string } }) {
    const { id } = await params;
    const instrument = await getInstrumentById(id);
    const session = await auth();
    const isLoggedIn = !!session?.user;
    const canEdit = ['admin', 'editor'].includes((session?.user as any)?.role);

    if (!instrument) {
        notFound();
    }

    return (
        <div className="container mx-auto p-4 max-w-4xl">
            <Link href="/instruments" className="text-blue-500 hover:underline mb-4 inline-block">&larr; Volver al catálogo</Link>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                <div className="md:flex">
                    <div className="md:w-1/2 p-4">
                        <div className="aspect-square bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center text-gray-500">
                            {instrument.genericImages?.[0] ? (
                                <img src={instrument.genericImages[0]} alt={instrument.model} className="w-full h-full object-cover rounded" />
                            ) : (
                                <span>Sin imagen</span>
                            )}
                        </div>
                    </div>
                    <div className="p-8 md:w-1/2">
                        <div className="flex justify-between items-start">
                            <div>
                                <h1 className="text-3xl font-bold dark:text-white">{instrument.brand} {instrument.model}</h1>
                                <p className="text-xl text-gray-600 dark:text-gray-400">{instrument.type} {instrument.subtype && `• ${instrument.subtype}`}</p>
                            </div>
                            {canEdit && (
                                <Link
                                    href={`/instruments/${id}/edit`}
                                    className="text-gray-400 hover:text-blue-500 border border-gray-600 px-3 py-1 rounded text-sm transition hover:border-blue-500"
                                >
                                    Editar
                                </Link>
                            )}
                        </div>

                        {isLoggedIn && (
                            <div className="mb-6">
                                <AddToCollectionButton instrumentId={instrument._id} />
                            </div>
                        )}

                        <div className="mt-6 space-y-4">
                            {instrument.version && (
                                <div>
                                    <span className="font-semibold text-gray-400 uppercase text-xs">Versión</span>
                                    <p>{instrument.version}</p>
                                </div>
                            )}

                            {instrument.years && instrument.years.length > 0 && (
                                <div>
                                    <span className="font-semibold text-gray-400 uppercase text-xs">Años</span>
                                    <p>{instrument.years.join(', ')}</p>
                                </div>
                            )}

                            <div>
                                <span className="font-semibold text-gray-400 uppercase text-xs">Descripción</span>
                                <p className="whitespace-pre-wrap">{instrument.description || 'Sin descripción disponible.'}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-8 border-t dark:border-gray-700">
                    <h3 className="text-xl font-bold mb-4">Especificaciones Técnicas</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                        {instrument.specs?.polyphony && (
                            <div>
                                <span className="font-semibold text-gray-400 uppercase text-xs">Polifonía</span>
                                <p>{instrument.specs.polyphony} voces</p>
                            </div>
                        )}
                        {instrument.specs?.oscillators && (
                            <div>
                                <span className="font-semibold text-gray-400 uppercase text-xs">Osciladores</span>
                                <p>{instrument.specs.oscillators}</p>
                            </div>
                        )}
                        <div>
                            <span className="font-semibold text-gray-400 uppercase text-xs">Secuenciador</span>
                            <p>{instrument.specs?.sequencer ? 'Sí' : 'No'}</p>
                        </div>
                        <div>
                            <span className="font-semibold text-gray-400 uppercase text-xs">MIDI</span>
                            <p>{instrument.specs?.midi ? 'Sí' : 'No'}</p>
                        </div>
                        {instrument.specs?.weight && (
                            <div>
                                <span className="font-semibold text-gray-400 uppercase text-xs">Peso</span>
                                <p>{instrument.specs.weight} kg</p>
                            </div>
                        )}
                        {instrument.specs?.dimensions && (
                            <div>
                                <span className="font-semibold text-gray-400 uppercase text-xs">Dimensiones</span>
                                <p>{instrument.specs.dimensions}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
