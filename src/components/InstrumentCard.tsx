'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, ChevronRight, Music } from 'lucide-react';
import { getBlurDataURL } from '@/lib/shimmer';

export default function InstrumentCard({ inst }: { inst: any }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="h-full"
        >
            <Link href={`/instruments/${inst._id}`} className="group block h-full">
                <div className="relative h-full flex flex-col bg-white/40 dark:bg-white/5 backdrop-blur-md rounded-[2rem] border border-gray-200/50 dark:border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] transition-all duration-500 hover:-translate-y-2 overflow-hidden">

                    {/* AREA DE IMAGEN: Fondo neutro para que el objeto "flote" */}
                    <div className="relative aspect-[4/3] m-3 overflow-hidden rounded-[1.5rem] bg-gray-50 dark:bg-black/20">
                        {inst.genericImages?.[0] ? (
                            <Image
                                src={inst.genericImages[0]}
                                alt={inst.model}
                                fill
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                className="object-contain p-6 transition-transform duration-700 group-hover:scale-110"
                                placeholder="blur"
                                blurDataURL={getBlurDataURL()}
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <Music className="w-12 h-12 text-gray-200 dark:text-gray-800" />
                            </div>
                        )}

                        {/* Badge de Tipo (Sutil) */}
                        <div className="absolute top-4 left-4">
                            <span className="px-3 py-1 rounded-full bg-white/80 dark:bg-black/50 backdrop-blur-md text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 border border-white/20">
                                {inst.type.replace('_', ' ')}
                            </span>
                        </div>
                    </div>

                    {/* INFO: Tipografía cuidada */}
                    <div className="p-6 flex flex-col flex-grow">
                        <p className="text-[10px] uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400 font-bold mb-1">
                            {inst.brand}
                        </p>

                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white tracking-tight leading-tight mb-2">
                            {inst.model}
                        </h3>

                        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-4 flex-grow">
                            {inst.description || "Sin descripción disponible."}
                        </p>

                        {/* FOOTER DE LA TARJETA */}
                        <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-white/5">
                            <div className="flex items-center gap-1.5 text-gray-400 dark:text-gray-500">
                                <Calendar size={14} />
                                <span className="text-xs font-medium">
                                    {inst.years && inst.years.length > 0 ? inst.years[0] : 'N/A'}
                                </span>
                            </div>

                            <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400 text-sm font-semibold opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                                Ver detalle
                                <ChevronRight size={16} />
                            </div>
                        </div>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
}
