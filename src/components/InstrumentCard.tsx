'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, ChevronRight, Music } from 'lucide-react';
import { getBlurDataURL } from '@/lib/shimmer';
import WishlistButton from './WishlistButton';

import { cn } from '@/lib/utils';

export default function InstrumentCard({ inst, variant = 'grid' }: { inst: any, variant?: 'grid' | 'list' }) {
    if (!inst) return null;

    const isList = variant === 'list';

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            whileHover={{ y: -8, scale: 1.02 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className={cn("h-full", isList && "w-full")}
        >
            <div className="group block h-full relative">
                <div className={cn(
                    "absolute z-20 transition-opacity",
                    isList ? "top-3 right-3 opacity-0 group-hover:opacity-100" : "top-5 right-5 opacity-0 group-hover:opacity-100"
                )}>
                    <WishlistButton instrumentId={inst._id || inst.id} minimal />
                </div>

                <Link href={`/instruments/${inst._id}`} className="block h-full">
                    <div className={cn(
                        "apple-card relative h-full flex overflow-hidden group",
                        isList ? "flex-row items-center h-28" : "flex-col"
                    )}>

                        {/* AREA DE IMAGEN */}
                        <div className={cn(
                            "relative overflow-hidden bg-gray-50 dark:bg-black/20 shrink-0",
                            isList ? "aspect-square h-full rounded-l-[1.5rem] m-0" : "aspect-[4/3] m-3 rounded-[1.5rem]"
                        )}>
                            {inst.genericImages?.[0] ? (
                                <Image
                                    src={inst.genericImages[0]}
                                    alt={inst.model}
                                    fill
                                    sizes={isList ? "120px" : "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"}
                                    className={cn(
                                        "object-contain transition-transform duration-700 group-hover:scale-110",
                                        isList ? "p-2" : "p-6"
                                    )}
                                    placeholder="blur"
                                    blurDataURL={getBlurDataURL()}
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <Music className={cn(
                                        "text-gray-200 dark:text-gray-800",
                                        isList ? "w-8 h-8" : "w-12 h-12"
                                    )} />
                                </div>
                            )}

                            {/* Badge de Tipo (Sutil) - Sólo en Grid o muy pequeño en List */}
                            {!isList && (
                                <div className="absolute top-4 left-4">
                                    <span className="px-3 py-1 rounded-full bg-white/80 dark:bg-black/50 backdrop-blur-md text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 border border-white/20">
                                        {inst.type.replace('_', ' ')}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* INFO */}
                        <div className={cn(
                            "flex flex-col flex-grow",
                            isList ? "p-4 justify-center" : "p-6"
                        )}>
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-[10px] uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400 font-bold mb-1">
                                        {inst.brand}
                                    </p>
                                    <h3 className={cn(
                                        "font-semibold text-gray-900 dark:text-white tracking-tight leading-tight",
                                        isList ? "text-lg mb-0" : "text-xl mb-2"
                                    )}>
                                        {inst.model}
                                    </h3>
                                </div>
                                {isList && (
                                    <span className="hidden sm:inline-block px-2 py-1 rounded-full bg-gray-100 dark:bg-white/10 text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                        {inst.type.replace('_', ' ')}
                                    </span>
                                )}
                            </div>

                            {!isList && (
                                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-4 flex-grow italic">
                                    {inst.description || inst.variantLabel || inst.websites?.find((w: any) => w.isPrimary)?.url || ""}
                                </p>
                            )}

                            {/* FOOTER */}
                            <div className={cn(
                                "flex items-center justify-between",
                                isList ? "mt-1" : "pt-4 border-t border-gray-100 dark:border-white/5"
                            )}>
                                <div className="flex items-center gap-1.5 text-gray-400 dark:text-gray-500">
                                    <Calendar size={14} />
                                    <span className="text-xs font-medium">
                                        {inst.years && inst.years.length > 0 ? inst.years[0] : 'N/A'}
                                    </span>
                                </div>

                                {!isList && (
                                    <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400 text-sm font-semibold opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                                        Ver detalle
                                        <ChevronRight size={16} />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </Link>
            </div>
        </motion.div>
    );
}
