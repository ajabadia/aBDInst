'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Pause, ChevronRight, ChevronLeft, Music, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface KioskPlayerProps {
    showroom: any;
    onExit: () => void;
}

const DEFAULT_SLIDE_DURATION = 10000; // 10 seconds default

export default function KioskPlayer({ showroom, onExit }: KioskPlayerProps) {
    const [isPlaying, setIsPlaying] = useState(true);
    const [itemIndex, setItemIndex] = useState(0);
    const [slideIndex, setSlideIndex] = useState(0);
    const [progress, setProgress] = useState(0);

    const items = showroom.items || [];
    const currentItem = items[itemIndex];
    const slides = currentItem?.slides?.length > 0 ? currentItem.slides : [null]; // If no slides, treat as 1 slide (cover)

    const timerRef = useRef<NodeJS.Timeout>(null);
    const audioRef = useRef<HTMLAudioElement>(null);
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

    // --- Dynamic Duration & Audio ---
    const currentSlideData = slides[slideIndex];
    const [audioDuration, setAudioDuration] = useState<number | null>(null);

    useEffect(() => {
        setAudioDuration(null);
    }, [slideIndex, itemIndex]);

    const slideDuration = (currentSlideData?.syncAudioDuration && audioDuration)
        ? audioDuration * 1000
        : (currentSlideData?.duration || 10) * 1000;

    const slideAudio = currentSlideData?.audioUrl;

    const onAudioMetadata = (e: React.SyntheticEvent<HTMLAudioElement>) => {
        if (currentSlideData?.syncAudioDuration) {
            setAudioDuration(e.currentTarget.duration);
        }
    };

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = 0.5; // Default volume
            if (isPlaying && slideAudio) {
                const playPromise = audioRef.current.play();
                if (playPromise !== undefined) {
                    playPromise.catch(error => {
                        console.log("Audio autoplay prevented", error);
                    });
                }
            } else {
                audioRef.current.pause();
            }
        }
    }, [isPlaying, slideIndex, itemIndex, slideAudio]);

    // Used to reset audio when slide changes
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.currentTime = 0;
            if (isPlaying && slideAudio) audioRef.current.play().catch(() => { });
        }
    }, [slideIndex, itemIndex, slideAudio, isPlaying]);


    useEffect(() => {
        if (!isPlaying) return;

        const interval = 100; // Update progress every 100ms
        const step = (interval / slideDuration) * 100;

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
    }, [isPlaying, nextSlide, slideDuration]);

    // --- Helpers ---

    const togglePlay = () => setIsPlaying(!isPlaying);

    const itemType = currentItem?.itemType || 'instrument';
    const isMusic = itemType === 'music';
    const instrument = !isMusic ? (currentItem?.collectionId?.instrumentId) : null;
    const album = isMusic ? (currentItem?.collectionId?.albumId) : null;

    const title = isMusic ? album?.title : instrument?.model;
    const subtitle = isMusic ? album?.artist : instrument?.brand;
    const year = isMusic ? album?.year : instrument?.year;
    const badge = isMusic ? 'Música' : instrument?.type?.replace('_', ' ');

    // Fallback logic for legacy items (no slides array)
    const coverImage = isMusic
        ? album?.coverImage
        : (currentItem?.collectionId?.userImages?.[0]?.url || instrument?.genericImages?.[0]);

    const slideType = currentSlideData?.type || (slides.length === 1 && !currentSlideData ? 'image' : 'image');
    const slideUrl = currentSlideData?.url || coverImage;
    const slideText = currentSlideData?.text || currentItem?.placardText;

    if (!items.length) return <div className="text-white">Showroom vacío</div>;

    return (
        <div className="fixed inset-0 bg-black z-[100] text-white overflow-hidden">
            {/* Hidden Audio Player */}
            {slideAudio && (
                <audio
                    ref={audioRef}
                    src={slideAudio}
                    loop={false}
                    onLoadedMetadata={onAudioMetadata}
                />
            )}

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
                        <div className="flex-1 h-full relative rounded-[3rem] overflow-hidden shadow-2xl bg-black/20 border border-white/10 group">
                            {/* Type: Image */}
                            {slideType === 'image' && slideUrl && (
                                <motion.div
                                    className="w-full h-full"
                                    initial={{ scale: 1 }}
                                    animate={{ scale: 1.15 }}
                                    transition={{ duration: (slideDuration + 1000) / 1000, ease: "linear" }}
                                >
                                    <Image
                                        src={slideUrl}
                                        alt="Slide"
                                        fill
                                        className="object-cover"
                                        priority
                                    />
                                </motion.div>
                            )}

                            {/* Type: Text */}
                            {slideType === 'text' && (
                                <motion.div
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.3 }}
                                    className={cn(
                                        "w-full h-full flex items-center justify-center p-12 bg-zinc-900/80",
                                        currentSlideData?.style?.textAlign || 'text-center'
                                    )}
                                >
                                    <p className={cn(
                                        "leading-relaxed",
                                        currentSlideData?.style?.fontSize || 'text-3xl md:text-5xl',
                                        currentSlideData?.style?.fontWeight || 'font-normal',
                                        currentSlideData?.style?.fontFamily || 'font-serif',
                                        currentSlideData?.style?.textColor || 'text-gray-200'
                                    )}>
                                        "{slideText}"
                                    </p>
                                </motion.div>
                            )}

                            {/* Type: Poster (Combined) */}
                            {/* Type: Poster (Combined) */}
                            {slideType === 'poster' && (
                                <AnimatePresence mode="wait">
                                    <div className={cn(
                                        "w-full h-full relative bg-zinc-950 overflow-hidden",
                                        currentSlideData?.layout === 'split-v' && "grid grid-rows-2",
                                        (currentSlideData?.layout === 'split-h' || !currentSlideData?.layout) && "grid grid-cols-2"
                                    )}>
                                        {/* Layout: Split */}
                                        {(currentSlideData?.layout === 'split-v' || currentSlideData?.layout === 'split-h' || !currentSlideData?.layout) && (
                                            <>
                                                <div className="relative overflow-hidden">
                                                    <motion.div
                                                        key={`img-${itemIndex}-${slideIndex}`}
                                                        initial={{ scale: 1.1, opacity: 0 }}
                                                        animate={{ scale: 1, opacity: 1 }}
                                                        exit={{ scale: 0.95, opacity: 0 }}
                                                        transition={{ duration: 1.2, ease: "easeOut" }}
                                                        className="absolute inset-0"
                                                    >
                                                        <Image src={slideUrl || ''} alt="Poster" fill className="object-cover" />
                                                    </motion.div>
                                                </div>
                                                <div className={cn(
                                                    "flex items-center p-12 bg-white/5 backdrop-blur-sm",
                                                    currentSlideData?.style?.textAlign === 'text-left' ? 'justify-start' : 'justify-center border-l border-white/10'
                                                )}>
                                                    <motion.p
                                                        initial={{ opacity: 0, x: 20 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: 0.5 }}
                                                        className={cn(
                                                            "leading-relaxed",
                                                            currentSlideData?.style?.fontSize || 'text-2xl md:text-3xl',
                                                            currentSlideData?.style?.fontWeight || 'font-light',
                                                            currentSlideData?.style?.fontFamily || 'font-sans',
                                                            currentSlideData?.style?.textColor || 'text-gray-200',
                                                            currentSlideData?.style?.textAlign || 'text-center'
                                                        )}
                                                    >
                                                        {slideText}
                                                    </motion.p>
                                                </div>
                                            </>
                                        )}

                                        {/* Layout: Overlay */}
                                        {currentSlideData?.layout === 'overlay' && (
                                            <>
                                                <motion.div
                                                    key={`img-overlay-${itemIndex}-${slideIndex}`}
                                                    initial={{ scale: 1.05, opacity: 0 }}
                                                    animate={{ scale: 1, opacity: 1 }}
                                                    transition={{ duration: 1.5 }}
                                                    className="absolute inset-0"
                                                >
                                                    <Image src={slideUrl || ''} alt="Poster" fill className="object-cover" />
                                                </motion.div>
                                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center p-24">
                                                    <motion.div
                                                        initial={{ opacity: 0, y: 20 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: 0.8 }}
                                                        className={cn(
                                                            "p-12 bg-black/60 backdrop-blur-xl rounded-[3rem] border border-white/10 max-w-[80%] shadow-2xl",
                                                            currentSlideData?.style?.textAlign || 'text-center'
                                                        )}
                                                    >
                                                        <p className={cn(
                                                            "leading-relaxed",
                                                            currentSlideData?.style?.fontSize || 'text-4xl md:text-5xl',
                                                            currentSlideData?.style?.fontWeight || 'font-normal',
                                                            currentSlideData?.style?.fontFamily || 'font-serif',
                                                            currentSlideData?.style?.textColor || 'text-white'
                                                        )}>
                                                            {slideText}
                                                        </p>
                                                    </motion.div>
                                                </div>
                                            </>
                                        )}

                                        {/* Layout: Classic */}
                                        {currentSlideData?.layout === 'classic' && (
                                            <div className="w-full h-full bg-zinc-900 p-16 flex flex-col items-center justify-center space-y-12">
                                                <motion.div
                                                    initial={{ opacity: 0, scale: 0.9 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    className="relative w-3/4 aspect-video rounded-2xl overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] border-8 border-white/5"
                                                >
                                                    <Image src={slideUrl || ''} alt="Poster" fill className="object-cover" />
                                                </motion.div>
                                                <motion.div
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    transition={{ delay: 0.5 }}
                                                    className="max-w-[70%] text-center"
                                                >
                                                    <p className={cn(
                                                        "leading-relaxed",
                                                        currentSlideData?.style?.fontSize || 'text-3xl md:text-4xl',
                                                        currentSlideData?.style?.fontWeight || 'font-light',
                                                        currentSlideData?.style?.fontFamily || 'font-sans',
                                                        currentSlideData?.style?.textColor || 'text-gray-300'
                                                    )}>
                                                        {slideText}
                                                    </p>
                                                </motion.div>
                                            </div>
                                        )}
                                    </div>
                                </AnimatePresence>
                            )}

                            {/* Fallback for cover if no slides yet and no url */}
                            {!slideUrl && !slideText && (
                                <div className="w-full h-full flex items-center justify-center text-white/20">
                                    <Music size={100} />
                                </div>
                            )}

                            {/* Caption Overlay */}
                            {currentSlideData?.caption && (
                                <motion.div
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="absolute bottom-0 left-0 right-0 p-10 bg-gradient-to-t from-black/90 via-black/40 to-transparent"
                                >
                                    <p className="text-2xl font-medium text-gray-100 tracking-wide">{currentSlideData.caption}</p>
                                </motion.div>
                            )}
                        </div>

                        {/* Right: Context Info (Always visible for the item) */}
                        <motion.div
                            className="w-1/3 flex flex-col justify-center space-y-8"
                            initial={{ x: 50, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.5 }}
                        >
                            <div>
                                <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-400 mb-2">
                                    {subtitle}
                                </p>
                                <h1 className="text-5xl md:text-7xl font-bold leading-none tracking-tight mb-6">
                                    {title}
                                </h1>
                                <div className="h-1 w-20 bg-blue-500 rounded-full mb-6" />

                                {currentItem?.attribution && (
                                    <div className="mb-6 px-4 py-2 bg-ios-blue/20 border border-ios-blue/30 rounded-xl inline-block">
                                        <p className="text-xs font-bold text-ios-blue uppercase tracking-widest">
                                            {currentItem.attribution}
                                        </p>
                                    </div>
                                )}

                                <p className="text-xl text-gray-400 leading-relaxed font-light">
                                    {currentItem?.publicNote || (isMusic ? (album?.notes || album?.description) : instrument?.description)?.substring(0, 150) + "..."}
                                </p>
                            </div>

                            <div className="flex flex-wrap gap-4 pt-4">
                                {year && (
                                    <div className="px-4 py-2 bg-white/10 rounded-full border border-white/10 text-sm font-bold">
                                        {year}
                                    </div>
                                )}
                                <div className="px-4 py-2 bg-white/10 rounded-full border border-white/10 text-sm font-bold capitalize">
                                    {badge}
                                </div>
                            </div>

                            {/* Slide Counter Dots */}
                            {slides.length > 1 && (
                                <div className="flex gap-2 pt-8">
                                    {slides.map((_: any, idx: number) => (
                                        <div
                                            key={idx}
                                            className={`h-1.5 rounded-full transition-all duration-500 ${idx === slideIndex ? 'w-8 bg-blue-500' : 'w-2 bg-white/20'
                                                }`}
                                        />
                                    ))}
                                </div>
                            )}
                        </motion.div>
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
