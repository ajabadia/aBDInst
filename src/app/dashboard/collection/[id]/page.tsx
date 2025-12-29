import { auth } from '@/auth';
import { getCollectionItemById } from '@/actions/collection';
import { notFound, redirect } from 'next/navigation';
import EditCollectionItemForm from '@/components/EditCollectionItemForm';

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
                    <div className="aspect-square bg-gray-200 dark:bg-gray-700 rounded mb-4 overflow-hidden">
                        {item.instrumentId.genericImages?.[0] && (
                            <img src={item.instrumentId.genericImages[0]} className="w-full h-full object-cover" />
                        )}
                    </div>
                    {/* Here we could add "Personal Images" upload later */}
                    <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded text-sm text-gray-500">
                        <p>Subir fotos reales de tu unidad (Próximamente)</p>
                    </div>
                </div>

                <div className="md:w-2/3">
                    <EditCollectionItemForm item={item} />
                </div>
            </div>
        </div>
    );
}
