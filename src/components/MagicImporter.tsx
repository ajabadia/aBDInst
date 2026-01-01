'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/Button';
import { Sparkles, Upload, CloudLightning, X, CheckCircle, Smartphone, Search, Type, ArrowRight, ListChecks } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { analyzeInstrumentImage, analyzeInstrumentText } from '@/actions/ai';
import { toast } from 'sonner';

interface MagicImporterProps {
    onImport: (data: any) => void;
}

export default function MagicImporter({ onImport }: MagicImporterProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [step, setStep] = useState<'mode' | 'analyzing' | 'review'>('mode');
    const [mode, setMode] = useState<'photo' | 'text'>('photo');
    const [preview, setPreview] = useState<string | null>(null);
    const [textQuery, setTextQuery] = useState('');
    const [results, setResults] = useState<any>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const reset = () => {
        setStep('mode');
        setPreview(null);
        setResults(null);
        setTextQuery('');
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleAnalyze = async () => {
        setStep('analyzing');
        try {
            let res;
            if (mode === 'photo' && fileInputRef.current?.files?.[0]) {
                const formData = new FormData();
                formData.append('image', fileInputRef.current.files[0]);
                res = await analyzeInstrumentImage(formData);
            } else if (mode === 'text' && textQuery) {
                res = await analyzeInstrumentText(textQuery);
            }

            if (res?.success && res.data) {
                setResults(res.data);
                setStep('review');
            } else {
                toast.error(res?.error || 'No se pudo identificar.');
                setStep('mode');
            }
        } catch (error) {
            toast.error('Error de conexión.');
            setStep('mode');
        }
    };

    const applyData = () => {
        onImport(results);
        toast.success('¡Datos aplicados!');
        setIsOpen(false);
        reset();
    };

    const readFromForm = () => {
        const brand = (document.querySelector('[name="brand"]') as HTMLInputElement)?.value || '';
        const model = (document.querySelector('[name="model"]') as HTMLInputElement)?.value || '';
        if (brand || model) {
            setTextQuery(`${brand} ${model}`.trim());
            setMode('text');
        } else {
            toast.info('Rellena marca o modelo primero para leerlos.');
        }
    };

    return (
        <>
            <Button
                type="button"
                variant="primary"
                onClick={() => setIsOpen(true)}
                className="bg-gradient-to-r from-purple-600 to-blue-600 border-none text-white shadow-lg hover:rotate-1 transition-all"
                icon={Sparkles}
            >
                Magic Import
            </Button>

            <AnimatePresence>
                {isOpen && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsOpen(false)} className="absolute inset-0 bg-black/60 backdrop-blur-md" />

                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-xl bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/10">

                            {/* Header */}
                            <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 italic font-black">M</div>
                                    <div>
                                        <h3 className="font-bold text-lg leading-none">Magic Importer</h3>
                                        <p className="text-xs text-gray-400 mt-1">Potenciado por Google Gemini</p>
                                    </div>
                                </div>
                                <button type="button" onClick={() => setIsOpen(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="p-8">
                                {/* STEP: MODE SELECTION */}
                                {step === 'mode' && (
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-2 gap-4">
                                            <button
                                                type="button"
                                                onClick={() => setMode('photo')}
                                                className={`p-6 rounded-3xl border-2 transition-all flex flex-col items-center gap-3 ${mode === 'photo' ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20' : 'border-gray-100 dark:border-gray-800 hover:border-gray-200'}`}
                                            >
                                                <Smartphone size={32} className={mode === 'photo' ? 'text-purple-600' : 'text-gray-400'} />
                                                <span className="font-bold text-sm">Foto</span>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setMode('text')}
                                                className={`p-6 rounded-3xl border-2 transition-all flex flex-col items-center gap-3 ${mode === 'text' ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20' : 'border-gray-100 dark:border-gray-800 hover:border-gray-200'}`}
                                            >
                                                <Type size={32} className={mode === 'text' ? 'text-purple-600' : 'text-gray-400'} />
                                                <span className="font-bold text-sm">Texto</span>
                                            </button>
                                        </div>

                                        {mode === 'photo' ? (
                                            <div onClick={() => fileInputRef.current?.click()} className="group relative border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-3xl p-10 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all overflow-hidden">
                                                {preview ? (
                                                    <img src={preview} className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:opacity-60 transition-opacity" />
                                                ) : (
                                                    <Upload size={32} className="text-gray-300 mb-2" />
                                                )}
                                                <p className="font-bold text-sm relative z-10">{preview ? 'Cambiar Foto' : 'Subir Foto de Etiqueta'}</p>
                                                <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handleFileChange} />
                                            </div>
                                        ) : (
                                            <div className="space-y-3">
                                                <div className="relative">
                                                    <input
                                                        value={textQuery}
                                                        onChange={(e) => setTextQuery(e.target.value)}
                                                        className="apple-input pr-12"
                                                        placeholder="Ej: Korg M1, Juno 106..."
                                                    />
                                                    <button type="button" onClick={readFromForm} className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-blue-500 transition-colors" title="Leer del formulario">
                                                        <Search size={18} />
                                                    </button>
                                                </div>
                                                <p className="text-[10px] text-gray-400 px-2 italic">Puedes escribir la marca y modelo o darle a la lupa para usar lo que ya has escrito en el formulario.</p>
                                            </div>
                                        )}

                                        <Button
                                            type="button"
                                            className="w-full h-14 bg-black dark:bg-white dark:text-black rounded-2xl"
                                            disabled={mode === 'photo' ? !preview : !textQuery}
                                            onClick={handleAnalyze}
                                            icon={ArrowRight}
                                        >
                                            Analizar con IA
                                        </Button>
                                    </div>
                                )}

                                {/* STEP: ANALYZING */}
                                {step === 'analyzing' && (
                                    <div className="py-12 flex flex-col items-center justify-center space-y-4">
                                        <div className="relative w-20 h-20">
                                            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }} className="w-full h-full border-4 border-purple-500 border-t-transparent rounded-full" />
                                            <Sparkles className="absolute inset-0 m-auto text-purple-600 animate-pulse" />
                                        </div>
                                        <p className="font-bold text-lg">Consultando el oráculo...</p>
                                    </div>
                                )}

                                {/* STEP: REVIEW */}
                                {step === 'review' && results && (
                                    <div className="space-y-6">
                                        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-3xl p-6 space-y-4 max-h-[40vh] overflow-y-auto">
                                            <div className="grid grid-cols-2 gap-4 border-b border-gray-100 dark:border-gray-700 pb-4">
                                                <div>
                                                    <p className="text-[10px] uppercase font-black text-gray-400">Marca</p>
                                                    <p className="font-bold">{results.brand}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] uppercase font-black text-gray-400">Modelo</p>
                                                    <p className="font-bold">{results.model}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] uppercase font-black text-gray-400">Tipo</p>
                                                    <p className="font-bold">{results.type}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] uppercase font-black text-gray-400">Año</p>
                                                    <p className="font-bold">{results.year || '-'}</p>
                                                </div>
                                            </div>
                                            <div>
                                                <p className="text-[10px] uppercase font-black text-gray-400 mb-1">Specs encontradas</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {results.specs?.map((s: any, i: number) => (
                                                        <span key={i} className="text-[10px] bg-white dark:bg-black px-2 py-1 rounded-lg border dark:border-gray-700">{s.label}: {s.value}</span>
                                                    ))}
                                                    {(!results.specs || results.specs.length === 0) && <p className="text-xs italic text-gray-400">Sin detalles técnicos específicos.</p>}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex gap-3">
                                            <Button type="button" variant="secondary" onClick={reset} className="flex-1">Volver</Button>
                                            <Button type="button" variant="primary" onClick={applyData} className="flex-1 bg-purple-600 border-none text-white shadow-lg" icon={ListChecks}>Aplicar Datos</Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}
