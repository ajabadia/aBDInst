import type { Metadata } from 'next';
import { auth } from '@/auth';
import { getInstrumentById } from '@/actions/instrument';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import InstrumentSpecs from '@/components/InstrumentSpecs';
import InstrumentHero from '@/components/InstrumentHero';
import AddToCollectionButton from '@/components/AddToCollectionButton';
import ImageGallery from '@/components/ImageGallery';
import QRCodeGenerator from '@/components/QRCodeGenerator';
import SpecRow from '@/components/SpecRow';
import PdfPreviewModal from '@/components/PdfPreviewModal';
import { getRelatedGear } from '@/actions/instrument';
import { FileText, ArrowLeft, Edit2, Globe, Star, ExternalLink, ChevronRight, Layers, Box } from 'lucide-react';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const { id } = await params;
    const instrument = await getInstrumentById(id);

    if (!instrument) {
        return {
            title: 'Instrumento no encontrado',
        };
    }

    const title = `${instrument.model} - ${instrument.brand}`;
    const description = instrument.description?.substring(0, 160) || `Especificaciones y detalles técnicos de ${instrument.brand} ${instrument.model}.`;

    return {
        title: `${title} | Instrument Collector`,
        description,
        openGraph: {
            title,
            description,
            images: instrument.genericImages?.[0] ? [{ url: instrument.genericImages[0] }] : [],
        },
    };
}

