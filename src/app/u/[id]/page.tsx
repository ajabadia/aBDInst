import { getPublicProfile } from '@/actions/public';
import CollectionItemCard from '@/components/CollectionItemCard';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { ShieldCheck, Calendar } from 'lucide-react';
import UserAvatar from '@/components/UserAvatar';

export default async function PublicProfilePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const data = await getPublicProfile(id);

    if (!data) {
        return notFound();
    }

    const { user, collection } = data;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a]">
            {/* HERO HEADER */}
            <div className="relative bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800 pt-12 pb-16">

                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <div className="flex flex-col md:flex-row items-center gap-8 justify-center md:justify-start text-center md:text-left">
                        <div className="relative w-32 h-32 rounded-full border-4 border-white dark:border-black shadow-xl">
                            <UserAvatar user={user} size={128} className="w-full h-full" />
                        </div>

                        <div>
                            <div className="flex items-center gap-3 justify-center md:justify-start mb-2">
                                <h1 className="text-4xl font-bold text-gray-900 dark:text-white tracking-tight">{user.name}</h1>
                                <ShieldCheck className="text-blue-500" />
                            </div>
                            <p className="text-xl text-gray-500 dark:text-gray-400 font-light">
                                Coleccionista de Instrumentos
                            </p>
                            <div className="mt-4 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/5 dark:bg-white/10 text-sm font-medium">
                                <Calendar size={14} />
                                <span>Miembro desde 2024</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* COLLECTION GRID */}
            <div className="max-w-7xl mx-auto px-6 py-12">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-bold flex items-center gap-3">
                        Colección Pública
                        <span className="bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-2.5 py-0.5 rounded-full text-sm font-semibold">
                            {collection.length}
                        </span>
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {collection.map((item: any) => (
                        <CollectionItemCard key={item._id} item={item} publicView={true} />
                    ))}
                </div>

                {collection.length === 0 && (
                    <div className="text-center py-20 opacity-50">
                        <p className="text-xl">Este usuario aún no tiene instrumentos públicos.</p>
                    </div>
                )}
            </div>

            <footer className="py-12 text-center text-sm text-gray-400 border-t border-gray-200 dark:border-white/5 mt-12">
                <p>Instrument Collector • Perfil Público Verificado</p>
            </footer>
        </div>
    );
}
