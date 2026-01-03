import { auth } from '@/auth';
import { getCollectionItemById } from '@/actions/collection';
import { notFound, redirect } from 'next/navigation';
import EditCollectionItemForm from '@/components/EditCollectionItemForm';
import MaintenanceHistory from '@/components/MaintenanceHistory';
import { Tabs, Tab } from '@/components/Tabs';
import QRCodeGenerator from '@/components/QRCodeGenerator';
import PersonalGallerySection from '@/components/gallery/PersonalGallerySection';
import { getResources } from '@/actions/resource';
import ResourceSection from '@/components/resources/ResourceSection';

export default async function EditItemPage({ params }: { params: { id: string } }) {
    const { id } = await params;
    const session = await auth();
    if (!session) redirect('/api/auth/signin');

    const item = await getCollectionItemById(id);
    const resources = await getResources({ collectionItemId: id });

    if (!item) notFound();

    return (
        <div className="container mx-auto p-4 max-w-4xl">
            <h1 className="text-2xl font-bold mb-6">
                Gestionar: {item.instrumentId.brand} {item.instrumentId.model}
            </h1>

            <div className="md:flex gap-6">
                <div className="md:w-1/3 mb-6">
                    <div className="aspect-square apple-card p-4 mb-4 overflow-hidden flex items-center justify-center bg-white dark:bg-white/5">
                        {item.instrumentId.genericImages?.[0] && (
                            <img src={item.instrumentId.genericImages[0]} className="w-full h-full object-contain" />
                        )}
                    </div>
                    {/* Personal Gallery */}
                    <div className="mb-6">
                        <PersonalGallerySection
                            collectionId={item._id}
                            images={item.images || []}
                        />
                    </div>

                    <div className="border-t pt-6 dark:border-gray-800">
                        <h4 className="text-xs uppercase font-bold text-gray-500 dark:text-gray-400 mb-4 text-center tracking-widest">Etiqueta de Inventario</h4>
                        <QRCodeGenerator
                            url={`/dashboard/collection/${id}`}
                            label={`INV-${item.serialNumber || 'UNKNOWN'}`}
                        />
                    </div>
                </div>

                <div className="md:w-2/3">
                    <Tabs>
                        <Tab label="Detalles y Estado">
                            <div className="pt-4">
                                <EditCollectionItemForm item={item} />
                            </div>
                        </Tab>
                        <Tab label="Mantenimiento / Logs">
                            <div className="pt-4">
                                <MaintenanceHistory
                                    collectionId={item._id}
                                    history={item.maintenanceHistory || []}
                                    nextMaintenanceDate={item.nextMaintenanceDate}
                                    maintenanceInterval={item.maintenanceInterval}
                                    maintenanceNotes={item.maintenanceNotes}
                                    instrumentName={`${item.instrumentId.brand} ${item.instrumentId.model}`}
                                />
                            </div>
                        </Tab>
                        <Tab label="Archivos / Patches">
                            <div className="pt-4">
                                <ResourceSection
                                    collectionItemId={item._id}
                                    resources={resources}
                                    canEdit={true}
                                />
                            </div>
                        </Tab>
                    </Tabs>
                </div>
            </div>
        </div>
    );
}
