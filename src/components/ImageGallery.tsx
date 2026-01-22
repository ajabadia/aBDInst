'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Maximize2, ChevronLeft, ChevronRight, Image as ImageIcon, Box } from 'lucide-react';
import HighResLightbox from './HighResLightbox';
import Instrument3DViewer from './Instrument3DViewer';
import { cn } from '@/lib/utils';

interface Thumbnail {
    label: string;
    src: string;
    placeholder?: string;
}

interface ImageGalleryProps {
    images?: string[];
    thumbnails?: Thumbnail[];
    altText?: string;
    defaultIndex?: number;
    modelUrl?: string; // High-res 3D model support
}

/**
 * Enhanced ImageGallery with zoom-on-hover, multi-angle thumbnails,
 * High-Resolution Lightbox, and 3D Model viewer integration.
 */
export default function ImageGallery({
    images = [],
    thumbnails = [],
    altText = 'Imagen',
    defaultIndex = 0,
    modelUrl
}: ImageGalleryProps) {
    const [viewMode, setViewMode] = useState<'2d' | '3d'>('2d');
    const [selectedIdx, setSelectedIdx] = useState(defaultIndex);
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);

    // Normalize data
    const normalizedThumbs: Thumbnail[] = thumbnails.length > 0
        ? thumbnails
        : images.map((img, i) => ({ label: `Imagen ${i + 1}`, src: img }));

    if (normalizedThumbs.length === 0 && !modelUrl) {
        return (
            <div className="aspect-square bg-gray-50 dark:bg-gray-800 rounded-3xl flex items-center justify-center text-gray-400 border border-gray-100 dark:border-gray-700">
                <span>Sin imagen</span>
            </div>
        );
    }

    const selected = normalizedThumbs[selectedIdx];

    const handlePrev = (e: React.MouseEvent) => {
        e.stopPropagation();
        setSelectedIdx((prev) => (prev - 1 + normalizedThumbs.length) % normalizedThumbs.length);
    };

    const handleNext = (e: React.MouseEvent) => {
        e.stopPropagation();
        setSelectedIdx((prev) => (prev + 1) % normalizedThumbs.length);
    };

    return (
        <div className="space-y-6">
            {/* View Mode Switcher (if 3D available) */}
            {modelUrl && (
                <div className="flex bg-gray-100 dark:bg-white/5 p-1 rounded-2xl w-fit mx-auto lg:mx-0">
                    <button
                        onClick={() => setViewMode('2d')}
                        className={cn(
                            "flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-bold transition-all",
                            viewMode === '2d' ? "bg-white dark:bg-zinc-800 shadow-sm text-ios-blue" : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
                        )}
                    >
                        <ImageIcon size={18} /> Galería
                    </button>
                    <button
                        onClick={() => setViewMode('3d')}
                        className={cn(
                            "flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-bold transition-all",
                            viewMode === '3d' ? "bg-white dark:bg-zinc-800 shadow-sm text-ios-blue" : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
                        )}
                    >
                        <Box size={18} /> Vista 3D
                    </button>
                </div>
            )}

            {viewMode === '2d' ? (
                <>
                    {/* Main Image Viewport */}
                    <div className="relative group aspect-square bg-white dark:bg-zinc-900 rounded-[2rem] overflow-hidden border border-gray-100 dark:border-gray-800 shadow-sm cursor-zoom-in">
                        <motion.div
                            className="w-full h-full p-4"
                            whileHover={{ scale: 1.05 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                            onClick={() => setIsLightboxOpen(true)}
                        >
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={selectedIdx}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="w-full h-full relative"
                                >
                                    <Image
                                        src={selected.src}
                                        alt={`${altText} - ${selected.label}`}
                                        fill
                                        className="object-contain"
                                        placeholder={selected.placeholder ? 'blur' : undefined}
                                        blurDataURL={selected.placeholder}
                                        priority={selectedIdx === 0}
                                    />
                                </motion.div>
                            </AnimatePresence>
                        </motion.div>

                        {/* Overlay Tools */}
                        <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <button
                                onClick={() => setIsLightboxOpen(true)}
                                className="bg-white/90 dark:bg-black/80 backdrop-blur-md p-3 rounded-2xl shadow-xl border border-white/20 hover:scale-110 transition-transform text-ios-blue"
                            >
                                <Maximize2 size={24} />
                            </button>
                        </div>

                        {/* Floating Navigation Controls */}
                        {normalizedThumbs.length > 1 && (
                            <>
                                <button
                                    onClick={handlePrev}
                                    className="absolute left-6 top-1/2 -translate-y-1/2 p-3 bg-white/80 dark:bg-black/50 backdrop-blur rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-white dark:hover:bg-black/70 hover:scale-110 shadow-lg text-gray-800 dark:text-white"
                                >
                                    <ChevronLeft size={24} />
                                </button>
                                <button
                                    onClick={handleNext}
                                    className="absolute right-6 top-1/2 -translate-y-1/2 p-3 bg-white/80 dark:bg-black/50 backdrop-blur rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-white dark:hover:bg-black/70 hover:scale-110 shadow-lg text-gray-800 dark:text-white"
                                >
                                    <ChevronRight size={24} />
                                </button>
                            </>
                        )}
                    </div>

                    {/* Thumbnail Bar */}
                    {normalizedThumbs.length > 1 && (
                        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide snap-x px-2 justify-center">
                            {normalizedThumbs.map((thumb, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setSelectedIdx(idx)}
                                    className={`snap-start relative flex-shrink-0 w-24 h-24 rounded-2xl overflow-hidden border-2 transition-all duration-300 ${idx === selectedIdx
                                            ? 'border-ios-blue shadow-lg scale-105'
                                            : 'border-transparent opacity-60 hover:opacity-100 hover:scale-105'
                                        }`}
                                >
                                    <Image
                                        src={thumb.src}
                                        alt={thumb.label}
                                        fill
                                        className="object-cover"
                                    />
                                    {idx === selectedIdx && (
                                        <div className="absolute inset-x-0 bottom-0 h-1 bg-ios-blue" />
                                    )}
                                </button>
                            ))}
                        </div>
                    )}
                </>
            ) : (
                <div className="animate-in fade-in zoom-in duration-500">
                    {modelUrl && (
                        <Instrument3DViewer
                            modelUrl={modelUrl}
                            alt={altText}
                            posterUrl={normalizedThumbs[0]?.src}
                        />
                    )}
                </div>
            )}

            {/* Immersive Lightbox */}
            <HighResLightbox
                open={isLightboxOpen}
                close={() => setIsLightboxOpen(false)}
                index={selectedIdx}
                slides={normalizedThumbs.map((t) => ({
                    src: t.src,
                    title: altText,
                    description: t.label,
                }))}
            />
        </div>
    );
}
