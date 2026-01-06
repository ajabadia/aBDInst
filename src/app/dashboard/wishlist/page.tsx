import { auth } from '@/auth';
import { getWishlist } from '@/actions/wishlist';
import { redirect } from 'next/navigation';
import InstrumentCard from '@/components/InstrumentCard';
import { Heart, Music, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default async function WishlistPage() {
    const session = await auth();
    if (!session) redirect('/login');

    const result = await getWishlist();
    const items = result.success ? result.data : [];

    return (
        <div className="max-w-7xl mx-auto px-6 py-12 lg:py-20">
            {/* Header */}
            <header className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-ios-pink/10 text-ios-pink rounded-xl shadow-sm">
                            <Heart className="w-6 h-6 fill-current" />
                        </div>
                        <h1 className="text-4xl font-bold tracking-tight">Mi Wishlist</h1>
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 font-medium ml-1">
                        Instrumentos que estás buscando o te gustaría añadir a tu configuración.
                    </p>
                </div>
                {items.length > 0 && (
                    <Link href="/instruments">
                        <Button variant="secondary" size="sm" icon={<ArrowRight />}>Explorar más</Button>
                    </Link>
                )}
            </header>

            {items.length === 0 ? (
                <div className="glass-panel rounded-[2.5rem] p-16 text-center border-dashed border-2 flex flex-col items-center max-w-2xl mx-auto">
                    <div className="w-20 h-20 bg-black/5 dark:bg-white/5 rounded-full flex items-center justify-center mb-6">
                        <Music className="w-10 h-10 text-gray-300" />
                    </div>
                    <h3 className="text-2xl font-bold tracking-tight mb-3">Tu wishlist está vacía</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-10 text-balance">
                        Explora el catálogo maestro para encontrar instrumentos interesantes y guárdalos aquí para hacerles un seguimiento de precio y disponibilidad.
                    </p>
                    <Link href="/instruments">
                        <Button size="lg" icon={<Music />}>Explorar Catálogo</Button>
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {items.map((item: any) => (
                        <div key={item._id} className="relative group animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <InstrumentCard inst={item.instrumentId} />

                            {/* Apple Style Badge */}
                            <div className="absolute top-4 left-4 z-10 px-2.5 py-1 bg-ios-pink text-white text-[10px] font-bold rounded-full shadow-lg shadow-ios-pink/20 uppercase tracking-widest">
                                Wishlist
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
