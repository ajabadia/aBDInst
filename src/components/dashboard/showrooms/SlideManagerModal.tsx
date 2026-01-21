'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { X, Plus, Image as ImageIcon, Type, Trash2, GripVertical, Check, ChevronLeft, ChevronRight, Music, Clock } from 'lucide-react';
import ImageUpload from '@/components/ImageUpload';
import MediaUpload from '@/components/shared/MediaUpload';
import MediaLibrary from '@/components/media/MediaLibrary';
import Image from 'next/image';
import VoiceRecorder from './VoiceRecorder';
import UniversalMediaPicker from '@/components/shared/UniversalMediaPicker';
import { cn } from '@/lib/utils';
import { Palette, AlignCenter, AlignLeft, AlignRight, Bold, Type as TypeIcon } from 'lucide-react';

interface ISlide {
    type: 'image' | 'text' | 'poster';
    url?: string;
    text?: string;
    caption?: string;
    layout?: string;
    duration?: number;
    audioUrl?: string;
    syncAudioDuration?: boolean;
    style?: {
        fontSize?: string;
        fontWeight?: string;
        fontFamily?: string;
        textAlign?: string;
        textColor?: string;
    }
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

    const handleAddSlide = (type: 'image' | 'text' | 'poster') => {
        const newSlide: ISlide = type === 'image'
            ? { type: 'image', url: '', layout: 'cover', caption: '', duration: 10 }
            : type === 'text'
                ? { type: 'text', text: '', layout: 'center', caption: '', duration: 10 }
                : { type: 'poster', url: '', text: '', layout: 'split-h', caption: '', duration: 10 };

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
                        <div className="p-3 border-b border-gray-100 dark:border-gray-800 grid grid-cols-3 gap-2">
                            <Button size="sm" variant="outline" className="text-[10px] px-1" icon={ImageIcon} onClick={() => handleAddSlide('image')}>Foto</Button>
                            <Button size="sm" variant="outline" className="text-[10px] px-1" icon={Type} onClick={() => handleAddSlide('text')}>Texto</Button>
                            <Button size="sm" variant="outline" className="text-[10px] px-1" icon={Plus} onClick={() => handleAddSlide('poster')}>Poster</Button>
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

                                {/* Common Fields - Duration & Audio */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium flex items-center gap-2">
                                            <Clock size={14} /> Duración (segundos)
                                        </label>
                                        <div className="flex gap-2">
                                            <input
                                                type="number"
                                                className="flex-1 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg p-2 disabled:opacity-50"
                                                value={currentSlide.duration || 10}
                                                onChange={e => updateSlide(selectedSlideIndex, { duration: parseInt(e.target.value) || 10 })}
                                                disabled={currentSlide.syncAudioDuration}
                                            />
                                            <button
                                                onClick={() => updateSlide(selectedSlideIndex, { syncAudioDuration: !currentSlide.syncAudioDuration })}
                                                className={`px-3 rounded-lg border text-[10px] font-bold uppercase transition-colors ${currentSlide.syncAudioDuration ? 'bg-ios-blue border-transparent text-white' : 'border-gray-200 dark:border-white/10 text-gray-400'}`}
                                            >
                                                Sync Audio
                                            </button>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium flex items-center gap-2">
                                            <Music size={14} /> Narración o Audio (Opcional)
                                        </label>
                                        <div className="space-y-3">
                                            <UniversalMediaPicker
                                                onSelect={(url) => updateSlide(selectedSlideIndex, { audioUrl: url })}
                                                currentValue={currentSlide.audioUrl}
                                                typeFilter="audio"
                                            />
                                            {/* Integrated Voice Recorder */}
                                            <VoiceRecorder
                                                currentAudio={currentSlide.audioUrl}
                                                onUpload={(url) => updateSlide(selectedSlideIndex, { audioUrl: url })}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Live Preview Pane */}
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                        Previsualización en Modo Kiosko
                                    </label>
                                    <div className="aspect-video bg-black rounded-2xl overflow-hidden border border-white/10 relative shadow-2xl">
                                        {currentSlide.type === 'image' && currentSlide.url && (
                                            <Image src={currentSlide.url} alt="Preview" fill className={cn("object-center", currentSlide.layout === 'contain' ? 'object-contain' : 'object-cover')} />
                                        )}
                                        {currentSlide.type === 'text' && (
                                            <div className={cn("w-full h-full flex items-center p-8 bg-zinc-900", currentSlide.style?.textAlign || 'justify-center')}>
                                                <p className={cn(
                                                    "leading-relaxed",
                                                    currentSlide.style?.fontSize || 'text-xl',
                                                    currentSlide.style?.fontWeight || 'font-normal',
                                                    currentSlide.style?.fontFamily || 'font-serif',
                                                    currentSlide.style?.textColor || 'text-gray-200'
                                                )}>
                                                    "{currentSlide.text || 'Texto de muestra...'}"
                                                </p>
                                            </div>
                                        )}
                                        {/* Type: Poster (Live Preview) */}
                                        {currentSlide.type === 'poster' && (
                                            <div className={cn(
                                                "w-full h-full relative bg-zinc-950 overflow-hidden",
                                                currentSlide.layout === 'split-v' && "grid grid-rows-2",
                                                (currentSlide.layout === 'split-h' || !currentSlide.layout) && "grid grid-cols-2"
                                            )}>
                                                {/* Layout: Split */}
                                                {(currentSlide.layout === 'split-v' || currentSlide.layout === 'split-h' || !currentSlide.layout) && (
                                                    <>
                                                        <div className="relative overflow-hidden">
                                                            {currentSlide.url && <Image src={currentSlide.url} alt="Poster" fill className="object-cover" />}
                                                        </div>
                                                        <div className={cn("flex items-center p-6 bg-white/5", currentSlide.style?.textAlign === 'text-left' ? 'justify-start' : 'justify-center border-l border-white/10')}>
                                                            <p className={cn(
                                                                "leading-tight",
                                                                currentSlide.style?.fontSize || 'text-lg',
                                                                currentSlide.style?.fontWeight || 'font-light',
                                                                currentSlide.style?.fontFamily || 'font-sans',
                                                                currentSlide.style?.textColor || 'text-gray-200',
                                                                currentSlide.style?.textAlign || 'text-center'
                                                            )}>
                                                                {currentSlide.text || 'Descripción del poster...'}
                                                            </p>
                                                        </div>
                                                    </>
                                                )}

                                                {/* Layout: Overlay */}
                                                {currentSlide.layout === 'overlay' && (
                                                    <>
                                                        {currentSlide.url && <Image src={currentSlide.url} alt="Poster" fill className="object-cover" />}
                                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center p-12">
                                                            <div className={cn(
                                                                "p-8 bg-black/50 backdrop-blur-md rounded-2xl border border-white/10 max-w-[80%]",
                                                                currentSlide.style?.textAlign || 'text-center'
                                                            )}>
                                                                <p className={cn(
                                                                    "leading-relaxed",
                                                                    currentSlide.style?.fontSize || 'text-2xl',
                                                                    currentSlide.style?.fontWeight || 'font-normal',
                                                                    currentSlide.style?.fontFamily || 'font-serif',
                                                                    currentSlide.style?.textColor || 'text-white'
                                                                )}>
                                                                    {currentSlide.text || 'Descripción del poster...'}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </>
                                                )}

                                                {/* Layout: Classic */}
                                                {currentSlide.layout === 'classic' && (
                                                    <div className="w-full h-full bg-zinc-900 p-8 flex flex-col items-center justify-center space-y-6">
                                                        <div className="relative w-2/3 aspect-video rounded-lg overflow-hidden shadow-2xl border-4 border-white/5">
                                                            {currentSlide.url && <Image src={currentSlide.url} alt="Poster" fill className="object-cover" />}
                                                        </div>
                                                        <div className="max-w-[70%] text-center">
                                                            <p className={cn(
                                                                "leading-relaxed",
                                                                currentSlide.style?.fontSize || 'text-xl',
                                                                currentSlide.style?.fontWeight || 'font-light',
                                                                currentSlide.style?.fontFamily || 'font-sans',
                                                                currentSlide.style?.textColor || 'text-gray-300'
                                                            )}>
                                                                {currentSlide.text || 'Descripción del poster...'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                        {currentSlide.caption && (
                                            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent text-[10px] text-white/70">
                                                {currentSlide.caption}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Type Specific */}
                                {currentSlide.type === 'image' ? (
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Media (Imagen)</label>
                                            <UniversalMediaPicker
                                                onSelect={(url) => updateSlide(selectedSlideIndex, { url })}
                                                currentValue={currentSlide.url}
                                                typeFilter="image"
                                            />
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
                                ) : currentSlide.type === 'text' ? (
                                    <div className="space-y-4">
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">Formato Visual (Rich Text)</label>
                                                <div className="flex gap-2 p-1 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/10">
                                                    <Button size="icon" variant="ghost" className={cn("h-8 w-8", currentSlide.style?.fontWeight === 'font-bold' && "bg-ios-blue/10 text-ios-blue")}
                                                        onClick={() => updateSlide(selectedSlideIndex, { style: { ...currentSlide.style, fontWeight: currentSlide.style?.fontWeight === 'font-bold' ? 'font-normal' : 'font-bold' } })}
                                                    ><Bold size={14} /></Button>
                                                    <Button size="icon" variant="ghost" className={cn("h-8 w-8", currentSlide.style?.fontFamily === 'font-serif' && "bg-ios-blue/10 text-ios-blue")}
                                                        onClick={() => updateSlide(selectedSlideIndex, { style: { ...currentSlide.style, fontFamily: currentSlide.style?.fontFamily === 'font-serif' ? 'font-sans' : 'font-serif' } })}
                                                    ><TypeIcon size={14} /></Button>
                                                    <div className="w-px bg-gray-200 dark:bg-white/10 mx-1" />
                                                    <Button size="icon" variant="ghost" className={cn("h-8 w-8", (currentSlide.style?.textAlign === 'text-left' || !currentSlide.style?.textAlign) && "bg-ios-blue/10 text-ios-blue")}
                                                        onClick={() => updateSlide(selectedSlideIndex, { style: { ...currentSlide.style, textAlign: 'text-left' } })}
                                                    ><AlignLeft size={14} /></Button>
                                                    <Button size="icon" variant="ghost" className={cn("h-8 w-8", currentSlide.style?.textAlign === 'text-center' && "bg-ios-blue/10 text-ios-blue")}
                                                        onClick={() => updateSlide(selectedSlideIndex, { style: { ...currentSlide.style, textAlign: 'text-center' } })}
                                                    ><AlignCenter size={14} /></Button>
                                                    <div className="w-px bg-gray-200 dark:bg-white/10 mx-1" />
                                                    <select
                                                        className="text-[10px] bg-transparent outline-none cursor-pointer"
                                                        value={currentSlide.style?.fontSize || 'text-xl'}
                                                        onChange={(e) => updateSlide(selectedSlideIndex, { style: { ...currentSlide.style, fontSize: e.target.value } })}
                                                    >
                                                        <option value="text-sm">Pequeño</option>
                                                        <option value="text-lg">Normal</option>
                                                        <option value="text-2xl">Grande</option>
                                                        <option value="text-4xl">Muy Grande</option>
                                                        <option value="text-6xl">Hero</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">Contenido de Texto</label>
                                                <textarea
                                                    className="w-full h-32 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg p-3 font-mono text-sm"
                                                    placeholder="Escribe el texto aquí..."
                                                    value={currentSlide.text || ''}
                                                    onChange={e => updateSlide(selectedSlideIndex, { text: e.target.value })}
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Diseño (Layout)</label>
                                            <div className="grid grid-cols-4 gap-2">
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
                                ) : (
                                    /* Poster Editor (Image + Text) */
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">Imagen del Poster</label>
                                                <UniversalMediaPicker
                                                    onSelect={(url) => updateSlide(selectedSlideIndex, { url })}
                                                    currentValue={currentSlide.url}
                                                    typeFilter="image"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">Texto del Poster</label>
                                                <div className="flex gap-2 p-1 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/10 mb-2">
                                                    <Button size="icon" variant="ghost" className={cn("h-7 w-7", currentSlide.style?.fontWeight === 'font-bold' && "bg-ios-blue/10 text-ios-blue")}
                                                        onClick={() => updateSlide(selectedSlideIndex, { style: { ...currentSlide.style, fontWeight: currentSlide.style?.fontWeight === 'font-bold' ? 'font-normal' : 'font-bold' } })}
                                                    ><Bold size={12} /></Button>
                                                    <Button size="icon" variant="ghost" className={cn("h-7 w-7", currentSlide.style?.fontFamily === 'font-serif' && "bg-ios-blue/10 text-ios-blue")}
                                                        onClick={() => updateSlide(selectedSlideIndex, { style: { ...currentSlide.style, fontFamily: currentSlide.style?.fontFamily === 'font-serif' ? 'font-sans' : 'font-serif' } })}
                                                    ><TypeIcon size={12} /></Button>
                                                    <div className="w-px bg-gray-200 dark:bg-white/10 mx-1" />
                                                    <Button size="icon" variant="ghost" className={cn("h-7 w-7", currentSlide.style?.textAlign === 'text-left' && "bg-ios-blue/10 text-ios-blue")}
                                                        onClick={() => updateSlide(selectedSlideIndex, { style: { ...currentSlide.style, textAlign: 'text-left' } })}
                                                    ><AlignLeft size={12} /></Button>
                                                    <Button size="icon" variant="ghost" className={cn("h-7 w-7", currentSlide.style?.textAlign === 'text-center' && "bg-ios-blue/10 text-ios-blue")}
                                                        onClick={() => updateSlide(selectedSlideIndex, { style: { ...currentSlide.style, textAlign: 'text-center' } })}
                                                    ><AlignCenter size={12} /></Button>
                                                </div>
                                                <textarea
                                                    className="w-full h-24 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg p-3 text-sm"
                                                    placeholder="Escribe la historia o datos aquí..."
                                                    value={currentSlide.text || ''}
                                                    onChange={e => updateSlide(selectedSlideIndex, { text: e.target.value })}
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Diseño del Poster</label>
                                            <div className="grid grid-cols-4 gap-2">
                                                {[
                                                    { id: 'split-h', label: 'Dividir H' },
                                                    { id: 'split-v', label: 'Dividir V' },
                                                    { id: 'overlay', label: 'Superpuesto' },
                                                    { id: 'classic', label: 'Clásico' }
                                                ].map(l => (
                                                    <button
                                                        key={l.id}
                                                        onClick={() => updateSlide(selectedSlideIndex, { layout: l.id })}
                                                        className={`p-2 border rounded-lg text-xs ${currentSlide.layout === l.id ? 'bg-ios-blue/10 border-ios-blue text-ios-blue' : 'border-gray-200 dark:border-white/10'}`}
                                                    >
                                                        {l.label}
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
