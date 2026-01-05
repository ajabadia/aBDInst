'use client';

import { useState } from 'react';
import Lightbox from "yet-another-react-lightbox";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/thumbnails.css";
import { Maximize2, ChevronLeft, ChevronRight } from 'lucide-react';

interface ImageGalleryProps {
    images: string[];
    altText: string;
}

export default function ImageGallery({ images, altText }: ImageGalleryProps) {
    const [index, setIndex] = useState(-1);
    const [selectedIndex, setSelectedIndex] = useState(0);

    if (!images || images.length === 0) {
        return (
            <div className="aspect-square bg-gray-50 dark:bg-gray-800 rounded-2xl flex items-center justify-center text-gray-400 border border-gray-100 dark:border-gray-700">
                <span>Sin imagen</span>
            </div>
        );
    }

    // Handle thumbnail clicks to change main view without opening lightbox
    const handleThumbnailClick = (i: number) => {
        setSelectedIndex(i);
    };

    return (
        <div className="space-y-4 select-none">
            {/* Main Image Container */}
            <div
                className="relative aspect-square bg-[#fbfbfb] dark:bg-[#0d0d0d] rounded-[2rem] overflow-hidden border border-gray-100 dark:border-gray-800 shadow-sm group cursor-zoom-in"
                onClick={() => setIndex(selectedIndex)}
            >
                <img
                    src={images[selectedIndex]}
                    alt={`${altText} - View ${selectedIndex + 1}`}
                    className="w-full h-full object-contain p-4 transition-transform duration-500 ease-out group-hover:scale-105"
                />

                {/* Overlay Controls */}
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="bg-white/90 dark:bg-black/80 backdrop-blur-md p-2 rounded-full shadow-lg border border-white/20">
                        <Maximize2 className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                    </div>
                </div>

                {/* Internal Navigation (Arrows) for fast browsing without lightbox */}
                {images.length > 1 && (
                    <>
                        <button
                            onClick={(e) => { e.stopPropagation(); setSelectedIndex((prev) => (prev - 1 + images.length) % images.length); }}
                            className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/80 dark:bg-black/50 backdrop-blur rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white dark:hover:bg-black/70"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); setSelectedIndex((prev) => (prev + 1) % images.length); }}
                            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/80 dark:bg-black/50 backdrop-blur rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white dark:hover:bg-black/70"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </>
                )}
            </div>

            {/* Thumbnails Strip */}
            {images.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide snap-x">
                    {images.map((img, idx) => (
                        <button
                            key={idx}
                            onClick={() => handleThumbnailClick(idx)}
                            className={`snap-start flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border transition-all duration-300 ${idx === selectedIndex
                                    ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-md scale-105'
                                    : 'border-transparent opacity-60 hover:opacity-100 hover:scale-105'
                                } bg-white dark:bg-gray-800`}
                        >
                            <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                        </button>
                    ))}
                </div>
            )}

            {/* Lightbox Component */}
            <Lightbox
                index={index}
                slides={images.map(src => ({ src }))}
                open={index >= 0}
                close={() => setIndex(-1)}
                plugins={[Zoom, Thumbnails]}
                zoom={{
                    maxZoomPixelRatio: 3,
                    zoomInMultiplier: 2,
                    doubleTapDelay: 300,
                }}
                thumbnails={{
                    position: "bottom",
                    width: 120,
                    height: 80,
                    border: 0,
                    borderRadius: 8,
                    padding: 4,
                    gap: 16,
                }}
                styles={{
                    container: { backgroundColor: "rgba(0, 0, 0, .95)" },
                    thumbnailsContainer: { backgroundColor: "rgba(0, 0, 0, .9)" },
                }}
                controller={{ closeOnBackdropClick: true }}
            />
        </div>
    );
}
