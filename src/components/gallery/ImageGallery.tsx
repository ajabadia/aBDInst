'use client';

import { useState } from 'react';
import { Image as ImageIcon, Star, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import Image from 'next/image';

interface ImageGalleryProps {
    images: Array<{
        url: string;
        provider: string;
        type?: string;
        isPrimary?: boolean;
        _id?: string;
    }>;
    collectionId: string;
    onDelete?: (imageId: string) => void;
    onSetPrimary?: (imageId: string) => void;
}

export default function ImageGallery({ images, collectionId, onDelete, onSetPrimary }: ImageGalleryProps) {
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState(0);

    if (!images || images.length === 0) {
        return (
            <div className="text-center py-12 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-800">
                <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
                    <ImageIcon className="text-gray-400" size={32} />
                </div>
                <p className="text-gray-500 font-medium">No hay fotos aún</p>
                <p className="text-sm text-gray-400 mt-1">Sube tus primeras fotos de este instrumento</p>
            </div>
        );
    }

    const openLightbox = (index: number) => {
        setLightboxIndex(index);
        setLightboxOpen(true);
    };

    const nextImage = () => {
        setLightboxIndex((prev) => (prev + 1) % images.length);
    };

    const prevImage = () => {
        setLightboxIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    return (
        <>
            {/* Gallery Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {images.map((image, index) => (
                    <div key={image._id || index} className="relative group">
                        {/* Image */}
                        <div
                            className="aspect-square rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800 cursor-pointer"
                            onClick={() => openLightbox(index)}
                        >
                            <Image
                                src={image.url}
                                alt={`Photo ${index + 1}`}
                                width={300}
                                height={300}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                        </div>

                        {/* Primary Badge */}
                        {image.isPrimary && (
                            <div className="absolute top-2 left-2 px-2 py-1 bg-yellow-500 text-white text-xs font-bold rounded-lg flex items-center gap-1">
                                <Star size={12} fill="white" />
                                Principal
                            </div>
                        )}

                        {/* Actions */}
                        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {!image.isPrimary && onSetPrimary && (
                                <button
                                    onClick={() => onSetPrimary(image._id!)}
                                    className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:bg-yellow-50 dark:hover:bg-yellow-900/20 transition-colors"
                                    title="Marcar como principal"
                                >
                                    <Star size={16} className="text-yellow-600" />
                                </button>
                            )}
                            {onDelete && (
                                <button
                                    onClick={() => onDelete(image._id!)}
                                    className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                    title="Eliminar"
                                >
                                    <Trash2 size={16} className="text-red-600" />
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Lightbox */}
            {lightboxOpen && (
                <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4">
                    {/* Close Button */}
                    <button
                        onClick={() => setLightboxOpen(false)}
                        className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors"
                    >
                        <X size={24} className="text-white" />
                    </button>

                    {/* Navigation */}
                    {images.length > 1 && (
                        <>
                            <button
                                onClick={prevImage}
                                className="absolute left-4 p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors"
                            >
                                <span className="text-white text-2xl">←</span>
                            </button>
                            <button
                                onClick={nextImage}
                                className="absolute right-4 p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors"
                            >
                                <span className="text-white text-2xl">→</span>
                            </button>
                        </>
                    )}

                    {/* Image */}
                    <div className="max-w-6xl max-h-[90vh] relative">
                        <Image
                            src={images[lightboxIndex].url}
                            alt={`Photo ${lightboxIndex + 1}`}
                            width={1200}
                            height={1200}
                            className="max-w-full max-h-[90vh] object-contain"
                        />

                        {/* Counter */}
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-xl">
                            <span className="text-white font-medium">
                                {lightboxIndex + 1} / {images.length}
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
