'use client';

import React from 'react';
import Lightbox from 'yet-another-react-lightbox';
import Zoom from 'yet-another-react-lightbox/plugins/zoom';
import Fullscreen from 'yet-another-react-lightbox/plugins/fullscreen';
import Thumbnails from 'yet-another-react-lightbox/plugins/thumbnails';
import 'yet-another-react-lightbox/styles.css';
import 'yet-another-react-lightbox/plugins/thumbnails.css';

interface HighResLightboxProps {
    open: boolean;
    close: () => void;
    slides: {
        src: string;
        title?: string;
        description?: string;
        metadata?: {
            camera?: string;
            lens?: string;
            settings?: string;
        };
    }[];
    index?: number;
}

/**
 * A professional high-resolution lightbox for immersive image exploration.
 * Supports zoom, fullscreen, and displays EXIF metadata if provided.
 */
const HighResLightbox: React.FC<HighResLightboxProps> = ({
    open,
    close,
    slides,
    index = 0,
}) => {
    return (
        <Lightbox
            open={open}
            close={close}
            index={index}
            slides={slides.map((slide) => ({
                src: slide.src,
                title: slide.title,
                description: slide.description,
            }))}
            plugins={[Zoom, Fullscreen, Thumbnails]}
            zoom={{
                maxZoomPixelRatio: 5,
                zoomInMultiplier: 2,
            }}
            render={{
                slideFooter: ({ slide }) => {
                    const slideData = slides.find((s) => s.src === slide.src);
                    if (!slideData?.metadata) return null;

                    return (
                        <div className="absolute bottom-16 left-0 right-0 p-4 bg-black/60 backdrop-blur-md text-white md:bottom-20">
                            <div className="max-w-4xl mx-auto flex flex-wrap gap-4 text-xs md:text-sm">
                                {slideData.metadata.camera && (
                                    <div className="flex flex-col">
                                        <span className="opacity-60 uppercase font-bold tracking-wider">Cámara</span>
                                        <span>{slideData.metadata.camera}</span>
                                    </div>
                                )}
                                {slideData.metadata.lens && (
                                    <div className="flex flex-col">
                                        <span className="opacity-60 uppercase font-bold tracking-wider">Lente</span>
                                        <span>{slideData.metadata.lens}</span>
                                    </div>
                                )}
                                {slideData.metadata.settings && (
                                    <div className="flex flex-col">
                                        <span className="opacity-60 uppercase font-bold tracking-wider">Ajustes</span>
                                        <span>{slideData.metadata.settings}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                },
            }}
            styles={{
                container: { backgroundColor: 'rgba(0, 0, 0, 0.95)' },
            }}
        />
    );
};

export default HighResLightbox;
