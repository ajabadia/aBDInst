'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Maximize2 } from 'lucide-react';

export default function PremiumGallery({ images, altText }: { images: string[], altText: string }) {
    const [selected, setSelected] = useState(0);

    if (!images?.length) return (
        <div className="aspect-square rounded-[2rem] bg-gray-50 dark:bg-gray-900 flex items-center justify-center border border-gray-100 dark:border-gray-800">
            <p className="text-gray-400 text-sm">Sin imagen disponible</p>
        </div>
    );

    return (
        <div className="space-y-8">
            {/* Contenedor Principal: Bordes muy redondeados y sombra sutil */}
            <div className="relative aspect-square bg-[#fbfbfb] dark:bg-[#0d0d0d] rounded-[2.5rem] overflow-hidden border border-gray-100 dark:border-gray-800 shadow-[0_20px_50px_rgba(0,0,0,0.02)] group">
                <Image
                    src={images[selected]}
                    alt={altText}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    priority
                    className="object-contain p-8 transition-transform duration-700 ease-out group-hover:scale-105"
                />

                {/* Botón de Zoom sutil */}
                <button className="absolute bottom-6 right-6 p-3 bg-white/80 dark:bg-black/50 backdrop-blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity border border-white/20">
                    <Maximize2 className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                </button>
            </div>

            {/* Miniaturas: Estilo "Apple Watch bands" */}
            <div className="flex justify-center gap-4 flex-wrap">
                {images.map((img, idx) => (
                    <button
                        key={idx}
                        onClick={() => setSelected(idx)}
                        className={`relative w-20 h-20 rounded-2xl overflow-hidden transition-all duration-300 ${selected === idx
                                ? 'ring-2 ring-blue-500 ring-offset-4 dark:ring-offset-gray-950 scale-110 shadow-lg'
                                : 'opacity-50 hover:opacity-100 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800'
                            }`}
                    >
                        <Image src={img} alt="Thumbnail" fill className="object-cover" />
                    </button>
                ))}
            </div>
        </div>
    );
}
