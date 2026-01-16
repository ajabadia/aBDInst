import type { Metadata } from 'next';
import { auth } from '@/auth';
import { getInstrumentById } from '@/actions/instrument';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import InstrumentHeaderButtons from '@/components/InstrumentHeaderButtons';
import ImageGallery from '@/components/ImageGallery';
import SpecRow from '@/components/SpecRow';
import PrintSpecSheet from '@/components/PrintSpecSheet';
import CommentSection from '@/components/comments/CommentSection';
import ValuationSection from '@/components/valuation/ValuationSection';
import PersonalInventoryManager from '@/components/inventory/PersonalInventoryManager';
import UserUnitDetails from '@/components/inventory/UserUnitDetails';
import ResourceSection from '@/components/resources/ResourceSection';
import QRCodeGenerator from '@/components/QRCodeGenerator';
import QrLabelGenerator from '@/components/QrLabelGenerator';
import PdfPreviewModal from '@/components/PdfPreviewModal';

import { getRelatedGear } from '@/actions/instrument';
import { getComments } from '@/actions/comments';
import { getResources } from '@/actions/resource';
import { ArrowLeft, FileText, Box, ChevronRight, Layers, Globe, ExternalLink, Star } from 'lucide-react';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { cn } from '@/lib/utils';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const { id } = await params;
    const instrument = await getInstrumentById(id);
    if (!instrument) return { title: 'Instrumento no encontrado' };

    const title = `${instrument.model} - ${instrument.brand}`;
    return {
        title: `${title} | Instrument Collector`,
        description: instrument.description?.substring(0, 160),
        openGraph: {
            title,
            images: instrument.genericImages?.[0] ? [{ url: instrument.genericImages[0] }] : [],
        },
    };
}

