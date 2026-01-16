'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Maximize2, Minimize2, ChevronLeft, ChevronRight, Play, Pause, X } from 'lucide-react';
import Link from 'next/link';

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

    // Auto-advance
    useEffect(() => {
        if (!isPlaying) return;
        const interval = setInterval(() => {
            nextSlide();
        }, 8000); // 8 seconds per slide
        return () => clearInterval(interval);
    }, [isPlaying, currentIndex]);

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

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
            setIsFullscreen(true);
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    };

    if (!currentItem) return <div className="h-screen flex items-center justify-center text-white bg-black">Showroom vacío</div>;

    const mainImage = currentItem.userImages?.[0]?.url || currentItem.instrumentId?.genericImages?.[0];

    return (
        <div className="relative h-screen w-full bg-black overflow-hidden text-white font-sans selection:bg-white/20">

            {/* Background Image (Blurred) */}
            <AnimatePresence mode="popLayout">
                <motion.div
                    key={`bg-${currentIndex}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.3 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 2 }}
                    className="absolute inset-0 z-0 bg-cover bg-center blur-3xl scale-110"
                    style={{ backgroundImage: `url(${mainImage})` }}
                />
            </AnimatePresence>

            {/* Main Content */}
            <div className="relative z-10 h-full flex flex-col md:flex-row">

                {/* Image Area */}
                <div className="flex-1 relative flex items-center justify-center p-12">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentIndex}
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 1.05 }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className="relative w-full h-full max-h-[80vh] max-w-[80vw] shadow-2xl rounded-sm overflow-hidden"
                            style={{ boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)' }}
                        >
                            {mainImage ? (
                                <Image
                                    src={mainImage}
                                    alt={currentItem.instrumentId?.model}
                                    fill
                                    className="object-contain drop-shadow-2xl"
                                    priority
                                />
                            ) : (
                                <div className="w-full h-full bg-white/5 flex items-center justify-center">No imagen</div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Info sidebar (Glass overlay on mobile, sidebar on desktop) */}
                <div className={`
                    absolute bottom-0 left-0 right-0 md:static md:w-[400px] md:h-full 
                    bg-gradient-to-t from-black via-black/80 to-transparent md:bg-black/40 md:backdrop-blur-xl md:border-l md:border-white/10
                    p-8 md:p-12 flex flex-col justify-end md:justify-center transition-opacity duration-500
                    ${hideControls ? 'opacity-0 md:opacity-100' : 'opacity-100'}
                `}>
                    <motion.div
                        key={`text-${currentIndex}`}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="space-y-6"
                    >
                        <div>
                            <p className="text-ios-blue font-bold tracking-widest uppercase text-sm mb-2">{currentItem.instrumentId?.brand}</p>
                            <h1 className="text-5xl md:text-6xl font-black leading-tight tracking-tight">{currentItem.instrumentId?.model}</h1>
                        </div>

                        <div className="h-px w-20 bg-white/20" />

                        <div className="grid grid-cols-2 gap-6 text-sm md:text-base">
                            {currentItem.instrumentId?.year && (
                                <div>
                                    <p className="text-gray-400 text-xs uppercase tracking-wider">Año</p>
                                    <p className="font-medium">{currentItem.instrumentId.year}</p>
                                </div>
                            )}
                            {showroom.privacy?.showSerialNumbers && currentItem.serialNumber && (
                                <div>
                                    <p className="text-gray-400 text-xs uppercase tracking-wider">Serial</p>
                                    <p className="font-mono">{currentItem.serialNumber}</p>
                                </div>
                            )}
                            <div>
                                <p className="text-gray-400 text-xs uppercase tracking-wider">Tipo</p>
                                <p className="font-medium capitalize">{currentItem.instrumentId?.type?.replace('_', ' ')}</p>
                            </div>
                            {currentItem.status && (
                                <div>
                                    <p className="text-gray-400 text-xs uppercase tracking-wider">Estado</p>
                                    <p className="font-medium capitalize">{currentItem.status}</p>
                                </div>
                            )}
                        </div>

                        {currentItem.publicNote && (
                            <p className="text-lg text-gray-300 italic font-light leading-relaxed border-l-2 border-ios-blue/50 pl-4">
                                "{currentItem.publicNote}"
                            </p>
                        )}

                        {/* Progress Bar */}
                        <div className="w-full bg-white/10 h-1 mt-8 rounded-full overflow-hidden">
                            <motion.div
                                className="h-full bg-white"
                                initial={{ width: "0%" }}
                                animate={{ width: isPlaying ? "100%" : "0%" }}
                                transition={isPlaying ? { duration: 8, ease: "linear", repeat: 0 } : { duration: 0 }}
                                key={currentIndex} // Reset on index change
                            />
                        </div>

                    </motion.div>
                </div>
            </div>

            {/* Controls Overlay */}
            <div className={`absolute top-0 left-0 right-0 p-6 flex justify-between items-start transition-opacity duration-300 ${hideControls ? 'opacity-0' : 'opacity-100'}`}>
                <Link href={`/s/${showroom.slug}`} className="p-3 bg-black/20 hover:bg-black/50 backdrop-blur-md rounded-full text-white/50 hover:text-white transition-all">
                    <X size={24} />
                </Link>
                <div className="flex gap-4">
                    <button onClick={() => setIsPlaying(!isPlaying)} className="p-3 bg-black/20 hover:bg-black/50 backdrop-blur-md rounded-full text-white/50 hover:text-white transition-all">
                        {isPlaying ? <Pause size={24} /> : <Play size={24} />}
                    </button>
                    <button onClick={toggleFullscreen} className="p-3 bg-black/20 hover:bg-black/50 backdrop-blur-md rounded-full text-white/50 hover:text-white transition-all">
                        {isFullscreen ? <Minimize2 size={24} /> : <Maximize2 size={24} />}
                    </button>
                </div>
            </div>

            {/* Navigation Arrows (Sides) */}
            <div className={`absolute inset-y-0 left-0 w-24 flex items-center justify-start pl-6 opacity-0 hover:opacity-100 transition-opacity z-20 ${hideControls ? 'hidden' : ''}`}>
                <button onClick={prevSlide} className="p-4 bg-black/30 text-white rounded-full hover:bg-white hover:text-black transition-all">
                    <ChevronLeft size={32} />
                </button>
            </div>
            <div className={`absolute inset-y-0 right-0 w-24 flex items-center justify-end pr-6 opacity-0 hover:opacity-100 transition-opacity z-20 ${hideControls ? 'hidden' : ''} md:hidden`}>
                {/* Hidden on desktop because right side is covered by sidebar, wait, sidebar is static on right on desktop. actually navigation click areas should be carefully placed. 
               Let's put arrows at bottom center or just rely on keyboard/touch swipe eventually.
               For now, simple arrows overlaying sidebar might be messy. Let's keep distinct buttons.
            */}
                <button onClick={nextSlide} className="p-4 bg-black/30 text-white rounded-full hover:bg-white hover:text-black transition-all">
                    <ChevronRight size={32} />
                </button>
            </div>

        </div>
    );
}
