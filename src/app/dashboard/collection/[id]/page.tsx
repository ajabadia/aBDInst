import { auth } from '@/auth';
import { getCollectionItemById } from '@/actions/collection';
import { notFound, redirect } from 'next/navigation';
import EditCollectionItemForm from '@/components/EditCollectionItemForm';
import MaintenanceHistory from '@/components/MaintenanceHistory';
import { Tabs, Tab } from '@/components/Tabs';
import QRCodeGenerator from '@/components/QRCodeGenerator';

export default async function EditItemPage({ params }: { params: { id: string } }) {
    const { id } = await params;
    const session = await auth();
    if (!session) redirect('/api/auth/signin');

    const item = await getCollectionItemById(id);

    if (!item) notFound();

    return (
        <div className="container mx-auto p-4 max-w-4xl">
            <h1 className="text-2xl font-bold mb-6">
                Gestionar: {item.instrumentId.brand} {item.instrumentId.model}
            </h1>

            <div className="md:flex gap-6">
                <div className="md:w-1/3 mb-6">
                    <div className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-lg mb-4 overflow-hidden shadow-sm border border-gray-200 dark:border-gray-700">
                        {item.instrumentId.genericImages?.[0] && (
                            <img src={item.instrumentId.genericImages[0]} className="w-full h-full object-cover" />
                        )}
                    </div>
                    {/* Here we could add "Personal Images" upload later */}
                    <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg text-sm text-gray-500 mb-6 border border-gray-100 dark:border-gray-800">
                        <p>Subir fotos reales de tu unidad (Próximamente)</p>
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
                                <MaintenanceHistory collectionId={item._id} history={item.maintenanceHistory || []} />
                            </div>
                        </Tab>
                    </Tabs>
                </div>
            </div>
        </div>
    );
}
