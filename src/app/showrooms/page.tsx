import { getTimeline } from '@/actions/scheduler';

import Link from 'next/link';
import Image from 'next/image';
import { Calendar, Trophy, ChevronRight } from 'lucide-react';

// Using server component fetching
async function getPublicExhibitions() {
    // We can use the scheduler action or a specific exhibition list
    // Let's use getTimeline for now to see "Active" vs "Upcoming"
    // Or simpler: a direct query
    const Exhibition = (await import('@/models/Exhibition')).default;
    const dbConnect = (await import('@/lib/db')).default;
    await dbConnect();

    // Fetch active and upcoming
    const today = new Date();
    const exhibitions = await Exhibition.find({
        status: { $in: ['active', 'upcoming', 'ended'] }
    }).sort({ startDate: -1 }).lean();

    return JSON.parse(JSON.stringify(exhibitions));
}

export default async function ShowroomsPage() {
    const exhibitions = await getPublicExhibitions();

    // Group by status
    const active = exhibitions.filter((e: any) => e.status === 'active');
    const upcoming = exhibitions.filter((e: any) => e.status === 'upcoming');
    const archive = exhibitions.filter((e: any) => e.status === 'ended');

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-black">
            {/* Header */}
            <div className="bg-black text-white pt-32 pb-16 px-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-900/40 to-black z-0" />
                <div className="max-w-7xl mx-auto relative z-10">
                    <p className="text-purple-400 font-bold tracking-widest uppercase text-sm mb-4">Museo Virtual</p>
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">Salas de Exposición</h1>
                    <p className="text-xl text-gray-400 max-w-2xl">
                        Descubre colecciones curadas, participa en concursos y viaja a través de la historia de la música.
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-16 space-y-24">

                {/* ACTIVE EXHIBITIONS */}
                {active.length > 0 && (
                    <section>
                        <div className="flex items-center gap-4 mb-8">
                            <span className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                            <h2 className="text-2xl font-bold uppercase tracking-widest text-gray-500">En Curso</h2>
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {active.map((ex: any) => (
                                <Link key={ex._id} href={`/showrooms/${ex.slug}`} className="group relative h-[400px] rounded-3xl overflow-hidden bg-white dark:bg-zinc-900 shadow-xl transition-all hover:scale-[1.01]">
                                    {ex.bannerImage ? (
                                        <Image src={ex.bannerImage} fill alt={ex.title} className="object-cover transition-transform duration-700 group-hover:scale-105" />
                                    ) : (
                                        <div className="absolute inset-0 bg-gradient-to-br from-ios-blue to-purple-800" />
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent p-8 flex flex-col justify-end">
                                        <div className="flex items-center gap-3 mb-2">
                                            {ex.type === 'contest'
                                                ? <span className="bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded uppercase flex items-center gap-1"><Trophy size={12} /> Concurso</span>
                                                : <span className="bg-white/20 text-white backdrop-blur-md text-xs font-bold px-2 py-1 rounded uppercase">Exposición</span>
                                            }
                                        </div>
                                        <h3 className="text-3xl font-bold text-white mb-2">{ex.title}</h3>
                                        <p className="text-gray-300 line-clamp-2">{ex.description}</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </section>
                )}

                {/* UPCOMING */}
                {upcoming.length > 0 && (
                    <section>
                        <div className="flex items-center gap-4 mb-8">
                            <Calendar className="text-gray-400" />
                            <h2 className="text-2xl font-bold uppercase tracking-widest text-gray-500">Próximamente</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {upcoming.map((ex: any) => (
                                <div key={ex._id} className="apple-card p-6 bg-white dark:bg-white/5 opacity-70 hover:opacity-100 transition-opacity">
                                    <p className="text-xs text-ios-blue font-bold uppercase mb-2">
                                        {new Date(ex.startDate).toLocaleDateString()}
                                    </p>
                                    <h4 className="text-xl font-bold mb-2">{ex.title}</h4>
                                    <p className="text-sm text-gray-500 mb-4 line-clamp-2">{ex.description}</p>
                                    <div className="inline-flex items-center text-sm font-semibold hover:gap-2 transition-all">
                                        Más info <ChevronRight size={16} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* ARCHIVE */}
                {archive.length > 0 && (
                    <section>
                        <h2 className="text-2xl font-bold uppercase tracking-widest text-gray-500 mb-8 opacity-50">Archivo</h2>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 opacity-60 hover:opacity-100 transition-opacity">
                            {archive.map((ex: any) => (
                                <Link key={ex._id} href={`/showrooms/${ex.slug}`} className="block group">
                                    <div className="aspect-video bg-gray-200 dark:bg-white/10 rounded-xl mb-4 overflow-hidden relative">
                                        {ex.bannerImage && <Image src={ex.bannerImage} fill alt="archive" className="object-cover grayscale group-hover:grayscale-0 transition-all" />}
                                    </div>
                                    <h4 className="font-bold text-gray-900 dark:text-gray-200">{ex.title}</h4>
                                    <p className="text-xs text-gray-500">Finalizado el {new Date(ex.endDate || ex.updatedAt).toLocaleDateString()}</p>
                                </Link>
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
}