export default async function InstrumentDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const instrument = await getInstrumentById(id);
    if (!instrument) notFound();

    const relatedGear = await getRelatedGear(id);
    const session = await auth();
    const isLoggedIn = !!session?.user;
    const canEdit = isLoggedIn;

    const commentsData = await getComments(id);
    const comments = commentsData.success ? commentsData.data : [];
    const resources = await getResources({ instrumentId: id });

    let currentUserFull = null;
    let ownedItems: any[] = [];

    if (session?.user?.email) {
        await dbConnect();
        currentUserFull = await User.findOne({ email: session.user.email }).select('name image role isBanned').lean();
        if (currentUserFull) {
            currentUserFull = JSON.parse(JSON.stringify(currentUserFull));
            (currentUserFull as any).id = (currentUserFull as any)._id.toString();

            const UserCollection = (await import('@/models/UserCollection')).default;
            ownedItems = await UserCollection.find({
                userId: (currentUserFull as any)._id,
                instrumentId: id,
                deletedAt: null
            }).select('acquisition inventorySerial condition status images location').lean();
            ownedItems = JSON.parse(JSON.stringify(ownedItems));
        }
    }

    const groupedSpecs: Record<string, any[]> = {};
    if (instrument.specs && Array.isArray(instrument.specs)) {
        instrument.specs.forEach((s: any) => {
            if (!groupedSpecs[s.category]) groupedSpecs[s.category] = [];
            groupedSpecs[s.category].push(s);
        });
    }

    return (
        <div className="max-w-7xl mx-auto px-6 py-12 lg:py-24">

            {/* Navigation & Header */}
            <div className="mb-16">
                <Link href="/instruments" className="inline-flex items-center text-sm font-semibold text-ios-blue hover:underline mb-8 group">
                    <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
                    Catálogo Maestro
                </Link>

                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
                    <div className="space-y-2">
                        <p className="text-ios-blue font-bold text-sm uppercase tracking-[0.2em]">{instrument.brand}</p>
                        <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-gray-900 dark:text-white leading-[1.1]">
                            {instrument.model}
                        </h1>
                        <div className="flex items-center gap-3 text-xl text-gray-500 dark:text-gray-400 font-medium pt-2">
                            <span>{instrument.type}</span>
                            {instrument.subtype && (
                                <>
                                    <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-700" />
                                    <span>{instrument.subtype}</span>
                                </>
                            )}
                        </div>
                    </div>
                    <InstrumentHeaderButtons
                        instrumentId={instrument._id || instrument.id}
                        canEdit={canEdit}
                        isLoggedIn={isLoggedIn}
                    />
                </div>
            </div>

            <PrintSpecSheet instrument={instrument} />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">

                {/* Visuals Column */}
                <div className="lg:col-span-7">
                    <div className="sticky top-28">
                        <ImageGallery images={instrument.genericImages || []} altText={`${instrument.brand} ${instrument.model}`} />
                    </div>
                </div>

                {/* Information Column */}
                <div className="lg:col-span-5 space-y-12">

                    {/* Narrative Description */}
                    <section>
                        <h3 className="apple-label">Historia y Detalles</h3>
                        <p className="text-xl text-gray-700 dark:text-gray-300 leading-relaxed font-normal tracking-tight">
                            {instrument.description || 'Sin descripción disponible.'}
                        </p>
                    </section>

                    {/* Quick Metadata Panel */}
                    <div className="bg-gray-50 dark:bg-zinc-900 rounded-3xl p-8 space-y-8">
                        <div className="flex justify-between items-center">
                            <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">Ficha Técnica</h3>
                            <QrLabelGenerator
                                instrumentId={instrument._id || instrument.id}
                                brand={instrument.brand}
                                model={instrument.model}
                                year={instrument.specs?.find((s: any) => s.key.toLowerCase().includes('year'))?.value}
                                location={ownedItems[0]?.location}
                                serial={ownedItems[0]?.inventorySerial || ownedItems[0]?.serialNumber}
                            />
                        </div>
                    </div>

                    <div className="glass-panel rounded-3xl p-6 space-y-6">
                        {instrument.years && instrument.years.length > 0 && (
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-semibold text-gray-500">Periodo</span>
                                <span className="text-base font-bold text-gray-900 dark:text-white bg-black/5 dark:bg-white/10 px-3 py-1 rounded-lg">
                                    {instrument.years.join(', ')}
                                </span>
                            </div>
                        )}

                        {instrument.version && (
                            <div className="flex items-center justify-between border-t border-black/5 dark:border-white/5 pt-4">
                                <span className="text-sm font-semibold text-gray-500">Versión</span>
                                <span className="text-base font-bold text-gray-900 dark:text-white">{instrument.version}</span>
                            </div>
                        )}

                        {/* Variant Hierarchy (The Chain) */}
                        {(instrument._hierarchy?.length > 0 || instrument._variants?.length > 0) && (
                            <div className="border-t border-black/5 dark:border-white/5 pt-6 space-y-4">
                                <h4 className="apple-label text-blue-600 flex items-center gap-2">
                                    <Layers size={14} /> Árbol de Versiones
                                </h4>

                                <div className="space-y-3">
                                    {/* Parent Chain (Ancestors) */}
                                    {instrument._hierarchy?.map((parent: any, idx: number) => (
                                        <Link
                                            key={parent._id}
                                            href={`/instruments/${parent._id}`}
                                            className="flex items-center gap-3 p-3 rounded-xl bg-ios-blue/5 border border-ios-blue/10 hover:bg-ios-blue/10 transition-all group"
                                            style={{ marginLeft: `${(instrument._hierarchy.length - 1 - idx) * 12}px` }}
                                        >
                                            <div className="w-8 h-8 rounded-lg bg-white dark:bg-white/5 flex items-center justify-center shadow-sm text-ios-blue">
                                                <ArrowLeft size={16} />
                                            </div>
                                            <div>
                                                <p className="text-[9px] text-ios-blue font-bold uppercase tracking-widest leading-none mb-1">Evolución de</p>
                                                <p className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-ios-blue transition-colors">
                                                    {parent.brand} {parent.model} {parent.variantLabel ? `(${parent.variantLabel})` : ''}
                                                </p>
                                            </div>
                                        </Link>
                                    ))}

                                    {/* Current Instrument (Indicator) */}
                                    <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-100 dark:bg-white/10" style={{ marginLeft: `${instrument._hierarchy?.length * 12}px` }}>
                                        <div className="w-8 h-8 rounded-lg bg-white dark:bg-gray-800 flex items-center justify-center shadow-sm">
                                            <Star size={16} className="text-ios-blue fill-current" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest leading-none mb-1">Estás viendo</p>
                                            <p className="text-sm font-bold text-gray-900 dark:text-white">
                                                {instrument.model} {instrument.variantLabel ? `(${instrument.variantLabel})` : ''}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Direct Children (Variants) */}
                                    {instrument._variants?.map((variant: any) => (
                                        <Link
                                            key={variant._id}
                                            href={`/instruments/${variant._id}`}
                                            className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-black/20 border border-black/5 dark:border-white/5 hover:border-ios-blue/30 transition-all group"
                                            style={{ marginLeft: `${(instrument._hierarchy?.length + 1) * 12}px` }}
                                        >
                                            <div className="w-8 h-8 rounded-lg bg-gray-50 dark:bg-gray-700 flex items-center justify-center shadow-sm text-gray-400 group-hover:text-ios-blue transition-colors">
                                                <ChevronRight size={16} />
                                            </div>
                                            <div>
                                                <p className="text-[9px] text-gray-400 group-hover:text-ios-blue font-bold uppercase tracking-widest leading-none mb-1 transition-colors">Variante / Revisión</p>
                                                <p className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-ios-blue transition-colors">
                                                    {variant.variantLabel || `${variant.brand} ${variant.model}`}
                                                </p>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}

                        {instrument.relatedTo && (Array.isArray(instrument.relatedTo) ? instrument.relatedTo : [instrument.relatedTo]).filter(Boolean).map((rel: any, idx: number) => (
                            <div key={rel._id || idx} className={cn("border-t border-black/5 dark:border-white/5 pt-4", idx > 0 && "mt-2 pt-2")}>
                                <Link
                                    href={`/instruments/${rel.id || rel._id || rel}`}
                                    className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-black/5 hover:bg-black/5 transition-all group"
                                >
                                    <div className="w-10 h-10 rounded-xl bg-white dark:bg-white/5 flex items-center justify-center shadow-sm text-gray-400">
                                        <Box size={20} />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest leading-none mb-1.5">Vinculado con</p>
                                        <p className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-ios-blue transition-colors">
                                            {rel.brand} {rel.model} {rel.variantLabel ? `(${rel.variantLabel})` : ''}
                                        </p>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </div>
                        ))}
                    </div>

                    {/* Secondary Info: Accessories & Websites */}
                    <div className="space-y-8">
                        {relatedGear && relatedGear.length > 0 && (
                            <section>
                                <h4 className="apple-label">Accesorios</h4>
                                <div className="grid gap-3">
                                    {relatedGear.map((gear: any) => (
                                        <Link key={gear._id} href={`/instruments/${gear._id}`} className="apple-card p-4 flex items-center gap-3 hover:border-ios-blue/30 group">
                                            <Layers className="w-4 h-4 text-gray-400 group-hover:text-ios-blue transition-colors" />
                                            <span className="text-sm font-semibold">{gear.brand} {gear.model}</span>
                                            <span className="ml-auto text-[10px] font-bold px-2 py-1 bg-black/5 dark:bg-white/5 rounded-lg text-gray-500 uppercase tracking-widest">
                                                {gear.type}
                                            </span>
                                        </Link>
                                    ))}
                                </div>
                            </section>
                        )}

                        {instrument.websites && instrument.websites.length > 0 && (
                            <section className="space-y-4">
                                <h4 className="apple-label">Enlaces</h4>
                                <div className="flex flex-wrap gap-3">
                                    {instrument.websites.map((ws: any, idx: number) => (
                                        <a key={idx} href={ws.url.startsWith('http') ? ws.url : `https://${ws.url}`} target="_blank" rel="noopener noreferrer"
                                            className={cn(
                                                "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all",
                                                ws.isPrimary
                                                    ? "bg-ios-blue text-white shadow-md shadow-ios-blue/20 hover:bg-ios-blue/90"
                                                    : "bg-black/5 dark:bg-white/5 text-gray-600 dark:text-gray-300 hover:bg-black/10 dark:hover:bg-white/10"
                                            )}>
                                            <Globe size={14} />
                                            {ws.isPrimary ? "Sitio Oficial" : ws.url.replace(/^https?:\/\/(www\.)?/, '').split('/')[0]}
                                            <ExternalLink size={10} className="opacity-50" />
                                        </a>
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>
                </div>
            </div>

            {/* Bottom Sections: Technical Content */}
            <div className="mt-32 space-y-32">

                {/* Technical Specifications */}
                {Object.keys(groupedSpecs).length > 0 && (
                    <section>
                        <div className="flex items-center gap-4 mb-16">
                            <h2 className="text-4xl font-bold tracking-tight">Especificaciones</h2>
                            <div className="h-[2px] flex-1 bg-black/5 dark:bg-white/5 rounded-full" />
                        </div>

                        <div className="grid grid-cols-1 gap-20">
                            {Object.entries(groupedSpecs).map(([category, items]) => (
                                <div key={category} className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                                    <div className="lg:col-span-1">
                                        <h3 className="text-xl font-bold text-ios-blue sticky top-32">{category}</h3>
                                    </div>
                                    <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-x-16 gap-y-2">
                                        {items.map((item, idx) => (
                                            <SpecRow key={idx} label={item.label} value={item.value} />
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Resources & Files */}
                {(resources.length > 0 || instrument.documents?.length > 0) && (
                    <section>
                        <div className="flex items-center gap-4 mb-16">
                            <h2 className="text-4xl font-bold tracking-tight">Documentación</h2>
                            <div className="h-[2px] flex-1 bg-black/5 dark:bg-white/5 rounded-full" />
                        </div>
                        {resources.length > 0 ? (
                            <ResourceSection resources={resources} canEdit={false} />
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {instrument.documents?.map((doc: any, idx: number) => {
                                    const isPdf = doc.type?.toLowerCase() === 'pdf' || doc.url?.toLowerCase().endsWith('.pdf');
                                    const Content = (
                                        <div className="apple-card p-6 flex items-center gap-4 group cursor-pointer h-full">
                                            <div className="w-12 h-12 rounded-2xl bg-ios-blue/10 flex items-center justify-center text-ios-blue group-hover:bg-ios-blue group-hover:text-white transition-all duration-300">
                                                <FileText size={24} />
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-bold text-gray-900 dark:text-white leading-tight mb-1">{doc.title}</p>
                                                <p className="text-[10px] font-bold uppercase tracking-widest text-ios-blue">{doc.type || 'Archivo'}</p>
                                            </div>
                                        </div>
                                    );
                                    return isPdf
                                        ? <PdfPreviewModal key={idx} url={doc.url} title={doc.title}>{Content}</PdfPreviewModal>
                                        : <a key={idx} href={doc.url} target="_blank" rel="noopener noreferrer">{Content}</a>;
                                })}
                            </div>
                        )}
                    </section>
                )}

                {/* Market & Inventory */}
                <section>
                    {ownedItems.length > 0 ? (
                        <div className="space-y-16">
                            <div className="flex items-center gap-4 mb-16">
                                <h2 className="text-4xl font-bold tracking-tight">Mi Colección</h2>
                                <div className="h-[2px] flex-1 bg-black/5 dark:bg-white/5 rounded-full" />
                            </div>
                            <PersonalInventoryManager items={ownedItems}>
                                {ownedItems.map((unit: any) => (
                                    <UserUnitDetails key={unit._id} unit={unit} instrument={instrument} canEdit={canEdit} />
                                ))}
                            </PersonalInventoryManager>
                        </div>
                    ) : (
                        (instrument.marketValue || canEdit) && (
                            <ValuationSection instrument={instrument} canEdit={canEdit} />
                        )
                    )}
                </section>

                {/* Community */}
                <CommentSection instrumentId={id} comments={comments} currentUser={currentUserFull} />

                {/* Digital Sheet / QR Footer */}
                <footer className="pt-32 pb-16 flex flex-col items-center gap-8 border-t border-black/5 dark:border-white/5">
                    <div className="text-center space-y-2">
                        <p className="apple-label text-center m-0">Ficha Técnica Digital</p>
                        <p className="text-sm text-gray-500">Accede a esta ficha desde cualquier dispositivo</p>
                    </div>
                    <div className="apple-card p-6 bg-white dark:bg-white/5">
                        <QRCodeGenerator url={`/instruments/${id}`} label={instrument.model} />
                    </div>
                </footer>
            </div>
        </div >
    );
}
