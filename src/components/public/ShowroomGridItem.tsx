'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Calendar, Tag, Music, ChevronLeft, ChevronRight } from 'lucide-react';

interface ShowroomGridItemProps {
    item: any;
    isDark: boolean;
    privacy: any;
}

export default function ShowroomGridItem({ item, isDark, privacy }: ShowroomGridItemProps) {
    const collectionData = item.collectionId || {};
    const itemType = item.itemType || 'instrument';

    // Polymorphic Metadata Extraction
    const isMusic = itemType === 'music';
    const instrument = !isMusic ? (collectionData.instrumentId || {}) : null;
    const album = isMusic ? (collectionData.albumId || {}) : null;

    const title = isMusic ? album?.title : instrument?.model;
    const subtitle = isMusic ? album?.artist : instrument?.brand;
    const year = isMusic ? album?.year : instrument?.year;
    const badge = isMusic ? 'Música' : instrument?.type?.replace('_', ' ');

    // Slides
    const slides = item.slides && item.slides.length > 0 ? item.slides : [];
    const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
    const currentSlide = slides.length > 0 ? slides[currentSlideIndex] : null;

    // Fallback main image if no slides
    const fallbackImage = isMusic
        ? album?.coverImage
        : (collectionData.userImages?.[0]?.url || instrument?.genericImages?.[0]);

    const handleNext = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setCurrentSlideIndex((prev) => (prev + 1) % slides.length);
    };

    const handlePrev = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setCurrentSlideIndex((prev) => (prev - 1 + slides.length) % slides.length);
    };

    return (
        <div className="group space-y-6">
            {/* Image Card / Slide Player */}
            <div className={`aspect-[4/5] relative rounded-[2rem] overflow-hidden ${isDark ? 'bg-white/5' : 'bg-black/5'} shadow-xl`}>

                {/* 1. Slide View */}
                {currentSlide ? (
                    <>
                        {currentSlide.type === 'image' && (
                            <Image
                                src={currentSlide.url}
                                alt={currentSlide.caption || title || 'Slide'}
                                fill
                                className="object-cover transition-transform duration-700"
                            />
                        )}
                        {currentSlide.type === 'text' && (
                            <div className={`w-full h-full flex flex-col items-center justify-center p-8 text-center ${isDark ? 'text-white' : 'text-black'}`}>
                                <p className="font-serif text-xl italic leading-relaxed">
                                    "{currentSlide.text}"
                                </p>
                            </div>
                        )}
                    </>
                ) : (
                    /* 2. Fallback View */
                    fallbackImage ? (
                        <Image
                            src={fallbackImage}
                            alt={title || 'Item'}
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center opacity-20">
                            <Music size={64} />
                        </div>
                    )
                )}

                {/* Overlay Type Badge */}
                {((!currentSlide && fallbackImage) || currentSlideIndex === 0) && (
                    <div className="absolute top-4 left-4 pointer-events-none">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-md ${isDark ? 'bg-white/10 text-white' : 'bg-black/80 text-white'}`}>
                            {badge}
                        </span>
                    </div>
                )}

                {/* Navigation Controls (If multiple slides) */}
                {slides.length > 1 && (
                    <div className="absolute inset-x-0 bottom-4 flex justify-between px-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={handlePrev} className="p-2 bg-black/50 text-white rounded-full hover:bg-black/70 backdrop-blur-md">
                            <ChevronLeft size={20} />
                        </button>

                        <div className="flex gap-1 items-center">
                            {slides.map((_: any, idx: number) => (
                                <div
                                    key={idx}
                                    className={`w-1.5 h-1.5 rounded-full transition-colors ${idx === currentSlideIndex ? 'bg-white' : 'bg-white/30'}`}
                                />
                            ))}
                        </div>

                        <button onClick={handleNext} className="p-2 bg-black/50 text-white rounded-full hover:bg-black/70 backdrop-blur-md">
                            <ChevronRight size={20} />
                        </button>
                    </div>
                )}
            </div>

            {/* Text Info */}
            <div className="space-y-3">
                <div>
                    <h3 className="text-2xl font-bold leading-tight line-clamp-2">{title}</h3>
                    <p className={`font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{subtitle}</p>
                </div>

                {/* Specs / Details */}
                <div className={`flex flex-wrap gap-4 text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    {year && (
                        <span className="flex items-center gap-1.5">
                            <Calendar size={14} /> {year}
                        </span>
                    )}
                    {privacy?.showSerialNumbers && collectionData.serialNumber && (
                        <span className="flex items-center gap-1.5">
                            <Tag size={14} /> {isMusic ? 'Edition' : 'S/N'}: {collectionData.serialNumber}
                        </span>
                    )}
                    {privacy?.showStatus && collectionData.status && (
                        <span className="flex items-center gap-1.5 capitalize">
                            <span className={`w-2 h-2 rounded-full ${collectionData.status === 'active' ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                            {collectionData.status}
                        </span>
                    )}
                    {privacy?.showAcquisitionDate && collectionData.acquisition?.date && (
                        <span className="flex items-center gap-1.5">
                            Since {new Date(collectionData.acquisition.date).getFullYear()}
                        </span>
                    )}
                </div>

                {/* Placard / Public Note (Legacy) */}
                {item.placardText && (
                    <div className={`p-4 rounded-xl ${isDark ? 'bg-white/5' : 'bg-black/5'}`}>
                        <p className={`font-serif italic ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>"{item.placardText}"</p>
                    </div>
                )}

                {/* Owner's Note (Legacy) */}
                {item.publicNote && !item.placardText && (
                    <div className={`pl-4 border-l-2 ${isDark ? 'border-white/20' : 'border-black/10'}`}>
                        <p className={`text-sm italic leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            "{item.publicNote}"
                        </p>
                    </div>
                )}

                {/* Price if Allowed */}
                {privacy?.showPrices && collectionData.acquisition?.price && (
                    <p className="text-lg font-bold">
                        {new Intl.NumberFormat('es-ES', { style: 'currency', currency: collectionData.acquisition.currency || 'EUR' }).format(collectionData.acquisition.price)}
                    </p>
                )}
            </div>
        </div>
    );
}
