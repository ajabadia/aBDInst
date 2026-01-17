import { getExhibitionBySlug } from '@/actions/showroom';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Calendar, Trophy, User, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default async function ExhibitionDetailPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const data = await getExhibitionBySlug(slug);

    if (!data) notFound();

    const { exhibition, submissions } = data;

    return (
        <div className="min-h-screen bg-background">
            {/* HERO BANNER */}
            <div className="relative h-[60vh] min-h-[500px] w-full bg-black flex items-end">
                {exhibition.bannerImage ? (
                    <Image src={exhibition.bannerImage} fill alt={exhibition.title} className="object-cover opacity-60" priority />
                ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-900 to-black z-0" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />

                <div className="relative z-10 max-w-7xl mx-auto px-6 pb-12 w-full">
                    <Link href="/showrooms" className="inline-flex items-center text-gray-300 hover:text-white mb-6 transition-colors font-semibold">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Volver al Museo
                    </Link>

                    <div className="flex items-center gap-3 mb-4">
                        {exhibition.type === 'contest'
                            ? <span className="bg-yellow-500 text-black text-xs font-bold px-3 py-1 rounded-full uppercase flex items-center gap-1"><Trophy size={12} /> Concurso</span>
                            : <span className="bg-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase">Exposición</span>
                        }
                        <span className="text-gray-400 font-bold text-sm flex items-center gap-1">
                            <Calendar size={14} /> {new Date(exhibition.startDate).toLocaleDateString()}
                            {exhibition.endDate && ` — ${new Date(exhibition.endDate).toLocaleDateString()}`}
                        </span>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white mb-6">
                        {exhibition.title}
                    </h1>
                    <p className="text-xl md:text-2xl text-gray-300 max-w-3xl leading-relaxed">
                        {exhibition.description}
                    </p>
                </div>
            </div>

            {/* CONTENT */}
            <div className="max-w-7xl mx-auto px-6 py-20">
                {/* ACTIONS & RULES */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-16 border-b border-gray-200 dark:border-white/10 pb-12">
                    <div>
                        <h3 className="text-lg font-bold mb-2">Estado: <span className="uppercase text-ios-blue">{exhibition.status === 'active' ? 'Abierto' : exhibition.status}</span></h3>
                        <p className="text-gray-500 max-w-md">
                            {exhibition.status === 'active'
                                ? 'Esta exposición acepta visitas y participaciones. ¡Únete!'
                                : 'Este evento ha finalizado o aún no ha comenzado.'}
                        </p>
                    </div>
                    {/* Placeholder for Client Component Button */}
                    {exhibition.status === 'active' && (
                        <Button size="lg" className="rounded-full px-8 bg-ios-blue hover:scale-105 transition-transform">
                            Participar
                        </Button>
                    )}
                </div>

                {/* GALLERY GRID */}
                <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
                    Piezas Exhibidas
                    <span className="text-sm bg-gray-100 dark:bg-white/10 px-3 py-1 rounded-full text-gray-500 font-bold">{submissions.length}</span>
                </h2>

                {submissions.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {submissions.map((sub: any) => (
                            <Link key={sub._id} href={`/instruments/${sub.instrument?._id}`} className="group block">
                                <div className="aspect-[4/5] relative rounded-3xl overflow-hidden bg-gray-100 dark:bg-white/5 mb-4 shadow-sm hover:shadow-xl transition-all duration-500">
                                    {sub.instrument?.genericImages?.[0] ? (
                                        <Image src={sub.instrument.genericImages[0]} fill alt="inst" className="object-cover transition-transform duration-700 group-hover:scale-110" />
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-gray-400">Sin Imagen</div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

                                    <div className="absolute bottom-6 left-6 right-6 text-white">
                                        <p className="text-xs font-bold uppercase tracking-widest text-gray-300 mb-1">{sub.instrument?.brand}</p>
                                        <h3 className="text-2xl font-bold leading-tight mb-2">{sub.instrument?.model}</h3>
                                        <div className="flex items-center gap-2 text-xs font-medium text-gray-300">
                                            <div className="w-5 h-5 rounded-full bg-white/20 relative overflow-hidden">
                                                {sub.user?.image && <Image src={sub.user.image} fill alt="usr" />}
                                            </div>
                                            Colección de {sub.user?.name}
                                        </div>
                                    </div>

                                    {exhibition.type === 'contest' && sub.status === 'winner' && (
                                        <div className="absolute top-4 right-4 bg-yellow-400 text-black px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
                                            <Trophy size={12} /> Ganador
                                        </div>
                                    )}
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="py-20 text-center bg-gray-50 dark:bg-white/5 rounded-3xl border-dashed border-2 border-gray-200 dark:border-white/10">
                        <Trophy size={48} className="mx-auto text-gray-300 mb-4" />
                        <h3 className="text-xl font-bold text-gray-400 mb-2">Aún no hay piezas</h3>
                        <p className="text-gray-500">Sé el primero en participar en esta exposición.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
