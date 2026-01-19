import { getPublicShowroom } from '@/actions/showroom';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Calendar, Tag, ArrowLeft, Share2, Music } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import ShowroomHeaderActions from '@/components/public/ShowroomHeaderActions';
import ShowroomGridItem from '@/components/public/ShowroomGridItem';

export default async function PublicShowroomPage(props: { params: Promise<{ slug: string }> }) {
    const params = await props.params;
    const { slug } = params;
    const showroom = await getPublicShowroom(slug);

    // 1. Check if showroom exists
    if (!showroom) {
        notFound();
    }

    // 2. Auth & Visibility Check
    const session = await (await import('@/auth')).auth();
    const isOwner = session?.user?.id === showroom.userId?._id?.toString() || session?.user?.id === showroom.userId?.toString();

    // Draft/Archived Logic
    if (showroom.status !== 'published') {
        if (!isOwner) {
            // Private/Draft -> 404 for non-owners
            notFound();
        }
        // If owner, show a banner
    }

    // Private Visibility Logic
    if (showroom.visibility === 'private' && !isOwner) {
        notFound();
    }

    const { privacy } = showroom;

    // Theme Classes Map
    const themeClasses: Record<string, string> = {
        minimal: 'bg-white text-gray-900',
        dark: 'bg-black text-white',
        boutique: 'bg-[#f8f5f2] text-[#2c2c2c] font-serif',
    };

    // Fallback if theme not found
    const containerClass = themeClasses[showroom.theme] || themeClasses.minimal;
    const isDark = showroom.theme === 'dark';

    return (
        <div className={`min-h-screen ${containerClass} transition-colors duration-500`}>
            {/* Owner Preview Banner */}
            {showroom.status !== 'published' && (
                <div className="bg-orange-500 text-white text-center py-2 text-sm font-bold uppercase tracking-wider sticky top-0 z-50">
                    Modo Vista Previa ({showroom.status}) — Solo visible para ti
                </div>
            )}

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

                    <ShowroomHeaderActions
                        slug={slug}
                        isDark={isDark}
                        kioskEnabled={showroom.kioskEnabled ?? true}
                    />
                </div>
            </div>

            {/* Grid */}
            <div className="max-w-7xl mx-auto px-6 py-20">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-16 gap-x-10">
                    {showroom.items.map((item: any) => (
                        <ShowroomGridItem
                            key={item._id}
                            item={item}
                            isDark={isDark}
                            privacy={privacy}
                        />
                    ))}
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
