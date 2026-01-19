import { getPublicShowroom } from '@/actions/showroom';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Calendar, Tag, ArrowLeft, Share2, Music } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import ShowroomHeaderActions from '@/components/public/ShowroomHeaderActions';

export default async function PublicShowroomPage(props: { params: Promise<{ slug: string }> }) {
    const params = await props.params;
    const { slug } = params;
    const showroom = await getPublicShowroom(slug);

    if (!showroom) {
        notFound();
    }

    const { privacy } = showroom;

    // Theme Classes Map
    const themeClasses: Record<string, string> = {
        minimal: 'bg-white text-gray-900',
        dark: 'bg-black text-white',
        boutique: 'bg-[#f8f5f2] text-[#2c2c2c] font-serif', // Example serif theme
    };

    // Fallback if theme not found
    const containerClass = themeClasses[showroom.theme] || themeClasses.minimal;
    const isDark = showroom.theme === 'dark';

    return (
        <div className={`min-h-screen ${containerClass} transition-colors duration-500`}>
            {/* Header / Hero */}
            <div className={`relative px-6 py-20 md:py-32 text-center md:text-left overflow-hidden border-b ${isDark ? 'border-white/10' : 'border-black/5'}`}>
                {/* Background Decor or Cover Image */}
                {showroom.coverImage ? (
                    <>
                        <div className="absolute inset-0 z-0">
                            <Image
                                src={showroom.coverImage}
                                alt="Cover"
                                fill
                                className="object-cover opacity-20 blur-sm"
                            />
                            <div className={`absolute inset-0 ${isDark ? 'bg-black/60' : 'bg-white/60'}`} />
                        </div>
                    </>
                ) : (
                    <div className="absolute top-0 right-0 p-20 opacity-5 pointer-events-none">
                        <Music size={400} />
                    </div>
                )}

                <div className="max-w-7xl mx-auto relative z-10 flex flex-col md:flex-row items-end justify-between gap-8">
                    <div className="space-y-6 max-w-2xl">
                        <div className="space-y-2">
                            <p className={`text-sm font-bold uppercase tracking-[0.2em] ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                Colección de {showroom.userId?.name || 'Usuario'}
                            </p>
                            <h1 className="text-5xl md:text-7xl font-bold tracking-tighter leading-tight">
                                {showroom.name}
                            </h1>
                        </div>
                        {showroom.description && (
                            <p className={`text-xl md:text-2xl font-light leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                                {showroom.description}
                            </p>
                        )}
                    </div>

                    <ShowroomHeaderActions slug={slug} isDark={isDark} />
                </div>
            </div>

            {/* Grid */}
            <div className="max-w-7xl mx-auto px-6 py-20">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-16 gap-x-10">
                    {showroom.items.map((item: any) => {
                        // Access populated data correctly
                        const collectionData = item.collectionId || {};
                        const instrument = collectionData.instrumentId || {};

                        const mainImage = collectionData.userImages?.[0]?.url || instrument.genericImages?.[0];

                        return (
                            <div key={item._id} className="group space-y-6">
                                {/* Image Card */}
                                <div className={`aspect-[4/5] relative rounded-[2rem] overflow-hidden ${isDark ? 'bg-white/5' : 'bg-black/5'}`}>
                                    {mainImage ? (
                                        <Image
                                            src={mainImage}
                                            alt={instrument.model || 'Instrumento'}
                                            fill
                                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center opacity-20">
                                            <Music size={64} />
                                        </div>
                                    )}

                                    {/* Overlay Info */}
                                    <div className="absolute top-4 left-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-md ${isDark ? 'bg-white/10 text-white' : 'bg-black/80 text-white'}`}>
                                            {instrument.type?.replace('_', ' ')}
                                        </span>
                                    </div>
                                </div>

                                {/* Text Info */}
                                <div className="space-y-3">
                                    <div>
                                        <h3 className="text-2xl font-bold leading-tight">{instrument.model}</h3>
                                        <p className={`font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{instrument.brand}</p>
                                    </div>

                                    {/* Specs / Details */}
                                    <div className={`flex flex-wrap gap-4 text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                        {instrument.year && (
                                            <span className="flex items-center gap-1.5">
                                                <Calendar size={14} /> {instrument.year}
                                            </span>
                                        )}
                                        {privacy?.showSerialNumbers && collectionData.serialNumber && (
                                            <span className="flex items-center gap-1.5">
                                                <Tag size={14} /> S/N: {collectionData.serialNumber}
                                            </span>
                                        )}
                                        {privacy?.showStatus && collectionData.status && (
                                            <span className="flex items-center gap-1.5 capitalize">
                                                <span className={`w-2 h-2 rounded-full ${collectionData.status === 'active' ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                                                {collectionData.status}
                                            </span>
                                        )}
                                        {privacy?.showAcquisitionDate && collectionData.acquisition?.date && (
                                            <span className="flex items-center gap-1.5">
                                                Since {new Date(collectionData.acquisition.date).getFullYear()}
                                            </span>
                                        )}
                                    </div>

                                    {/* Placard / Public Note */}
                                    {item.placardText && (
                                        <div className={`p-4 rounded-xl ${isDark ? 'bg-white/5' : 'bg-black/5'}`}>
                                            <p className={`font-serif italic ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>"{item.placardText}"</p>
                                        </div>
                                    )}

                                    {/* Owner's Note */}
                                    {item.publicNote && !item.placardText && (
                                        <div className={`pl-4 border-l-2 ${isDark ? 'border-white/20' : 'border-black/10'}`}>
                                            <p className={`text-sm italic leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                                "{item.publicNote}"
                                            </p>
                                        </div>
                                    )}

                                    {/* Price if Allowed */}
                                    {privacy?.showPrices && collectionData.acquisition?.price && (
                                        <p className="text-lg font-bold">
                                            {new Intl.NumberFormat('es-ES', { style: 'currency', currency: collectionData.acquisition.currency || 'EUR' }).format(collectionData.acquisition.price)}
                                        </p>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Footer */}
            <footer className={`py-12 text-center text-sm opacity-50 ${isDark ? 'border-t border-white/10' : 'border-t border-black/5'}`}>
                <p>Curado con <strong>Instrument Collector</strong></p>
                <Link href="/" className="hover:underline mt-2 inline-block">Crea tu propio showroom</Link>
            </footer>
        </div>
    );
}
