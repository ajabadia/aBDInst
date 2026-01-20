'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Pause, ChevronRight, ChevronLeft, Music, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface KioskPlayerProps {
    showroom: any;
    onExit: () => void;
}

const SLIDE_DURATION = 10000; // 10 seconds per slide

export default function KioskPlayer({ showroom, onExit }: KioskPlayerProps) {
    const [isPlaying, setIsPlaying] = useState(true);
    const [itemIndex, setItemIndex] = useState(0);
    const [slideIndex, setSlideIndex] = useState(0);
    const [progress, setProgress] = useState(0);

    const items = showroom.items || [];
    const currentItem = items[itemIndex];
    const slides = currentItem?.slides?.length > 0 ? currentItem.slides : [null]; // If no slides, treat as 1 slide (cover)

    const timerRef = useRef<NodeJS.Timeout>(null);
    const startTimeRef = useRef<number>(0);

    // --- Navigation Logic ---

    const nextSlide = useCallback(() => {
        setSlideIndex(prev => {
            // If more slides in this item, go to next
            if (prev + 1 < slides.length) {
                return prev + 1;
            }
            // If end of slides, go to next item
            setItemIndex(prevItem => (prevItem + 1) % items.length);
            return 0; // Reset slide index for next item
        });
        setProgress(0);
    }, [items.length, slides.length]);

    const prevSlide = useCallback(() => {
        setSlideIndex(prev => {
            if (prev > 0) return prev - 1;
            // Go to previous item's last slide
            const newIndex = (itemIndex - 1 + items.length) % items.length;
            setItemIndex(newIndex);
            const prevItemSlides = items[newIndex].slides;
            return prevItemSlides?.length > 0 ? prevItemSlides.length - 1 : 0;
        });
        setProgress(0);
    }, [itemIndex, items, slides.length]); // Added items dependency

    // --- Auto-Play Loop ---

    useEffect(() => {
        if (!isPlaying) return;

        const interval = 100; // Update progress every 100ms
        const step = (interval / SLIDE_DURATION) * 100;

        const timer = setInterval(() => {
            setProgress(p => {
                if (p >= 100) {
                    nextSlide();
                    return 0;
                }
                return p + step;
            });
        }, interval);

        return () => clearInterval(timer);
    }, [isPlaying, nextSlide]);

    // --- Helpers ---

    const togglePlay = () => setIsPlaying(!isPlaying);

    const currentSlideData = slides[slideIndex];
    // Fallback logic for legacy items (no slides array)
    const instrument = currentItem?.collectionId?.instrumentId;
    const coverImage = currentItem?.collectionId?.userImages?.[0]?.url || instrument?.genericImages?.[0];

    const slideType = currentSlideData?.type || 'image';
    const slideUrl = currentSlideData?.url || coverImage;
    const slideText = currentSlideData?.text || currentItem?.placardText;

    if (!items.length) return <div className="text-white">Showroom vacío</div>;

    return (
        <div className="fixed inset-0 bg-black z-[100] text-white overflow-hidden">
            {/* Background Layer (Blur) */}
            <div className="absolute inset-0 z-0">
                {slideUrl && (
                    <Image
                        src={slideUrl}
                        alt="bg"
                        fill
                        className="object-cover opacity-30 blur-3xl scale-110"
                    />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
            </div>

            {/* Main Content Area */}
            <div className="relative z-10 w-full h-full flex items-center justify-center p-12 md:p-24">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={`${itemIndex}-${slideIndex}`}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.05 }}
                        transition={{ duration: 0.8, ease: "easeInOut" }}
                        className="w-full h-full flex flex-row gap-12 items-center"
                    >
                        {/* Left: Media */}
                        <div className="flex-1 h-full relative rounded-[3rem] overflow-hidden shadow-2xl bg-black/20 border border-white/10">
                            {slideType === 'image' && slideUrl ? (
                                <Image
                                    src={slideUrl}
                                    alt="Slide"
                                    fill
                                    className="object-cover"
                                    priority
                                />
                            ) : slideType === 'text' ? (
                                <div className="w-full h-full flex items-center justify-center p-12 text-center bg-zinc-900/80">
                                    <p className="text-3xl md:text-5xl font-serif italic leading-relaxed text-gray-200">
                                        "{slideText}"
                                    </p>
                                </div>
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-white/20">
                                    <Music size={100} />
                                </div>
                            )}

                            {/* Caption Overlay */}
                            {currentSlideData?.caption && (
                                <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/90 to-transparent">
                                    <p className="text-xl font-medium text-gray-200">{currentSlideData.caption}</p>
                                </div>
                            )}
                        </div>

                        {/* Right: Context Info (Always visible for the item) */}
                        <div className="w-1/3 flex flex-col justify-center space-y-8">
                            <div>
                                <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-400 mb-2">
                                    {instrument?.brand}
                                </p>
                                <h1 className="text-5xl md:text-7xl font-bold leading-none tracking-tight mb-6">
                                    {instrument?.model}
                                </h1>
                                <div className="h-1 w-20 bg-blue-500 rounded-full mb-6" />

                                <p className="text-xl text-gray-400 leading-relaxed font-light">
                                    {currentItem?.publicNote || instrument?.description?.substring(0, 150) + "..."}
                                </p>
                            </div>

                            <div className="flex flex-wrap gap-4 pt-4">
                                {instrument?.year && (
                                    <div className="px-4 py-2 bg-white/10 rounded-full border border-white/10 text-sm font-bold">
                                        {instrument.year}
                                    </div>
                                )}
                                <div className="px-4 py-2 bg-white/10 rounded-full border border-white/10 text-sm font-bold capitalize">
                                    {instrument?.type?.replace('_', ' ')}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Progress Bar */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-white/10 z-50">
                <motion.div
                    className="h-full bg-blue-500"
                    style={{ width: `${progress}%` }}
                    transition={{ duration: 0.1, ease: "linear" }}
                />
            </div>

            {/* Controls Overlay */}
            <div className="absolute bottom-8 left-0 right-0 flex justify-between items-center px-12 z-50">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-sm font-bold text-gray-400 uppercase tracking-widest">
                        <span>{itemIndex + 1} / {items.length}</span>
                        <span className="opacity-50">•</span>
                        <span>{showroom.name}</span>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <button onClick={prevSlide} className="p-4 rounded-full bg-white/10 hover:bg-white/20 transition-colors backdrop-blur-md">
                        <ChevronLeft size={24} />
                    </button>
                    <button onClick={togglePlay} className="p-6 rounded-full bg-white text-black hover:scale-105 transition-transform shadow-xl">
                        {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}
                    </button>
                    <button onClick={nextSlide} className="p-4 rounded-full bg-white/10 hover:bg-white/20 transition-colors backdrop-blur-md">
                        <ChevronRight size={24} />
                    </button>
                </div>

                <div className="flex items-center gap-4">
                    <Button variant="ghost" className="text-white hover:bg-white/10" icon={X} onClick={onExit}>
                        Salir del Modo Kiosco
                    </Button>
                </div>
            </div>
        </div>
    );
}
