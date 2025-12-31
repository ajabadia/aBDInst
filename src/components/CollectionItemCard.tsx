// src/components/CollectionItemCard.tsx
import Image from 'next/image';
import Link from 'next/link';
import { Settings, ShieldAlert, Tag, ChevronRight } from 'lucide-react';

export default function CollectionItemCard({ item }: { item: any }) {
    const needsMaintenance = item.status === 'repair';

    return (
        <Link href={`/dashboard/collection/${item._id}`} className="group relative block">
            <div className="bg-white/40 dark:bg-white/5 backdrop-blur-md rounded-[2.5rem] border border-gray-200/50 dark:border-white/10 p-6 shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden">

                <div className="flex flex-col md:flex-row gap-8 items-center">
                    {/* IMAGEN MINIATURA */}
                    <div className="relative w-32 h-32 rounded-3xl bg-gray-50 dark:bg-black/20 overflow-hidden flex-shrink-0">
                        {item.instrumentId.genericImages?.[0] ? (
                            <Image
                                src={item.instrumentId.genericImages[0]}
                                alt={item.instrumentId.model}
                                fill
                                className="object-contain p-4 transition-transform group-hover:scale-110"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300">🎸</div>
                        )}
                    </div>

                    {/* INFORMACIÓN PRINCIPAL */}
                    <div className="flex-grow space-y-2 text-center md:text-left">
                        <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-2">
                            <span className={`px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${needsMaintenance ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                                }`}>
                                {item.status}
                            </span>
                            <span className="px-3 py-0.5 rounded-full bg-gray-100 dark:bg-white/10 text-gray-500 text-[10px] font-bold uppercase tracking-wider">
                                {item.condition}
                            </span>
                        </div>

                        <h3 className="text-2xl font-semibold text-gray-900 dark:text-white tracking-tight">
                            {item.instrumentId.brand} {item.instrumentId.model}
                        </h3>

                        <p className="text-sm font-mono text-gray-400">
                            S/N: {item.serialNumber || 'No registrado'}
                        </p>
                    </div>

                    {/* INDICADORES DE CONTROL (DERECHA) */}
                    <div className="flex flex-col items-center md:items-end gap-2 border-t md:border-t-0 md:border-l border-gray-100 dark:border-white/5 pt-4 md:pt-0 md:pl-8">
                        <div className="text-right">
                            <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">Valor de compra</p>
                            <p className="text-xl font-semibold text-gray-900 dark:text-white">
                                {item.acquisition?.price ? `${item.acquisition.price} €` : '--'}
                            </p>
                        </div>

                        <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-medium text-sm mt-2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                            Gestionar unidad <ChevronRight size={18} />
                        </div>
                    </div>
                </div>

                {/* ALERTA DE MANTENIMIENTO: Solo visible si hay problemas */}
                {needsMaintenance && (
                    <div className="absolute top-0 right-0 p-4">
                        <ShieldAlert className="text-red-500 animate-pulse" size={24} />
                    </div>
                )}
            </div>
        </Link>
    );
}
