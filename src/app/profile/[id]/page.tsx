import { getPublicProfile } from '@/actions/profile';
import { notFound, redirect } from 'next/navigation';
import Image from 'next/image';
import { MapPin, Calendar, Globe, Box, Heart } from 'lucide-react';
import FollowButton from '@/components/social/FollowButton';
import Link from 'next/link';
import { Instrument } from '@/types/instrument';

export default async function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const { success, data, error } = await getPublicProfile(id);

    if (!success || !data) {
        if (error === "Este perfil no está disponible.") {
            return (
                <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
                    <h1 className="text-3xl font-bold mb-4 opacity-50">Perfil Restringido</h1>
                    <p className="text-gray-500">Este perfil ha sido ocultado por moderación.</p>
                </div>
            );
        }
        notFound();
    }

    const { user, stats, collection, isFollowing } = data;

    return (
        <div className="min-h-screen pb-20">
            {/* Header / Cover */}
            <div className="h-48 md:h-64 bg-gradient-to-r from-blue-900 to-slate-900 relative">
                <div className="absolute inset-0 bg-black/20" />
            </div>

            <div className="max-w-6xl mx-auto px-6">
                <div className="relative -mt-20 md:-mt-24 mb-6 flex flex-col md:flex-row items-end md:items-end gap-6">
                    {/* Avatar */}
                    <div className="relative">
                        <div className="w-32 h-32 md:w-40 md:h-40 rounded-3xl border-4 border-white dark:border-gray-950 bg-white shadow-xl overflow-hidden">
                            {user.image ? (
                                <Image src={user.image} alt={user.name} width={160} height={160} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-gray-200 flex items-center justify-center text-4xl font-bold text-gray-400">
                                    {user.name?.[0]}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Info */}
                    <div className="flex-1 pb-4 text-center md:text-left">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{user.name}</h1>
                        <p className="text-gray-600 dark:text-gray-300 max-w-lg mb-4">{user.bio || "Coleccionista de instrumentos."}</p>

                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-gray-500 dark:text-gray-400">
                            {user.location && (
                                <span className="flex items-center gap-1">
                                    <MapPin size={14} /> {user.location}
                                </span>
                            )}
                            <span className="flex items-center gap-1">
                                <Calendar size={14} /> Se unió en {new Date(user.createdAt).getFullYear()}
                            </span>
                            {user.website && (
                                <a href={user.website} target="_blank" className="flex items-center gap-1 hover:text-blue-500">
                                    <Globe size={14} /> Website
                                </a>
                            )}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="pb-4 flex flex-col gap-2 w-full md:w-auto">
                        <FollowButton targetUserId={data.user._id} targetUserName={user.name} isFollowing={isFollowing} />
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm text-center">
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.collectionsCount}</div>
                        <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">Instrumentos</div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm text-center">
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.wishlistCount}</div>
                        <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">Deseados</div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm text-center">
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">{user.followers?.length || 0}</div>
                        <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">Seguidores</div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm text-center">
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">{user.following?.length || 0}</div>
                        <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">Siguiendo</div>
                    </div>
                </div>

                {/* Content Tabs area (Simplified for now) */}
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <Box className="text-blue-500" />
                    Colección Reciente
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {collection.map((item: any) => (
                        <div key={item._id} className="group bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-all">
                            <div className="aspect-[4/3] bg-gray-100 relative overflow-hidden">
                                {item.instrumentId?.images?.[0] ? (
                                    <Image
                                        src={item.instrumentId.images[0]}
                                        alt={item.instrumentId.model}
                                        fill
                                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                                    />
                                ) : item.instrumentId?.genericImages?.[0] ? (
                                    <Image
                                        src={item.instrumentId.genericImages[0]}
                                        alt={item.instrumentId.model}
                                        fill
                                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-300 bg-gray-50">
                                        <Box size={40} />
                                    </div>
                                )}
                            </div>
                            <div className="p-4">
                                <h4 className="font-bold text-gray-900 dark:text-white truncate">{item.instrumentId?.brand} {item.instrumentId?.model}</h4>
                                <p className="text-sm text-gray-500">{item.instrumentId?.type}</p>
                            </div>
                        </div>
                    ))}
                    {collection.length === 0 && (
                        <div className="col-span-full py-12 text-center text-gray-400 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
                            No hay instrumentos públicos.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
