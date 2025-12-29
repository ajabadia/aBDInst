import { auth } from '@/auth';
import { getUserCollection } from '@/actions/collection';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
    const session = await auth();
    if (!session) {
        redirect('/api/auth/signin');
    }

    const collection = await getUserCollection();

    return (
        <div className="container mx-auto p-4 max-w-5xl">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold dark:text-white">Mi Colección</h1>
                <Link href="/instruments" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                    + Añadir Instrumento
                </Link>
            </div>

            <div className="grid gap-4">
                {collection.map((item: any) => (
                    <div key={item._id} className="bg-white dark:bg-gray-800 p-4 rounded shadow flex flex-col sm:flex-row gap-4">
                        <div className="w-full sm:w-24 h-48 sm:h-24 bg-gray-200 dark:bg-gray-700 rounded flex-shrink-0">
                            {item.instrumentId.genericImages?.[0] && (
                                <img
                                    src={item.instrumentId.genericImages[0]}
                                    className="w-full h-full object-cover rounded"
                                />
                            )}
                        </div>
                        <div className="flex-grow">
                            <h2 className="text-xl font-bold dark:text-white">
                                {item.instrumentId.brand} {item.instrumentId.model}
                            </h2>
                            <p className="text-gray-500">{item.instrumentId.type}</p>

                            <div className="mt-2 flex gap-2">
                                <span className={`px-2 py-1 rounded text-xs uppercase ${item.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                    }`}>
                                    {item.status}
                                </span>
                                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs uppercase">
                                    {item.condition}
                                </span>
                            </div>
                        </div>
                        <div className="flex flex-col justify-center">
                            <Link
                                href={`/dashboard/collection/${item._id}`}
                                className="text-blue-500 hover:underline"
                            >
                                Gestionar
                            </Link>
                        </div>
                    </div>
                ))}

                {collection.length === 0 && (
                    <div className="text-center py-12 text-gray-500 bg-gray-50 dark:bg-gray-900 rounded border border-dashed">
                        <p className="mb-4">No tienes instrumentos en tu colección aún.</p>
                        <Link href="/instruments" className="text-blue-500 hover:underline">
                            Explorar el catálogo
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