export default async function InstrumentDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const instrument = await getInstrumentById(id);
    const relatedGear = await getRelatedGear(id);
    const session = await auth();
    const isLoggedIn = !!session?.user;
    const canEdit = ['admin', 'editor'].includes((session?.user as any)?.role);

    if (!instrument) {
        notFound();
    }

    // Group specs logic
    const groupedSpecs: Record<string, any[]> = {};
    if (instrument.specs && Array.isArray(instrument.specs)) {
        instrument.specs.forEach((s: any) => {
            if (!groupedSpecs[s.category]) groupedSpecs[s.category] = [];
            groupedSpecs[s.category].push(s);
        });
    }

    return (
        <div className="max-w-7xl mx-auto px-6 py-12 md:py-20">
            {/* Header: Clean & Airy */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
                <div>
                    <Link href="/instruments" className="inline-flex items-center text-sm text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition mb-4 group">
                        <ArrowLeft className="w-4 h-4 mr-1 transition-transform group-hover:-translate-x-1" />
                        Volver al catálogo
                    </Link>
                    <p className="text-blue-600 dark:text-blue-400 font-medium text-sm mb-2 uppercase tracking-wider">{instrument.brand}</p>
                    <h1 className="text-4xl md:text-5xl font-semibold tracking-tight dark:text-white text-gray-900">{instrument.model}</h1>
                    <p className="text-xl text-gray-500 dark:text-gray-400 mt-2 font-light">{instrument.type} {instrument.subtype && `• ${instrument.subtype}`}</p>
                </div>
                <div className="flex gap-3">
                    {canEdit && (
                        <Link
                            href={`/instruments/${id}/edit`}
                            className="inline-flex items-center rounded-full bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-5 py-2.5 text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                        >
                            <Edit2 className="w-4 h-4 mr-2" />
                            Editar
                        </Link>
                    )}
                    {isLoggedIn && (
                        <div className="inline-block">
                            <AddToCollectionButton instrumentId={instrument._id} />
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
                {/* Left: Gallery (Big visual impact) */}
                <div className="lg:col-span-7">
                    <div className="sticky top-24">
                        <ImageGallery images={instrument.genericImages || []} altText={`${instrument.brand} ${instrument.model}`} />
                    </div>
                </div>

                {/* Right: Narrative Info */}
                <div className="lg:col-span-5 space-y-10">
                    <section>
                        <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-6">Descripción</h3>
                        <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed font-light">
                            {instrument.description || 'Sin descripción disponible.'}
                        </p>
                    </section>

                    {instrument.years && instrument.years.length > 0 && (
                        <section className="flex items-center justify-between border-t border-gray-100 dark:border-gray-800 pt-6">
                            <span className="text-sm font-medium text-gray-500">Años de producción</span>
                            <span className="text-lg font-semibold text-gray-900 dark:text-white">{instrument.years.join(', ')}</span>
                        </section>
                    )}

                    {instrument.version && (
                        <section className="flex items-center justify-between border-t border-gray-100 dark:border-gray-800 pt-6">
                            <span className="text-sm font-medium text-gray-500">Versión</span>
                            <span className="text-lg font-semibold text-gray-900 dark:text-white">{instrument.version}</span>
                        </section>
                    )}

                    {instrument.relatedTo && (
                        <section className="pt-6 border-t border-gray-100 dark:border-gray-800">
                            <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">Equipo Principal</h4>
                            <Link
                                href={`/instruments/${instrument.relatedTo.id || instrument.relatedTo._id || instrument.relatedTo}`}
                                className="flex items-center gap-3 p-3 rounded-2xl bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100/50 dark:border-blue-900/20 group hover:bg-blue-50 transition-colors"
                            >
                                <div className="w-10 h-10 rounded-xl bg-white dark:bg-gray-800 flex items-center justify-center shadow-sm text-blue-600">
                                    <Box size={20} />
                                </div>
                                <div>
                                    <p className="text-xs text-blue-600/60 dark:text-blue-400/60 font-medium">Accesorio para:</p>
                                    <p className="text-sm font-semibold text-blue-900 dark:text-blue-100 group-hover:underline">
                                        {instrument.relatedTo.brand} {instrument.relatedTo.model}
                                    </p>
                                </div>
                                <ChevronRight className="ml-auto w-4 h-4 text-blue-300 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </section>
                    )}

                    {relatedGear && relatedGear.length > 0 && (
                        <section className="pt-6 border-t border-gray-100 dark:border-gray-800">
                            <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">Accesorios y Periféricos</h4>
                            <div className="grid gap-2">
                                {relatedGear.map((gear: any) => (
                                    <Link
                                        key={gear._id}
                                        href={`/instruments/${gear._id}`}
                                        className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 transition-colors group"
                                    >
                                        <Layers className="w-3.5 h-3.5 text-gray-300 group-hover:text-blue-400" />
                                        <span>{gear.brand} {gear.model}</span>
                                        <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 ml-auto group-hover:bg-blue-100 transition-colors">
                                            {gear.type === 'Accessory' ? 'Accesorio' : gear.type}
                                        </span>
                                    </Link>
                                ))}
                            </div>
                        </section>
                    )}


                    {instrument.websites && instrument.websites.length > 0 && (
                        <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                            {/* Primary Website Highlight */}
                            {instrument.websites.find((w: any) => w.isPrimary) && (
                                <section>
                                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Sitio Oficial</h4>
                                    <a
                                        href={(() => {
                                            const url = instrument.websites.find((w: any) => w.isPrimary).url;
                                            return url.startsWith('http') ? url : `https://${url}`;
                                        })()}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors group"
                                    >
                                        <Globe className="w-4 h-4 transition-transform group-hover:rotate-12" />
                                        Visitar sitio oficial
                                        <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </a>
                                </section>
                            )}

                            {/* Secondary Websites List */}
                            {instrument.websites.filter((w: any) => !w.isPrimary).length > 0 && (
                                <section>
                                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Enlaces Relacionados</h4>
                                    <div className="space-y-2">
                                        {instrument.websites.filter((w: any) => !w.isPrimary).map((ws: any, idx: number) => (
                                            <a
                                                key={idx}
                                                href={ws.url.startsWith('http') ? ws.url : `https://${ws.url}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-2 text-xs text-gray-500 hover:text-blue-600 transition-colors group"
                                            >
                                                <ChevronRight className="w-3 h-3 text-gray-300 group-hover:text-blue-400 transition-colors" />
                                                <span className="truncate max-w-[200px]">{ws.url.replace(/^https?:\/\//, '')}</span>
                                            </a>
                                        ))}
                                    </div>
                                </section>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Bottom: Technical Specs in Columns */}
            {Object.keys(groupedSpecs).length > 0 && (
                <div className="mt-24 md:mt-32 border-t border-gray-100 dark:border-gray-800 pt-16">
                    <h2 className="text-3xl font-semibold tracking-tight mb-16 dark:text-white">Especificaciones Técnicas</h2>

                    <div className="space-y-16">
                        {Object.entries(groupedSpecs).map(([category, items]) => (
                            <div key={category} className="grid grid-cols-1 md:grid-cols-4 gap-8">
                                <div className="md:col-span-1">
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white sticky top-24">{category}</h3>
                                </div>
                                <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-0">
                                    {items.map((item, idx) => (
                                        <SpecRow key={idx} label={item.label} value={item.value} />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Resources & Files moved to bottom */}
            {instrument.documents && instrument.documents.length > 0 && (
                <div className="mt-24 border-t border-gray-100 dark:border-gray-800 pt-16">
                    <h2 className="text-2xl font-semibold tracking-tight mb-8 dark:text-white">Recursos y Documentación</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {instrument.documents.map((doc: any, idx: number) => {
                            const isPdf = doc.type?.toLowerCase() === 'pdf' || doc.type?.toLowerCase() === 'manual' || doc.url?.toLowerCase().endsWith('.pdf');

                            const CardContent = (
                                <div className="flex items-center p-4 rounded-xl bg-gray-50 dark:bg-gray-900 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition group border border-gray-100 dark:border-gray-800 hover:border-blue-100 dark:hover:border-blue-800 h-full">
                                    <div className="p-3 bg-white dark:bg-gray-800 rounded-lg mr-4 shadow-sm text-blue-600 dark:text-blue-400">
                                        <FileText className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900 dark:text-gray-100 text-sm group-hover:text-blue-600 transition-colors">{doc.title}</p>
                                        <p className="text-xs text-gray-400 uppercase mt-0.5">{doc.type}</p>
                                    </div>
                                </div>
                            );

                            return isPdf ? (
                                <PdfPreviewModal key={idx} url={doc.url} title={doc.title}>
                                    {CardContent}
                                </PdfPreviewModal>
                            ) : (
                                <a key={idx} href={doc.url} target="_blank" className="block h-full">
                                    {CardContent}
                                </a>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* QR Code moved to very bottom */}
            <div className="mt-24 pt-16 border-t border-gray-100 dark:border-gray-800 flex justify-center">
                <div className="flex flex-col items-center gap-6">
                    <p className="text-sm font-medium text-gray-400 uppercase tracking-widest">Ficha Digital</p>
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 dark:bg-white/5">
                        <QRCodeGenerator url={`/instruments/${id}`} label={instrument.model} />
                    </div>
                </div>
            </div>
        </div>
    );
}
