'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { X, Plus, Image as ImageIcon, Type, Trash2, GripVertical, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import ImageUpload from '@/components/ImageUpload';
import Image from 'next/image';

interface ISlide {
    type: 'image' | 'text';
    url?: string;
    text?: string;
    caption?: string;
    layout?: string;
}

interface SlideManagerModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    initialSlides: ISlide[];
    onSave: (slides: ISlide[]) => void;
    itemName: string;
}

export default function SlideManagerModal({ open, onOpenChange, initialSlides, onSave, itemName }: SlideManagerModalProps) {
    const [slides, setSlides] = useState<ISlide[]>([]);
    const [selectedSlideIndex, setSelectedSlideIndex] = useState<number>(0);

    useEffect(() => {
        if (open) {
            setSlides(JSON.parse(JSON.stringify(initialSlides || [])));
            setSelectedSlideIndex(0);
        }
    }, [open, initialSlides]);

    // Close on ESC
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onOpenChange(false);
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onOpenChange]);

    const handleAddSlide = (type: 'image' | 'text') => {
        const newSlide: ISlide = type === 'image'
            ? { type: 'image', url: '', layout: 'cover', caption: '' }
            : { type: 'text', text: '', layout: 'center', caption: '' };

        const newSlides = [...slides, newSlide];
        setSlides(newSlides);
        setSelectedSlideIndex(newSlides.length - 1);
    };

    const handleRemoveSlide = (index: number) => {
        const newSlides = slides.filter((_, i) => i !== index);
        setSlides(newSlides);
        if (selectedSlideIndex >= newSlides.length) {
            setSelectedSlideIndex(Math.max(0, newSlides.length - 1));
        }
    };

    const updateSlide = (index: number, updates: Partial<ISlide>) => {
        const newSlides = [...slides];
        newSlides[index] = { ...newSlides[index], ...updates };
        setSlides(newSlides);
    };

    const handleSave = () => {
        onSave(slides);
        onOpenChange(false);
    };

    if (!open) return null;

    const currentSlide = slides[selectedSlideIndex];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-4xl h-[80vh] shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-800 flex flex-col animate-in zoom-in-95">

                {/* Header */}
                <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center shrink-0">
                    <div>
                        <h2 className="text-lg font-bold">Gestor de Diapositivas</h2>
                        <p className="text-xs text-gray-500 truncate max-w-[300px]">{itemName}</p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>Cancelar</Button>
                        <Button size="sm" onClick={handleSave} icon={Check}>Guardar Cambios</Button>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 flex overflow-hidden">

                    {/* Left: Slide List (Sidebar) */}
                    <div className="w-64 border-r border-gray-100 dark:border-gray-800 flex flex-col bg-gray-50 dark:bg-black/20">
                        <div className="p-3 border-b border-gray-100 dark:border-gray-800 grid grid-cols-2 gap-2">
                            <Button size="sm" variant="outline" className="text-xs" icon={ImageIcon} onClick={() => handleAddSlide('image')}>Foto</Button>
                            <Button size="sm" variant="outline" className="text-xs" icon={Type} onClick={() => handleAddSlide('text')}>Texto</Button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-3 space-y-2">
                            {slides.map((slide, idx) => (
                                <div
                                    key={idx}
                                    onClick={() => setSelectedSlideIndex(idx)}
                                    className={`p-2 rounded-lg border cursor-pointer transition-all flex gap-3 items-center group ${selectedSlideIndex === idx
                                            ? 'bg-white dark:bg-white/10 border-ios-blue ring-1 ring-ios-blue shadow-sm'
                                            : 'bg-white dark:bg-white/5 border-transparent hover:border-gray-300 dark:hover:border-white/20'
                                        }`}
                                >
                                    <div className="w-6 text-xs text-gray-400 font-mono text-center shrink-0">{idx + 1}</div>
                                    <div className="w-10 h-10 bg-gray-100 dark:bg-black rounded overflow-hidden shrink-0 relative border border-gray-200 dark:border-white/10">
                                        {slide.type === 'image' && slide.url ? (
                                            <Image src={slide.url} alt="mini" fill className="object-cover" />
                                        ) : slide.type === 'image' ? (
                                            <ImageIcon size={16} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-gray-400" />
                                        ) : (
                                            <Type size={16} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-gray-400" />
                                        )}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-xs font-medium truncate">{slide.caption || (slide.type === 'image' ? 'Imagen' : 'Texto')}</p>
                                        <p className="text-[10px] text-gray-400 truncate">{slide.layout}</p>
                                    </div>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleRemoveSlide(idx); }}
                                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 hover:text-red-500 rounded transition-all"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            ))}
                            {slides.length === 0 && (
                                <div className="text-center py-10 px-4 text-gray-400 text-xs">
                                    No hay diapositivas. Añade una para empezar.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right: Editor Area */}
                    <div className="flex-1 flex flex-col overflow-y-auto bg-white dark:bg-gray-900">
                        {currentSlide ? (
                            <div className="p-6 max-w-2xl mx-auto w-full space-y-6">
                                <div className="flex justify-between items-center pb-4 border-b border-gray-100 dark:border-white/5">
                                    <span className="text-sm font-bold uppercase tracking-wider text-gray-400">
                                        Editando Slide {selectedSlideIndex + 1} ({currentSlide.type})
                                    </span>
                                </div>

                                {/* Common Fields */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Título / Caption (Opcional)</label>
                                    <input
                                        className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg p-2"
                                        placeholder="Ej: Vista trasera, Detalle del puente..."
                                        value={currentSlide.caption || ''}
                                        onChange={e => updateSlide(selectedSlideIndex, { caption: e.target.value })}
                                    />
                                </div>

                                {/* Type Specific */}
                                {currentSlide.type === 'image' ? (
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Imagen</label>
                                            <div className="aspect-video bg-gray-50 dark:bg-black/20 rounded-xl overflow-hidden border border-gray-200 dark:border-white/10 relative">
                                                {currentSlide.url ? (
                                                    <Image src={currentSlide.url} alt="Preview" fill className="object-contain" />
                                                ) : (
                                                    <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                                                        Sin imagen
                                                    </div>
                                                )}
                                                <div className="absolute bottom-4 right-4">
                                                    <ImageUpload
                                                        endpoint="/api/upload/showroom-slide" // Reusing cover endpoint or generic? Let's assume generic or check later.
                                                        currentImage={currentSlide.url}
                                                        onUpload={(url) => updateSlide(selectedSlideIndex, { url })}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Diseño (Layout)</label>
                                            <div className="grid grid-cols-3 gap-2">
                                                {['cover', 'contain', 'grid'].map(l => (
                                                    <button
                                                        key={l}
                                                        onClick={() => updateSlide(selectedSlideIndex, { layout: l })}
                                                        className={`p-2 border rounded-lg text-xs capitalize ${currentSlide.layout === l ? 'bg-ios-blue/10 border-ios-blue text-ios-blue' : 'border-gray-200 dark:border-white/10'}`}
                                                    >
                                                        {l}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Contenido de Texto</label>
                                            <textarea
                                                className="w-full h-40 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg p-3 font-mono text-sm"
                                                placeholder="Escribe el texto aquí..."
                                                value={currentSlide.text || ''}
                                                onChange={e => updateSlide(selectedSlideIndex, { text: e.target.value })}
                                            />
                                            <p className="text-xs text-gray-400">Soporta saltos de línea.</p>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Diseño (Layout)</label>
                                            <div className="grid grid-cols-3 gap-2">
                                                {['center', 'quote', 'specs', 'list'].map(l => (
                                                    <button
                                                        key={l}
                                                        onClick={() => updateSlide(selectedSlideIndex, { layout: l })}
                                                        className={`p-2 border rounded-lg text-xs capitalize ${currentSlide.layout === l ? 'bg-ios-blue/10 border-ios-blue text-ios-blue' : 'border-gray-200 dark:border-white/10'}`}
                                                    >
                                                        {l}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                                <p>Selecciona una diapositiva para editar.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
