import { auth } from '@/auth';
import { getWishlist } from '@/actions/wishlist';
import { redirect } from 'next/navigation';
import InstrumentCard from '@/components/InstrumentCard';
import { Heart, Music, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default async function WishlistPage() {
    const session = await auth();
    if (!session) redirect('/login');

    const result = await getWishlist();
    const items = result.success ? result.data : [];

    return (
        <div className="max-w-7xl mx-auto px-6 py-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                        <div className="p-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl">
                            <Heart className="w-6 h-6 fill-current" />
                        </div>
                        Mi Wishlist
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">
                        Instrumentos que estás buscando o te gustaría tener.
                    </p>
                </div>
            </div>

            {items.length === 0 ? (
                <div className="text-center py-20 bg-gray-50 dark:bg-gray-800/50 rounded-3xl border border-dashed border-gray-200 dark:border-gray-700">
                    <Music className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">Tu wishlist está vacía</h3>
                    <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-8">
                        Explora el catálogo para encontrar instrumentos interesantes y guárdalos aquí para seguirlos.
                    </p>
                    <Link
                        href="/instruments"
                        className="inline-flex items-center px-6 py-3 rounded-full bg-blue-600 text-white font-medium hover:bg-blue-700 transition"
                    >
                        Explorar Catálogo
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {items.map((item: any) => (
                        <div key={item._id} className="relative group">
                            <InstrumentCard inst={item.instrumentId} />

                            {/* Overlay Badge */}
                            <div className="absolute top-3 left-3 z-10 px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full shadow-lg">
                                WISHLIST
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
