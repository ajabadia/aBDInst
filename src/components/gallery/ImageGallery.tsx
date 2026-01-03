'use client';

import { useState } from 'react';
import { Image as ImageIcon, Star, Trash2 } from 'lucide-react';
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";

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

    const slides = images.map(img => ({ src: img.url }));

    return (
        <>
            <ResponsiveMasonry
                columnsCountBreakPoints={{ 350: 1, 750: 2, 900: 3, 1200: 4 }}
            >
                <Masonry gutter="16px">
                    {images.map((image, index) => (
                        <div key={image._id || index} className="relative group break-inside-avoid">
                            {/* Image container */}
                            <div
                                className="rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 cursor-zoom-in"
                                onClick={() => { setLightboxIndex(index); setLightboxOpen(true); }}
                            >
                                {/* Using regular img for auto-height masonry layout */}
                                <img
                                    src={image.url}
                                    alt={`Photo ${index + 1}`}
                                    className="w-full h-auto block transition-transform duration-500 group-hover:scale-105"
                                    loading="lazy"
                                />
                            </div>

                            {/* Primary Badge */}
                            {image.isPrimary && (
                                <div className="absolute top-2 left-2 px-2 py-1 bg-yellow-500 text-white text-xs font-bold rounded-lg flex items-center gap-1 shadow-sm z-10">
                                    <Star size={12} fill="white" />
                                    Principal
                                </div>
                            )}

                            {/* Actions Overlay */}
                            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                {!image.isPrimary && onSetPrimary && (
                                    <button
                                        onClick={(e) => { e.stopPropagation(); onSetPrimary(image._id!); }}
                                        className="p-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg shadow-sm hover:bg-yellow-50 dark:hover:bg-yellow-900/20 transition-colors"
                                        title="Marcar como principal"
                                    >
                                        <Star size={16} className="text-yellow-600" />
                                    </button>
                                )}
                                {onDelete && (
                                    <button
                                        onClick={(e) => { e.stopPropagation(); onDelete(image._id!); }}
                                        className="p-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg shadow-sm hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                        title="Eliminar"
                                    >
                                        <Trash2 size={16} className="text-red-600" />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </Masonry>
            </ResponsiveMasonry>

            <Lightbox
                open={lightboxOpen}
                close={() => setLightboxOpen(false)}
                index={lightboxIndex}
                slides={slides}
                controller={{ closeOnBackdropClick: true }}
            />
        </>
    );
}
