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
import { FileText, ArrowLeft, Edit2 } from 'lucide-react';

export default async function InstrumentDetailPage({ params }: { params: { id: string } }) {
    const { id } = await params;
    const instrument = await getInstrumentById(id);
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
                        {instrument.documents.map((doc: any, idx: number) => (
                            <a
                                key={idx}
                                href={doc.url}
                                target="_blank"
                                className="flex items-center p-4 rounded-xl bg-gray-50 dark:bg-gray-900 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition group border border-gray-100 dark:border-gray-800 hover:border-blue-100 dark:hover:border-blue-800"
                            >
                                <div className="p-3 bg-white dark:bg-gray-800 rounded-lg mr-4 shadow-sm text-blue-600 dark:text-blue-400">
                                    <FileText className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900 dark:text-gray-100 text-sm group-hover:text-blue-600 transition-colors">{doc.title}</p>
                                    <p className="text-xs text-gray-400 uppercase mt-0.5">{doc.type}</p>
                                </div>
                            </a>
                        ))}
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
