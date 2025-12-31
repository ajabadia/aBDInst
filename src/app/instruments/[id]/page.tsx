import { auth } from '@/auth';
import { getInstrumentById } from '@/actions/instrument';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import AddToCollectionButton from '@/components/AddToCollectionButton';
import ImageGallery from '@/components/ImageGallery';

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
                        <ImageGallery images={instrument.genericImages || []} altText={`${instrument.brand} ${instrument.model}`} />
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
                            <div>
                                <span className="font-semibold text-gray-400 uppercase text-xs">Marca</span>
                                <p className="text-lg dark:text-white">{instrument.brand}</p>
                            </div>

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
                    <h3 className="text-xl font-bold mb-6 dark:text-white">Especificaciones Técnicas</h3>

                    {instrument.specs && Array.isArray(instrument.specs) && instrument.specs.length > 0 ? (
                        <div className="space-y-8">
                            {/* Group specs by category */}
                            {(() => {
                                const grouped: Record<string, any[]> = {};
                                instrument.specs.forEach((s: any) => {
                                    if (!grouped[s.category]) grouped[s.category] = [];
                                    grouped[s.category].push(s);
                                });

                                return Object.entries(grouped).map(([category, items]) => (
                                    <div key={category}>
                                        <h4 className="text-sm uppercase font-bold text-gray-500 dark:text-gray-400 tracking-wider mb-4 border-b dark:border-gray-800 pb-2">{category}</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
                                            {items.map((item, idx) => (
                                                <div key={idx} className="flex justify-between md:block">
                                                    <span className="font-medium text-gray-500 dark:text-gray-400 text-sm block md:mb-1">{item.label}</span>
                                                    <span className="text-gray-900 dark:text-gray-200">{item.value}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ));
                            })()}
                        </div>
                    ) : (
                        <p className="text-gray-500 italic">No hay especificaciones detalladas disponibles.</p>
                    )}
                </div>

                {/* Documentation Section */}
                {instrument.documents && instrument.documents.length > 0 && (
                    <div className="p-8 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                        <h3 className="text-xl font-bold mb-6 dark:text-white">Documentación y Archivos</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {instrument.documents.map((doc: any, idx: number) => (
                                <a
                                    key={idx}
                                    href={doc.url}
                                    target="_blank"
                                    className="flex items-center p-3 bg-white dark:bg-gray-800 rounded border hover:shadow-md transition dark:border-gray-700"
                                >
                                    <div className="w-10 h-10 flex-shrink-0 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded flex items-center justify-center font-bold text-xs uppercase mr-3">
                                        {doc.type?.substring(0, 3) || 'DOC'}
                                    </div>
                                    <div className="overflow-hidden">
                                        <p className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate" title={doc.title}>{doc.title}</p>
                                        <p className="text-xs text-gray-500 uppercase">{doc.type}</p>
                                    </div>
                                </a>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
