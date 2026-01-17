import { getMarketListingById } from '@/actions/market';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck, MapPin, Tag, Calendar, Heart, MessageCircle, Share2, BadgeCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import MarketGallery from '@/components/market/MarketGallery';
import Image from 'next/image';

export default async function ListingPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const listing = await getMarketListingById(id);

    if (!listing) notFound();

    const { instrument, user } = listing;
    // Combine instrument generic images + collection specific images (if we had them in collectionItem populated, strict now using instrument generics as fallback, ideally marketListing copies them from collection)
    // For MVP assuming instrument generics are the main visual or we'd need to populate collectionItem.images
    // Let's assume listing has access to visuals. For now using instrument.genericImages.
    const images = instrument.genericImages || [];

    return (
        <div className="min-h-screen bg-white dark:bg-zinc-950">
            {/* Nav */}
            <div className="border-b border-gray-100 dark:border-white/5 sticky top-0 bg-white/80 dark:bg-black/80 backdrop-blur-md z-40">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <Link href="/marketplace" className="flex items-center text-sm font-semibold text-gray-500 hover:text-black dark:hover:text-white transition-colors">
                        <ArrowLeft size={16} className="mr-2" />
                        Volver al Mercado
                    </Link>
                    <div className="flex gap-2">
                        <button className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full text-gray-400 hover:text-red-500 transition-colors">
                            <Heart size={20} />
                        </button>
                        <button className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full text-gray-400 hover:text-ios-blue transition-colors">
                            <Share2 size={20} />
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-12 gap-12">

                {/* Visuals */}
                <div className="lg:col-span-7">
                    <MarketGallery images={images} title={`${instrument.brand} ${instrument.model}`} />

                    {/* Description Block */}
                    <div className="mt-12 space-y-6">
                        <div className="bg-gray-50 dark:bg-white/5 p-8 rounded-3xl">
                            <h3 className="text-lg font-bold mb-4">Descripción del Vendedor</h3>
                            <p className="text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                                {listing.description}
                            </p>
                        </div>

                        {/* Specs */}
                        <div className="border border-gray-100 dark:border-white/5 rounded-3xl p-8">
                            <h3 className="text-lg font-bold mb-6">Especificaciones Técnicas</h3>
                            <div className="grid grid-cols-2 gap-y-4 gap-x-8">
                                <div className="border-b border-gray-100 dark:border-white/5 pb-2">
                                    <span className="text-xs text-gray-400 uppercase font-bold block mb-1">Marca</span>
                                    <span className="font-semibold">{instrument.brand}</span>
                                </div>
                                <div className="border-b border-gray-100 dark:border-white/5 pb-2">
                                    <span className="text-xs text-gray-400 uppercase font-bold block mb-1">Modelo</span>
                                    <span className="font-semibold">{instrument.model}</span>
                                </div>
                                <div className="border-b border-gray-100 dark:border-white/5 pb-2">
                                    <span className="text-xs text-gray-400 uppercase font-bold block mb-1">Categoría</span>
                                    <span className="font-semibold bg-gray-100 dark:bg-white/10 px-2 py-0.5 rounded text-xs">{instrument.type}</span>
                                </div>
                                <div className="border-b border-gray-100 dark:border-white/5 pb-2">
                                    <span className="text-xs text-gray-400 uppercase font-bold block mb-1">Año (Est.)</span>
                                    <span className="font-semibold">N/A</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Buy Box */}
                <div className="lg:col-span-5 space-y-6">
                    <div className="sticky top-24 space-y-6">

                        {/* Title & Price */}
                        <div>
                            <span className="text-ios-blue font-bold tracking-widest uppercase text-xs mb-2 block">{instrument.brand}</span>
                            <h1 className="text-4xl font-bold leading-tight mb-4">{instrument.model}</h1>
                            <div className="flex items-center gap-3 mb-6">
                                <span className={cn(
                                    "px-3 py-1 rounded-full text-xs font-bold uppercase border",
                                    listing.condition === 'mint' ? "bg-green-50 text-green-700 border-green-200" :
                                        listing.condition === 'excellent' ? "bg-blue-50 text-blue-700 border-blue-200" :
                                            "bg-gray-100 text-gray-600 border-gray-200"
                                )}>
                                    Estado: {listing.condition}
                                </span>
                                <span className="flex items-center text-gray-500 text-sm">
                                    <MapPin size={14} className="mr-1" /> {user.location || 'Ubicación no especificada'}
                                </span>
                            </div>
                            <div className="text-5xl font-bold tracking-tight">
                                {new Intl.NumberFormat('es-ES', { style: 'currency', currency: listing.currency }).format(listing.price)}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="space-y-3 pt-6 border-t border-gray-100 dark:border-white/5">
                            <Button size="lg" className="w-full h-14 text-lg bg-black hover:bg-gray-800 text-white rounded-2xl shadow-xl shadow-black/10">
                                Contactar al Vendedor
                            </Button>
                            <Button size="lg" variant="outline" className="w-full h-14 text-lg rounded-2xl">
                                Hacer una Oferta
                            </Button>
                        </div>

                        <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
                            <ShieldCheck size={14} className="text-green-500" />
                            Protección al comprador garantizada por Instrument Collector
                        </div>

                        {/* Seller Card */}
                        <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-2xl flex items-center gap-4 border border-gray-100 dark:border-white/5">
                            <div className="w-14 h-14 bg-white rounded-full relative overflow-hidden shadow-sm">
                                {user.image && <Image src={user.image} fill alt="user" className="object-cover" />}
                            </div>
                            <div className="flex-1">
                                <p className="text-xs text-gray-400 uppercase font-bold mb-0.5">Vendido por</p>
                                <div className="flex items-center gap-1.5">
                                    <span className="font-bold text-lg">{user.name}</span>
                                    {user.badges?.some((b: any) => b.id === 'PIONEER' || b.id === 'INVENTORY_MASTER') && (
                                        <BadgeCheck size={16} className="text-ios-blue fill-ios-blue/10" />
                                    )}
                                </div>
                                <p className="text-xs text-gray-500">Miembro desde {new Date(user.createdAt).getFullYear()}</p>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}

function cn(...classes: string[]) {
    return classes.filter(Boolean).join(" ");
}
