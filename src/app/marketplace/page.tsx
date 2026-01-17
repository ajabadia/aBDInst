import { getMarketListings } from '@/actions/market';
import Image from 'next/image';
import Link from 'next/link';
import { Tag, MapPin, Search } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default async function MarketplacePage() {
    const listings = await getMarketListings();

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-black/20">
            {/* Header */}
            <div className="bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-white/5 py-12 px-6">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-end gap-6">
                    <div>
                        <h1 className="text-4xl font-bold mb-2">Marketplace</h1>
                        <p className="text-gray-500">Compra y vende instrumentos de colección verificado entre miembros.</p>
                    </div>

                    <div className="flex gap-2">
                        <div className="relative group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-ios-blue h-4 w-4" />
                            <input
                                type="text"
                                placeholder="Buscar..."
                                className="pl-10 pr-4 py-2 rounded-full bg-gray-100 dark:bg-white/5 border-transparent focus:bg-white focus:ring-2 ring-ios-blue outline-none transition-all w-64"
                            />
                        </div>
                        <Button className="rounded-full bg-ios-blue hover:bg-blue-600 text-white">Vender Artículo</Button>
                    </div>
                </div>
            </div>

            {/* Grid */}
            <div className="max-w-7xl mx-auto px-6 py-12">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {listings.map((item: any) => (
                        <Link key={item._id} href={`/marketplace/${item._id}`} className="group bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-white/5 overflow-hidden hover:shadow-xl transition-all hover:-translate-y-1">
                            <div className="aspect-square relative bg-gray-100">
                                {item.instrument?.genericImages?.[0] ? (
                                    <Image src={item.instrument.genericImages[0]} fill alt="inst" className="object-cover" />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-gray-400">Sin Foto</div>
                                )}
                                <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-md text-white px-3 py-1 rounded-full font-bold text-sm">
                                    {new Intl.NumberFormat('es-ES', { style: 'currency', currency: item.currency || 'EUR' }).format(item.price)}
                                </div>
                            </div>

                            <div className="p-4">
                                <p className="text-xs uppercase font-bold text-gray-400 mb-1">{item.instrument?.brand}</p>
                                <h3 className="font-bold text-lg mb-2 leading-tight group-hover:text-ios-blue transition-colors line-clamp-1">{item.instrument?.model}</h3>

                                <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                                    <Tag size={12} /> <span className="capitalize">{item.condition}</span>
                                    <span>•</span>
                                    <MapPin size={12} /> {item.user?.location || 'Mundo'}
                                </div>

                                <div className="flex items-center justify-between border-t border-gray-100 dark:border-white/5 pt-3 mt-auto">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-gray-200 relative overflow-hidden">
                                            {item.user?.image && <Image src={item.user.image} fill alt="Seller" />}
                                        </div>
                                        <span className="text-xs font-medium truncate max-w-[100px]">{item.user?.name}</span>
                                    </div>
                                    <span className="text-xs text-gray-400">Hace 2d</span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
