'use client';
import { useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

export default function MarketGallery({ images, title }: { images: string[], title: string }) {
    const [selected, setSelected] = useState(0);

    if (!images || images.length === 0) return (
        <div className="aspect-square bg-gray-100 rounded-3xl flex items-center justify-center text-gray-400">
            Sin Imágenes
        </div>
    );

    return (
        <div className="space-y-4">
            <div className="aspect-square relative rounded-3xl overflow-hidden bg-gray-100 border border-black/5 dark:border-white/5">
                <Image
                    src={images[selected]}
                    fill
                    alt={title}
                    className="object-contain p-4"
                    priority
                />
            </div>

            {images.length > 1 && (
                <div className="flex gap-4 overflow-x-auto pb-2">
                    {images.map((img, idx) => (
                        <button
                            key={idx}
                            onClick={() => setSelected(idx)}
                            className={cn(
                                "relative w-20 h-20 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0",
                                selected === idx ? "border-ios-blue opacity-100" : "border-transparent opacity-60 hover:opacity-100"
                            )}
                        >
                            <Image src={img} fill alt={`View ${idx}`} className="object-cover" />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
