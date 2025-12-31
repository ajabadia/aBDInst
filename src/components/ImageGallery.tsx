'use client';

import { useState, useEffect } from 'react';

interface ImageGalleryProps {
    images: string[];
    altText: string;
}

export default function ImageGallery({ images, altText }: ImageGalleryProps) {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [isModalOpen, setIsModalOpen] = useState(false);

    if (!images || images.length === 0) {
        return (
            <div className="aspect-square bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center text-gray-500">
                <span>Sin imagen</span>
            </div>
        );
    }

    const openModal = (index: number) => {
        setSelectedIndex(index);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    const nextImage = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        setSelectedIndex((prev) => (prev + 1) % images.length);
    };

    const prevImage = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        setSelectedIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!isModalOpen) return;
        if (e.key === 'Escape') closeModal();
        if (e.key === 'ArrowRight') nextImage();
        if (e.key === 'ArrowLeft') prevImage();
    };

    return (
        <div className="space-y-4">
            {/* Main Image */}
            <div
                className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden flex items-center justify-center relative group cursor-pointer"
                onClick={() => openModal(selectedIndex)}
            >
                <img
                    src={images[selectedIndex]}
                    alt={`${altText} - View ${selectedIndex + 1}`}
                    className="w-full h-full object-contain"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition flex items-center justify-center">
                    <span className="opacity-0 group-hover:opacity-100 bg-black/50 text-white px-3 py-1 rounded-full text-sm transition pointer-events-none">
                        Ver Pantalla Completa
                    </span>
                </div>
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600">
                    {images.map((img, idx) => (
                        <button
                            key={idx}
                            type="button"
                            onClick={() => setSelectedIndex(idx)}
                            className={`flex-shrink-0 w-20 h-20 rounded-md overflow-hidden border-2 transition ${idx === selectedIndex
                                    ? 'border-blue-500 ring-2 ring-blue-500/20'
                                    : 'border-transparent hover:border-gray-300 dark:hover:border-gray-600'
                                }`}
                        >
                            <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                        </button>
                    ))}
                </div>
            )}

            {/* Modal / Lightbox */}
            {isModalOpen && (
                <div
                    className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 backdrop-blur-sm"
                    onClick={closeModal}
                    tabIndex={0}
                    autoFocus
                    onKeyDown={handleKeyDown}
                >
                    <button
                        onClick={closeModal}
                        className="absolute top-4 right-4 text-white/70 hover:text-white p-2"
                    >
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>

                    {images.length > 1 && (
                        <>
                            <button
                                onClick={prevImage}
                                className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white p-2 bg-black/20 hover:bg-black/40 rounded-full transition"
                            >
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                            </button>
                            <button
                                onClick={nextImage}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white p-2 bg-black/20 hover:bg-black/40 rounded-full transition"
                            >
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                            </button>
                        </>
                    )}

                    <div className="max-w-full max-h-full relative" onClick={e => e.stopPropagation()}>
                        <img
                            src={images[selectedIndex]}
                            alt={`${altText} - Full View`}
                            className="max-w-full max-h-[90vh] object-contain rounded shadow-2xl"
                        />
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                            {selectedIndex + 1} / {images.length}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
