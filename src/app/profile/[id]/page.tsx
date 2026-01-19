import { getPublicProfile } from '@/actions/profile';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { MapPin, Calendar, Globe, Box, Heart, Users } from 'lucide-react';
import FollowButton from '@/components/social/FollowButton';
import InstrumentCard from '@/components/InstrumentCard';
import { cn } from '@/lib/utils';

export default async function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const { success, data, error } = await getPublicProfile(id);

    if (!success || !data) {
        if (error === "Este perfil no está disponible.") {
            return (
                <div className="flex flex-col items-center justify-center min-h-[70vh] text-center p-6">
                    <div className="w-20 h-20 bg-ios-red/10 text-ios-red rounded-full flex items-center justify-center mb-6">
                        <Box size={40} />
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight mb-2">Perfil Restringido</h1>
                    <p className="text-gray-500 max-w-sm">Este perfil ha sido ocultado por moderación o no existe.</p>
                </div>
            );
        }
        notFound();
    }

    const { user, stats, collection, isFollowing, showrooms } = data;

    return (
        <div className="min-h-screen pb-32">
            {/* Apple Style Cover */}
            <div className="h-64 md:h-80 bg-gradient-to-br from-ios-blue via-ios-indigo to-midnight-900 relative overflow-hidden">
                <div className="absolute inset-0 bg-black/10 backdrop-blur-[2px]" />
                <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-background to-transparent" />
            </div>

            <div className="max-w-6xl mx-auto px-6">
                {/* Header Section */}
                <div className="relative -mt-24 md:-mt-32 mb-12 flex flex-col md:flex-row items-center md:items-end gap-8 text-center md:text-left">
                    {/* Avatar */}
                    <div className="relative group">
                        <div className="w-40 h-40 md:w-48 md:h-48 rounded-[3rem] border-[6px] border-background bg-white dark:bg-black shadow-apple-lg overflow-hidden transition-transform duration-500 group-hover:scale-[1.02]">
                            {user.image ? (
                                <Image src={user.image} alt={user.name} width={200} height={200} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-ios-blue/10 flex items-center justify-center text-5xl font-bold text-ios-blue">
                                    {user.name?.[0]}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Info */}
                    <div className="flex-1 space-y-4 pb-2">
                        <div className="space-y-1">
                            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900 dark:text-white leading-none">
                                {user.name}
                            </h1>
                            <p className="text-lg md:text-xl text-gray-500 dark:text-gray-400 font-medium leading-tight max-w-2xl">
                                {user.bio || "Coleccionista de instrumentos musicales."}
                            </p>
                        </div>

                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-5 text-[13px] font-bold text-gray-400 uppercase tracking-widest">
                            {user.location && (
                                <span className="flex items-center gap-1.5 bg-black/5 dark:bg-white/5 px-3 py-1 rounded-full">
                                    <MapPin size={14} className="text-ios-blue" /> {user.location}
                                </span>
                            )}
                            <span className="flex items-center gap-1.5">
                                <Calendar size={14} /> Miembro desde {new Date(user.createdAt).getFullYear()}
                            </span>
                            {user.website && (
                                <a href={user.website} target="_blank" className="flex items-center gap-1.5 text-ios-blue hover:underline">
                                    <Globe size={14} /> Website
                                </a>
                            )}
                        </div>
                    </div>

                    {/* Action Button */}
                    <div className="pb-2 w-full md:w-auto shrink-0">
                        <FollowButton targetUserId={data.user._id} targetUserName={user.name} isFollowing={isFollowing} />
                    </div>
                </div>

                {/* Stats Panel (Segmented Style) */}
                <div className="glass-panel rounded-[2rem] p-2 mb-16 flex flex-wrap shadow-apple-sm">
                    {[
                        { label: 'Instrumentos', value: stats.collectionsCount, icon: Box, color: 'text-ios-blue' },
                        { label: 'En Wishlist', value: stats.wishlistCount, icon: Heart, color: 'text-ios-pink' },
                        { label: 'Seguidores', value: user.followers?.length || 0, icon: Users, color: 'text-ios-indigo' },
                        { label: 'Siguiendo', value: user.following?.length || 0, icon: Users, color: 'text-ios-teal' }
                    ].map((s, i) => (
                        <div key={i} className={cn(
                            "flex-1 min-w-[120px] p-6 text-center space-y-1 relative",
                            i < 3 && "after:absolute after:right-0 after:top-1/4 after:h-1/2 after:w-[1px] after:bg-black/5 dark:after:bg-white/5"
                        )}>
                            <div className="flex items-center justify-center gap-2 mb-1">
                                <s.icon size={14} className={s.color} />
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{s.label}</span>
                            </div>
                            <div className="text-3xl font-bold tracking-tight">{s.value}</div>
                        </div>
                    ))}
                </div>

                {/* Showrooms Area */}
                {data.showrooms && data.showrooms.length > 0 && (
                    <section className="space-y-8 mb-16">
                        <div className="flex items-center gap-4">
                            <h3 className="text-2xl font-bold tracking-tight">Showrooms</h3>
                            <div className="h-[1px] flex-1 bg-black/5 dark:bg-white/5 rounded-full" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {data.showrooms.map((s: any) => (
                                <a key={s._id} href={`/s/${s.slug}`} className="group relative aspect-[21/9] rounded-3xl overflow-hidden bg-gray-100 dark:bg-gray-800 block shadow-apple-sm hover:shadow-apple-md transition-shadow">
                                    {/* Banner Image */}
                                    {s.coverImage ? (
                                        <Image src={s.coverImage} alt={s.title} fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600" />
                                    )}

                                    {/* Overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent group-hover:from-black/50 transition-colors" />

                                    {/* Content */}
                                    <div className="absolute inset-0 p-8 flex flex-col justify-end text-white">
                                        <div className="transform transition-transform duration-500 group-hover:-translate-y-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-sm text-[10px] font-bold uppercase tracking-widest border border-white/10">
                                                    {s.type === 'contest' ? 'Concurso' : s.type === 'showroom' ? 'Showroom' : 'Exhibición'}
                                                </span>
                                                {s.status === 'ended' && (
                                                    <span className="px-2 py-0.5 rounded-full bg-black/40 backdrop-blur-sm text-[10px] font-bold uppercase tracking-widest border border-white/10 text-gray-300">
                                                        Finalizado
                                                    </span>
                                                )}
                                            </div>
                                            <h4 className="text-2xl md:text-4xl font-bold tracking-tight leading-none">{s.title}</h4>
                                        </div>
                                    </div>
                                </a>
                            ))}
                        </div>
                    </section>
                )}

                {/* Collection Area */}
                <section className="space-y-8">
                    <div className="flex items-center gap-4">
                        <h3 className="text-2xl font-bold tracking-tight">Colección Pública</h3>
                        <div className="h-[1px] flex-1 bg-black/5 dark:bg-white/5 rounded-full" />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {collection.map((item: any) => (
                            <div key={item._id} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <InstrumentCard inst={item.instrumentId} />
                            </div>
                        ))}

                        {collection.length === 0 && (
                            <div className="col-span-full py-24 text-center glass-panel rounded-[2rem] border-dashed border-2">
                                <Box className="w-12 h-12 mx-auto mb-4 text-gray-300 opacity-50" />
                                <p className="text-gray-500 font-medium">Este coleccionista aún no ha publicado instrumentos.</p>
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
}
