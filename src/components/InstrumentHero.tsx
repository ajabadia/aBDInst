'use client';

import { Share2, Edit3, QrCode, Plus, Calendar, Zap, LayoutTemplate, Cable } from 'lucide-react';
import PremiumGallery from './PremiumGallery';
import QRCodeGenerator from './QRCodeGenerator';
import { useState, useTransition } from 'react';
import Link from 'next/link';
import { addToCollection } from '@/actions/collection';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';

interface InstrumentHeroProps {
    instrument: any;
    canEdit: boolean;
    isLoggedIn: boolean;
}

export default function InstrumentHero({ instrument, canEdit, isLoggedIn }: InstrumentHeroProps) {
    const [showQR, setShowQR] = useState(false);
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const handleAddToCollection = async () => {
        if (!isLoggedIn) {
            router.push('/api/auth/signin');
            return;
        }

        startTransition(async () => {
            const res = await addToCollection(instrument._id);
            if (res.success) {
                toast.success('Añadido a tu colección!');
                router.push('/dashboard');
                router.refresh();
            } else {
                toast.error('Error: ' + res.error);
            }
        });
    };

    return (
        <section className="relative pt-8 pb-16 bg-white dark:bg-gray-950">
            <div className="max-w-7xl mx-auto px-6">

                {/* TOP BAR: Breadcrumbs & Actions */}
                <div className="flex justify-between items-center mb-12">
                    <nav className="text-sm font-medium text-gray-400 dark:text-gray-500 overflow-hidden text-ellipsis whitespace-nowrap mr-4">
                        <Link href="/instruments" className="hover:text-gray-900 dark:hover:text-gray-100 cursor-pointer transition-colors">Catálogo</Link>
                        <span className="mx-2">/</span>
                        <span className="text-gray-900 dark:text-gray-100">{instrument.type}</span>
                    </nav>

                    <div className="flex gap-2 flex-shrink-0">
                        <button className="p-2.5 rounded-full border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 transition-all text-gray-600 dark:text-gray-400">
                            <Share2 className="w-5 h-5" />
                        </button>
                        {canEdit && (
                            <Link href={`/instruments/${instrument._id}/edit`} className="flex items-center gap-2 px-4 py-2.5 rounded-full border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 transition-all font-medium text-sm text-gray-900 dark:text-gray-100">
                                <Edit3 className="w-4 h-4" />
                                <span>Editar</span>
                            </Link>
                        )}
                    </div>
                </div>

                {/* MAIN GRID */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">

                    {/* LEFT: Premium Gallery (7/12) */}
                    <div className="lg:col-span-7">
                        <PremiumGallery images={instrument.genericImages || []} altText={instrument.model} />
                    </div>

                    {/* RIGHT: High-End Info (5/12) */}
                    <div className="lg:col-span-5 flex flex-col pt-4">
                        <div className="mb-10">
                            <div className="flex items-center gap-3 mb-6">
                                <span className="px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wider">
                                    {instrument.subtype || instrument.type}
                                </span>
                                {instrument.years?.[0] && (
                                    <span className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 text-sm font-medium">
                                        <Calendar className="w-4 h-4" />
                                        {instrument.years[0]}
                                    </span>
                                )}
                            </div>

                            <h2 className="text-2xl font-medium text-gray-500 dark:text-gray-400 mb-1 tracking-tight">
                                {instrument.brand}
                            </h2>
                            <h1 className="text-5xl font-semibold text-gray-900 dark:text-white tracking-tighter mb-6 leading-none">
                                {instrument.model}
                                {instrument.version && <span className="text-gray-300 dark:text-gray-600 ml-3 font-light text-4xl align-baseline">{instrument.version}</span>}
                            </h1>

                            <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed font-light">
                                {instrument.description}
                            </p>
                        </div>

                        {/* ACTION CARD */}
                        <div className="p-8 rounded-[2rem] bg-gray-50 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-800 shadow-sm backdrop-blur-sm">
                            <div className="flex flex-col gap-4">
                                <Button
                                    onClick={handleAddToCollection}
                                    isLoading={isPending}
                                    icon={Plus}
                                    className="w-full text-lg h-14 shadow-xl shadow-blue-500/20"
                                >
                                    {isPending ? 'Añadiendo...' : 'Añadir a mi colección'}
                                </Button>

                                <Button
                                    variant="secondary"
                                    onClick={() => setShowQR(!showQR)}
                                    icon={QrCode}
                                    className="w-full text-lg h-14 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 hover:bg-gray-50"
                                >
                                    Identificador de unidad
                                </Button>
                            </div>

                            {showQR && (
                                <div className="mt-8 animate-in fade-in zoom-in duration-300">
                                    <QRCodeGenerator
                                        url={`/instruments/${instrument._id}`}
                                        label={`${instrument.brand}-${instrument.model}`}
                                    />
                                </div>
                            )}
                        </div>

                        {/* SPECS PREVIEW (Iconos rápidos) */}
                        <div className="grid grid-cols-3 gap-4 mt-12 bg-white dark:bg-gray-950 rounded-2xl border border-gray-100 dark:border-gray-900 p-2">
                            <div className="flex flex-col items-center text-center p-4 group">
                                <div className="w-10 h-10 rounded-full bg-gray-50 dark:bg-gray-900 flex items-center justify-center mb-3 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 transition-colors">
                                    <Zap className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
                                </div>
                                <span className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">Tipo</span>
                                <span className="text-sm font-medium text-gray-900 dark:text-gray-200">{instrument.type}</span>
                            </div>
                            <div className="flex flex-col items-center text-center p-4 group border-l border-r border-gray-50 dark:border-gray-900">
                                <div className="w-10 h-10 rounded-full bg-gray-50 dark:bg-gray-900 flex items-center justify-center mb-3 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 transition-colors">
                                    <LayoutTemplate className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
                                </div>
                                <span className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">Subtipo</span>
                                <span className="text-sm font-medium text-gray-900 dark:text-gray-200">{instrument.subtype || '-'}</span>
                            </div>
                            <div className="flex flex-col items-center text-center p-4 group">
                                <div className="w-10 h-10 rounded-full bg-gray-50 dark:bg-gray-900 flex items-center justify-center mb-3 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 transition-colors">
                                    <Cable className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
                                </div>
                                <span className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">Conexión</span>
                                <span className="text-sm font-medium text-gray-900 dark:text-gray-200">Standard</span>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </section>
    );
}
