'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Maximize2, Minimize2, ChevronLeft, ChevronRight, Play, Pause, X } from 'lucide-react';

interface KioskClientProps {
    showroom: any;
}

export default function KioskClient({ showroom }: KioskClientProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(true);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [hideControls, setHideControls] = useState(false);

    const items = showroom.items || [];
    const currentItem = items[currentIndex];

    // Helper to get actual data since it's nested in collectionId
    const collectionData = currentItem?.collectionId || {};
    const instrument = collectionData.instrumentId || {};

    // Aggregate Images (User images + Generic images)
    const allImages = [
        ...(collectionData.userImages?.map((img: any) => img.url) || []),
        ...(instrument.genericImages || [])
    ].filter(Boolean);

    // If no images at all, use a placeholder or empty string
    const displayImages = allImages.length > 0 ? allImages : [''];

    // Local state for image cycling within the same item
    const [imageIndex, setImageIndex] = useState(0);

    // Reset image index when item changes
    useEffect(() => {
        setImageIndex(0);
    }, [currentIndex]);

    // Auto-advance
    useEffect(() => {
        if (!isPlaying) return;
        const interval = setInterval(() => {
            nextSlide();
        }, 8000); // 8 seconds per slide
        return () => clearInterval(interval);
    }, [isPlaying, currentIndex]);

    // Internal Image Cycler (Optional: distinct timer or effect)
    useEffect(() => {
        if (displayImages.length <= 1) return;
        const imgInterval = setInterval(() => {
            setImageIndex(prev => (prev + 1) % displayImages.length);
        }, 5000); // Change image every 5s
        return () => clearInterval(imgInterval);
    }, [displayImages.length, currentIndex]);

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowRight') nextSlide();
            if (e.key === 'ArrowLeft') prevSlide();
            if (e.key === ' ') setIsPlaying(!isPlaying);
            if (e.key === 'Escape') {
                if (document.fullscreenElement) document.exitFullscreen();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [currentIndex, isPlaying]);

    // Mouse movement to show/hide controls
    useEffect(() => {
        let timeout: NodeJS.Timeout;
        const handleMouseMove = () => {
            setHideControls(false);
            clearTimeout(timeout);
            timeout = setTimeout(() => setHideControls(true), 3000);
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            clearTimeout(timeout);
        };
    }, []);

    const nextSlide = useCallback(() => {
        setCurrentIndex((prev) => (prev + 1) % items.length);
    }, [items.length]);

    const prevSlide = useCallback(() => {
        setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
    }, [items.length]);

    // Sync fullscreen state with browser events
    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    const toggleFullscreen = async () => {
        try {
            if (!document.fullscreenElement) {
                await document.documentElement.requestFullscreen();
            } else {
                await document.exitFullscreen();
            }
        } catch (err) {
            console.error('Error toggling fullscreen:', err);
        }
    };

    const currentImage = displayImages[imageIndex];


    if (!currentItem) return <div className="h-screen flex items-center justify-center text-white bg-black">Showroom vacío</div>;

    return (
        <div className="relative h-screen w-full bg-black overflow-hidden text-white font-sans selection:bg-white/20">

            {/* Background Image (Blurred) */}
            <AnimatePresence mode="popLayout">
                <motion.div
                    key={`bg-${currentIndex}-${imageIndex}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.3 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 2 }}
                    className="absolute inset-0 z-0 bg-cover bg-center blur-3xl scale-110"
                    style={{ backgroundImage: `url(${currentImage})` }}
                />
            </AnimatePresence>

            {/* Main Content */}
            <div className="relative z-10 h-full flex flex-col md:flex-row">

                {/* Image Area */}
                <div className="flex-1 relative flex items-center justify-center p-12">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={`${currentIndex}-${imageIndex}`}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className="relative w-full h-full max-h-[85vh] max-w-[85vw] flex flex-col items-center justify-center"
                        >
                            {/* CARTEL (Placard) - Floating near image if exists */}
                            {currentItem.placardText && (
                                <div className="absolute bottom-0 left-0 z-20 max-w-md bg-white/90 text-black p-6 shadow-2xl backdrop-blur-md rounded-tr-3xl border-l-4 border-ios-red transform translate-y-6 -translate-x-6 md:translate-y-0 md:translate-x-0">
                                    <h3 className="font-serif text-xl font-bold mb-2">La Pieza</h3>
                                    <p className="font-serif italic leading-relaxed text-lg">
                                        "{currentItem.placardText}"
                                    </p>
                                </div>
                            )}

                            <div
                                className="relative w-full h-full shadow-2xl rounded-sm overflow-hidden"
                                style={{ boxShadow: '0 40px 80px -20px rgba(0, 0, 0, 0.8)' }}
                            >
                                {currentImage ? (
                                    <Image
                                        src={currentImage}
                                        alt={instrument.model || 'Instrumento'}
                                        fill
                                        className="object-contain drop-shadow-2xl"
                                        priority
                                    />
                                ) : (
                                    <div className="w-full h-full bg-white/5 flex items-center justify-center">No imagen disponible</div>
                                )}
                            </div>

                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Info sidebar (Ficha Técnica + Story) */}
                <div className={`
                    absolute bottom-0 left-0 right-0 md:static md:w-[450px] md:h-full 
                    bg-gradient-to-t from-black via-black/90 to-transparent md:bg-black/80 md:backdrop-blur-md md:border-l md:border-white/10
                    p-8 md:p-12 flex flex-col justify-center transition-opacity duration-500
                    ${hideControls ? 'opacity-0 md:opacity-100' : 'opacity-100'}
                `}>
                    <motion.div
                        key={`text-${currentIndex}`} // Only animate logic on item change, not image change
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="space-y-8"
                    >
                        {/* Header */}
                        <div>
                            <div className="flex items-center gap-3 mb-3">
                                <span className="px-2 py-1 bg-white/10 rounded text-[10px] font-bold uppercase tracking-widest text-ios-blue">
                                    {instrument.brand}
                                </span>
                                {collectionData.serialNumber && showroom.privacy?.showSerialNumbers && (
                                    <span className="text-[10px] font-mono text-gray-500">#{collectionData.serialNumber}</span>
                                )}
                            </div>
                            <h1 className="text-5xl md:text-6xl font-black leading-tight tracking-tight text-white mb-2">
                                {instrument.model}
                            </h1>
                            <p className="text-xl text-gray-400 font-light">{instrument.type?.replace('_', ' ')}</p>
                        </div>

                        <div className="h-px w-full bg-gradient-to-r from-white/20 to-transparent" />

                        {/* Specs Grid */}
                        <div className="grid grid-cols-2 gap-y-4 gap-x-8 text-sm">
                            <div>
                                <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Año</p>
                                <p className="font-semibold text-white/90 text-lg">{instrument.year || 'N/A'}</p>
                            </div>
                            {showroom.privacy?.showStatus && (
                                <div>
                                    <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Estado</p>
                                    <p className="font-semibold text-white/90 text-lg capitalize">{collectionData.status || 'N/A'}</p>
                                </div>
                            )}
                            {showroom.privacy?.showAcquisitionDate && (
                                <div>
                                    <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Adquisición</p>
                                    <p className="font-semibold text-white/90 text-lg">
                                        {collectionData.acquisition?.date ? new Date(collectionData.acquisition.date).getFullYear() : 'Unknown'}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Curator's Note (Ficha / Story) */}
                        {currentItem.publicNote && (
                            <div className="mt-6 bg-white/5 p-6 rounded-2xl border border-white/5">
                                <p className="text-gray-500 text-xs uppercase tracking-wider mb-3 flex items-center gap-2">
                                    <span className="w-1 h-1 bg-ios-green rounded-full"></span>
                                    Nota del Coleccionista
                                </p>
                                <p className="text-gray-300 font-light leading-relaxed">
                                    {currentItem.publicNote}
                                </p>
                            </div>
                        )}

                        {/* Progress Bar for Item */}
                        <div className="w-full bg-white/5 h-1 mt-12 rounded-full overflow-hidden">
                            <motion.div
                                className="h-full bg-white"
                                initial={{ width: "0%" }}
                                animate={{ width: isPlaying ? "100%" : "0%" }}
                                transition={isPlaying ? { duration: 10, ease: "linear" } : { duration: 0 }}
                                key={currentIndex}
                            />
                        </div>

                        {/* Image Counter */}
                        {displayImages.length > 1 && (
                            <div className="text-center text-xs text-gray-600 mt-2 font-mono">
                                Image {imageIndex + 1} / {displayImages.length}
                            </div>
                        )}

                    </motion.div>
                </div>
            </div>

            {/* Controls Overlay */}
            <div className={`absolute top-0 left-0 right-0 p-6 flex justify-between items-start transition-opacity duration-300 z-[60] ${hideControls ? 'opacity-0 pointer-events-none' : 'opacity-100 pointer-events-auto'}`}>
                <button
                    onClick={() => {
                        if (document.fullscreenElement) document.exitFullscreen();
                        window.location.href = `/s/${showroom.slug}`;
                    }}
                    className="p-3 bg-black/20 hover:bg-black/50 backdrop-blur-md rounded-full text-white/50 hover:text-white transition-all"
                    title="Salir del modo kiosko"
                >
                    <X size={24} />
                </button>
                <div className="flex gap-4">
                    <button onClick={() => setIsPlaying(!isPlaying)} className="p-3 bg-black/20 hover:bg-black/50 backdrop-blur-md rounded-full text-white/50 hover:text-white transition-all">
                        {isPlaying ? <Pause size={24} /> : <Play size={24} />}
                    </button>
                    <button onClick={toggleFullscreen} className="p-3 bg-black/20 hover:bg-black/50 backdrop-blur-md rounded-full text-white/50 hover:text-white transition-all">
                        {isFullscreen ? <Minimize2 size={24} /> : <Maximize2 size={24} />}
                    </button>
                </div>
            </div>

            {/* Navigation Arrows */}
            <div className={`absolute inset-y-0 left-0 w-24 flex items-center justify-start pl-6 opacity-0 hover:opacity-100 transition-opacity z-50 ${hideControls ? 'hidden' : ''}`}>
                <button onClick={prevSlide} className="p-4 bg-black/30 text-white rounded-full hover:bg-white hover:text-black transition-all">
                    <ChevronLeft size={32} />
                </button>
            </div>
            <div className={`absolute inset-y-0 right-0 w-24 flex items-center justify-end pr-6 opacity-0 hover:opacity-100 transition-opacity z-50 ${hideControls ? 'hidden' : ''}`}>
                <button onClick={nextSlide} className="p-4 bg-black/30 text-white rounded-full hover:bg-white hover:text-black transition-all">
                    <ChevronRight size={32} />
                </button>
            </div>
        </div>
    );
}
