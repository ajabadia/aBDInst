'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Sparkles, Upload, CloudLightning, X, CheckCircle, Smartphone, Search, Type, ArrowRight, ListChecks, Globe, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { analyzeInstrumentImage, analyzeInstrumentText, analyzeInstrumentUrl, getAISystemPrompt } from '@/actions/ai';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';

interface MagicImporterProps {
    onImport: (data: any) => void;
    isAdmin?: boolean;
    isPrivileged?: boolean;
    initialSearch?: string;
    contextUrls?: string[];
    existingDescription?: string;
    existingSpecs?: any[];
}

export default function MagicImporter({
    onImport,
    isAdmin = false,
    isPrivileged = false,
    initialSearch,
    contextUrls = [],
    existingDescription = '',
    existingSpecs = []
}: MagicImporterProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [step, setStep] = useState<'mode' | 'analyzing' | 'review'>('mode');
    const [mode, setMode] = useState<'photo' | 'text' | 'url'>(initialSearch ? 'text' : 'photo');
    const [preview, setPreview] = useState<string | null>(null);
    const [textQuery, setTextQuery] = useState(initialSearch || '');
    const [results, setResults] = useState<any>(null);
    const [selectedSpecs, setSelectedSpecs] = useState<Record<number, boolean>>({});
    const [selectedImages, setSelectedImages] = useState<Record<number, boolean>>({});
    const [jsonInput, setJsonInput] = useState('');
    const [showPrompt, setShowPrompt] = useState(false);
    const [systemPrompt, setSystemPrompt] = useState('');
    const { data: session } = useSession();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const reset = () => {
        setStep('mode');
        setPreview(null);
        setResults(null);
        setJsonInput('');
        setTextQuery(initialSearch || '');
        setMode(initialSearch ? 'text' : 'photo');
    };

    useEffect(() => {
        if (results?.specs) {
            const initial: Record<number, boolean> = {};
            results.specs.forEach((s: any, i: number) => {
                // By default, only select if it doesn't exist in the form
                const exists = existingSpecs.some(es => es.label?.toLowerCase() === s.label?.toLowerCase());
                initial[i] = !exists;
            });
            setSelectedSpecs(initial);
        }
        if (results?.images) {
            const initial: Record<number, boolean> = {};
            results.images.forEach((_: any, i: number) => {
                initial[i] = true;
            });
            setSelectedImages(initial);
        }
    }, [results, existingSpecs]);

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
            const isReverbUrl = textQuery?.trim().startsWith('http') && textQuery?.includes('reverb.com');

            if (mode === 'photo' && fileInputRef.current?.files?.[0]) {
                const formData = new FormData();
                formData.append('image', fileInputRef.current.files[0]);
                res = await analyzeInstrumentImage(formData);
            } else if ((mode === 'text' || mode === 'deep' as any) && isReverbUrl) {
                // AUTO-DETECT URL: If user pastes a URL in text or deep mode, use deep enrichment (Specs Pro)
                console.log("[MagicImporter] Auto-detected Reverb URL, switching to Specs Pro flow");
                const { getDeepEnrichment } = await import('@/actions/enrichment');
                res = await getDeepEnrichment('', textQuery.trim());
            } else if (mode === 'text' && textQuery) {
                res = await analyzeInstrumentText(textQuery, contextUrls);
            } else if (mode === 'deep' as any) {
                const { getDeepEnrichment } = await import('@/actions/enrichment');

                // If the user provided a URL in the secondary field (stored in 'preview' state for now)
                const secondaryUrl = preview?.trim();
                const actualUrl = secondaryUrl?.startsWith('http') ? secondaryUrl : null;

                if (actualUrl) {
                    console.log("[MagicImporter] Using explicit URL for Specs Pro");
                    res = await getDeepEnrichment('', actualUrl);
                } else {
                    // Use textQuery or read from form if empty
                    const query = textQuery || `${(document.querySelector('[name="brand"]') as HTMLInputElement)?.value || ''} ${(document.querySelector('[name="model"]') as HTMLInputElement)?.value || ''}`.trim();
                    if (!query) throw new Error('Introduce marca y modelo');
                    const parts = query.split(' ');
                    const brand = parts[0];
                    const model = parts.slice(1).join(' ');
                    res = await getDeepEnrichment(brand, model);
                }
            } else if (mode === 'url' && textQuery) {
                res = await analyzeInstrumentUrl(textQuery);
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

    const handleManualJsonImport = () => {
        // Advanced JSON Repair Logic
        const repairBrokenJson = (str: string): string => {
            let result = '';
            let isInsideString = false;
            let isEscaped = false;

            for (let i = 0; i < str.length; i++) {
                const char = str[i];
                if (char === '"' && !isEscaped) {
                    const isKeyEnd = /^\s*:/.test(str.substring(i + 1));
                    const isValueStart = /:\s*$/.test(result);
                    const isValueEnd = /^\s*[,}\]]/.test(str.substring(i + 1));

                    if (isValueStart || isKeyEnd || isValueEnd) {
                        isInsideString = !isInsideString;
                        result += char;
                    } else {
                        if (isInsideString) result += '\\"';
                        else { isInsideString = true; result += char; }
                    }
                } else {
                    result += char;
                }
                isEscaped = (char === '\\' && !isEscaped);
            }
            return result;
        };

        const tryParse = (input: string) => {
            try { return JSON.parse(input); } catch (e) { return null; }
        };

        try {
            let sanitized = jsonInput.trim().replace(/[\u0000-\u001F]+/g, "");
            let parsed = tryParse(sanitized);

            if (!parsed) {
                const regexFixed = sanitized.replace(/([a-zA-Z0-9])"([a-zA-Z0-9])/g, '$1\\"$2');
                parsed = tryParse(regexFixed);
            }

            if (!parsed) {
                const repaired = repairBrokenJson(sanitized);
                parsed = tryParse(repaired);
            }

            if (parsed) {
                setResults(parsed);
                setStep('review');
                toast.success('JSON procesado correctamente' +
                    (parsed !== tryParse(jsonInput.trim().replace(/[\u0000-\u001F]+/g, "")) ? ' (Reparado)' : ''));
                return;
            }
            throw new Error("JSON Repair Failed");
        } catch (e: any) {
            console.error(e);
            toast.error('Error de sintaxis JSON.');
            if (jsonInput.includes('"')) {
                toast.warning('POSIBLE CAUSA: Comillas (") sin escapar. Intenta poner \\" donde falte.');
            }
        }
    };

    const handleViewPrompt = async () => {
        if (systemPrompt) {
            setShowPrompt(true);
            return;
        }
        const res = await getAISystemPrompt();
        if (res.success) {
            setSystemPrompt(res.prompt || '');
            setShowPrompt(true);
        } else {
            toast.error('Error al recuperar el prompt');
        }
    };

    const applyData = () => {
        const filteredResults = { ...results };

        // Filter specs based on user selection
        if (results.specs) {
            filteredResults.specs = results.specs.filter((_: any, i: number) => selectedSpecs[i]);
        }

        // Filter images if needed (optional for now, but keeping consistency)
        if (results.images) {
            filteredResults.images = results.images.filter((_: any, i: number) => selectedImages[i]);
        }

        onImport(filteredResults);
        toast.success('¡Datos fusionados correctamente!');
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

                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="relative w-full max-w-xl bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/10"
                        >

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
                                        <div className="grid grid-cols-3 gap-2">
                                            <button
                                                type="button"
                                                onClick={() => setMode('photo')}
                                                className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${mode === 'photo' ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20' : 'border-gray-100 dark:border-gray-800 hover:border-gray-200'}`}
                                            >
                                                <Smartphone size={24} className={mode === 'photo' ? 'text-purple-600' : 'text-gray-400'} />
                                                <span className="font-bold text-xs">Foto</span>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setMode('text')}
                                                className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${mode === 'text' ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20' : 'border-gray-100 dark:border-gray-800 hover:border-gray-200'}`}
                                            >
                                                <Type size={24} className={mode === 'text' ? 'text-purple-600' : 'text-gray-400'} />
                                                <span className="font-bold text-xs">Texto</span>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setMode('url')}
                                                className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${mode === 'url' ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20' : 'border-gray-100 dark:border-gray-800 hover:border-gray-200'}`}
                                            >
                                                <CloudLightning size={24} className={mode === 'url' ? 'text-purple-600' : 'text-gray-400'} />
                                                <span className="font-bold text-xs">Link</span>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setMode('deep' as any)}
                                                className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${mode === ('deep' as any) ? 'border-ios-blue bg-ios-blue/5' : 'border-gray-100 dark:border-gray-800 hover:border-gray-200'}`}
                                            >
                                                <Zap size={24} className={mode === ('deep' as any) ? 'text-ios-blue' : 'text-gray-400'} />
                                                <span className="font-bold text-xs">Specs Pro</span>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setMode('json' as any)}
                                                className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${mode === ('json' as any) ? 'border-ios-blue bg-ios-blue/5' : 'border-gray-100 dark:border-gray-800 hover:border-gray-200'}`}
                                            >
                                                <ListChecks size={24} className={mode === ('json' as any) ? 'text-ios-blue' : 'text-gray-400'} />
                                                <span className="font-bold text-xs">JSON</span>
                                            </button>
                                        </div>

                                        {/* Prompt Extraction for Admins */}
                                        {isAdmin && step === 'mode' && (
                                            <button
                                                type="button"
                                                onClick={handleViewPrompt}
                                                className="w-full py-2 bg-gray-100 dark:bg-white/5 rounded-xl text-[10px] uppercase font-bold text-gray-400 hover:text-ios-blue transition-colors flex items-center justify-center gap-2"
                                            >
                                                <Search size={10} /> Ver Prompt de Extracción (Admin)
                                            </button>
                                        )}

                                        {/* Prompt Modal Overlay */}
                                        {showPrompt && (
                                            <div className="absolute inset-0 z-50 bg-white dark:bg-gray-900 p-8 flex flex-col">
                                                <div className="flex justify-between items-center mb-4">
                                                    <h4 className="font-bold text-sm uppercase tracking-wider">System Prompt (Read Only)</h4>
                                                    <Button variant="ghost" size="sm" onClick={() => setShowPrompt(false)} icon={X} />
                                                </div>
                                                <textarea
                                                    readOnly
                                                    className="flex-1 bg-gray-50 dark:bg-black/40 border border-black/5 rounded-2xl p-4 text-xs font-mono text-gray-500 outline-none"
                                                    value={systemPrompt}
                                                />
                                                <p className="text-[10px] text-gray-400 mt-2 italic px-2">Este prompt se utiliza para instruir a Gemini sobre cómo extraer los datos del instrumento.</p>
                                            </div>
                                        )}

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
                                        ) : mode === 'text' ? (
                                            <div className="space-y-3">
                                                <div className="relative">
                                                    <input
                                                        value={textQuery}
                                                        onChange={(e) => setTextQuery(e.target.value)}
                                                        className="apple-input pr-12"
                                                        placeholder="Nombre o pega Link de Reverb..."
                                                    />
                                                    <button type="button" onClick={readFromForm} className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-blue-500 transition-colors" title="Leer del formulario">
                                                        <Search size={18} />
                                                    </button>
                                                </div>
                                                <p className="text-[10px] text-gray-400 px-2 italic">Escribe la marca y modelo para buscar especificaciones.</p>
                                            </div>
                                        ) : mode === ('deep' as any) ? (
                                            <div className="space-y-3">
                                                <div className="bg-ios-blue/5 border border-ios-blue/10 rounded-2xl p-4 mb-2">
                                                    <p className="text-xs text-ios-blue leading-relaxed font-medium flex items-center gap-2">
                                                        <Zap size={14} /> Búsqueda técnica profunda en bases de datos especializadas.
                                                    </p>
                                                </div>
                                                <div className="relative space-y-1">
                                                    <label className="text-[10px] uppercase font-bold text-gray-400 px-1">Marca y Modelo</label>
                                                    <input
                                                        value={textQuery}
                                                        onChange={(e) => setTextQuery(e.target.value)}
                                                        className="apple-input pr-12 border-ios-blue/30 focus:ring-ios-blue"
                                                        placeholder="Ej: Roland TR-808"
                                                    />
                                                    <button type="button" onClick={readFromForm} className="absolute right-3 top-[32px] p-2 text-gray-400 hover:text-ios-blue transition-colors" title="Leer del formulario">
                                                        <Search size={18} />
                                                    </button>
                                                </div>
                                                <div className="relative space-y-1">
                                                    <label className="text-[10px] uppercase font-bold text-gray-400 px-1">Enlace opcional (Reverb)</label>
                                                    <input
                                                        value={preview || ''}
                                                        onChange={(e) => setPreview(e.target.value)}
                                                        className="apple-input pr-12 border-ios-blue/30 focus:ring-ios-blue bg-blue-50/20"
                                                        placeholder="https://reverb.com/item/..."
                                                    />
                                                    <CloudLightning size={16} className="absolute right-4 top-[32px] text-ios-blue/40" />
                                                </div>
                                                <p className="text-[10px] text-gray-400 px-2 italic">Esto consultará Reverb, Vintage Synth Explorer y Synthesizer-API.</p>
                                            </div>
                                        ) : mode === ('json' as any) ? (
                                            <div className="space-y-4">
                                                <div className="bg-purple-50 dark:bg-purple-900/10 border border-purple-100 dark:border-purple-900/20 rounded-2xl p-4">
                                                    <p className="text-xs text-purple-600 dark:text-purple-400 mb-4 leading-relaxed font-medium">
                                                        Copia el resultado JSON de ChatGPT o Claude y pégalo aquí para rellenar el formulario.
                                                    </p>
                                                    <textarea
                                                        value={jsonInput}
                                                        onChange={(e) => setJsonInput(e.target.value)}
                                                        placeholder='{ "brand": "Roland", "model": "Juno 106", ... }'
                                                        className="w-full h-40 bg-white dark:bg-black/20 border border-purple-200 dark:border-purple-900/30 rounded-xl p-4 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                    />
                                                </div>
                                            </div>
                                        ) : null}

                                        {mode === ('json' as any) ? (
                                            <Button
                                                type="button"
                                                className="w-full h-14 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl border-none shadow-lg shadow-purple-500/20"
                                                disabled={!jsonInput}
                                                onClick={handleManualJsonImport}
                                                icon={CheckCircle}
                                            >
                                                Importar desde JSON
                                            </Button>
                                        ) : mode === ('deep' as any) ? (
                                            <Button
                                                type="button"
                                                className="w-full h-14 bg-ios-blue hover:bg-blue-600 text-white rounded-2xl border-none shadow-lg shadow-blue-500/20"
                                                disabled={!textQuery}
                                                onClick={handleAnalyze}
                                                icon={Zap}
                                            >
                                                Consultar Bases de Datos
                                            </Button>
                                        ) : isPrivileged ? (
                                            <Button
                                                type="button"
                                                className="w-full h-14 bg-black dark:bg-white dark:text-black rounded-2xl"
                                                disabled={mode === 'photo' ? !preview : !textQuery}
                                                onClick={handleAnalyze}
                                                icon={ArrowRight}
                                            >
                                                Analizar con IA
                                            </Button>
                                        ) : (
                                            <div className="p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-900/30 rounded-2xl">
                                                <div className="flex items-center gap-3 text-orange-700 dark:text-orange-400 mb-2">
                                                    <CloudLightning size={18} />
                                                    <span className="font-bold text-sm">Modo Automático Restringido</span>
                                                </div>
                                                <p className="text-xs text-orange-600 dark:text-orange-500/80 leading-relaxed">
                                                    El escaneo automático está reservado para Editores. Usa la pestaña <b>JSON</b> para importar datos desde herramientas externas gratis.
                                                </p>
                                            </div>
                                        )}
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
                                        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-3xl p-6 space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
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
                                            {(results.originalPrice || results.marketValue) && (
                                                <div className="border-b border-gray-100 dark:border-gray-700 pb-4">
                                                    <p className="text-[10px] uppercase font-black text-gray-400 mb-2">Precios y Valor</p>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        {results.originalPrice && (
                                                            <div>
                                                                <p className="text-xs text-gray-500">Original ({results.originalPrice.year})</p>
                                                                <p className="font-bold">{results.originalPrice.price} {results.originalPrice.currency}</p>
                                                            </div>
                                                        )}
                                                        {results.marketValue && (
                                                            <div>
                                                                <p className="text-xs text-gray-500">Mercado (Est.)</p>
                                                                <p className="font-bold">{results.marketValue.estimatedPrice} {results.marketValue.currency}</p>
                                                                {results.marketValue.priceRange && (
                                                                    <p className="text-[10px] text-gray-400">{results.marketValue.priceRange.min} - {results.marketValue.priceRange.max}</p>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                            <div>
                                                <p className="text-[10px] uppercase font-black text-gray-400 mb-1">Contexto Musical Detectado</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {results.artists?.map((a: any, i: number) => (
                                                        <span key={`a-${i}`} className="text-[10px] bg-purple-50 dark:bg-purple-900/30 text-purple-600 px-2 py-1 rounded-lg border border-purple-100 dark:border-purple-800">
                                                            👤 {typeof a === 'string' ? a : a.name}
                                                        </span>
                                                    ))}
                                                    {results.albums?.map((a: any, i: number) => (
                                                        <span key={`b-${i}`} className="text-[10px] bg-blue-50 dark:bg-blue-900/30 text-blue-600 px-2 py-1 rounded-lg border border-blue-100 dark:border-blue-800">
                                                            💿 {typeof a === 'string' ? a : a.title}
                                                        </span>
                                                    ))}
                                                    {(!results.artists?.length && !results.albums?.length) && (
                                                        <p className="text-[10px] italic text-gray-400">Sin contexto musical detectado.</p>
                                                    )}
                                                </div>
                                            </div>

                                            <div>
                                                <div className="flex justify-between items-center mb-1">
                                                    <p className="text-[10px] uppercase font-black text-gray-400">Specs encontradas</p>
                                                    <p className="text-[9px] text-gray-400">Selecciona las que desees importar:</p>
                                                </div>
                                                <div className="grid grid-cols-1 gap-2">
                                                    {results.specs?.map((s: any, i: number) => {
                                                        const exists = existingSpecs.some(es => es.label?.toLowerCase() === s.label?.toLowerCase());
                                                        return (
                                                            <div
                                                                key={i}
                                                                onClick={() => setSelectedSpecs(prev => ({ ...prev, [i]: !prev[i] }))}
                                                                className={`group flex items-center justify-between p-2 rounded-xl border text-[10px] transition-all cursor-pointer ${selectedSpecs[i]
                                                                    ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800'
                                                                    : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 opacity-60'
                                                                    }`}
                                                            >
                                                                <div className="flex flex-col">
                                                                    <div className="flex items-center gap-1">
                                                                        <span className="font-bold text-gray-700 dark:text-gray-300">{s.label}:</span>
                                                                        <span className="text-gray-500 dark:text-gray-400">{s.value}</span>
                                                                    </div>
                                                                    {exists && <span className="text-[8px] text-orange-500 font-bold uppercase mt-0.5">⚠️ Ya existe un valor</span>}
                                                                </div>
                                                                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${selectedSpecs[i] ? 'bg-purple-600 border-purple-600 text-white' : 'border-gray-300'}`}>
                                                                    {selectedSpecs[i] && <CheckCircle size={10} />}
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                    {(!results.specs || results.specs.length === 0) && <p className="text-xs italic text-gray-400">Sin detalles técnicos específicos.</p>}
                                                </div>
                                            </div>

                                            {results.description && (
                                                <div className="p-4 bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20 rounded-2xl">
                                                    <p className="text-[10px] uppercase font-black text-blue-600 dark:text-blue-400 mb-2">Nueva Descripción</p>
                                                    <p className="text-[10px] text-gray-600 dark:text-gray-400 line-clamp-3 italic">"{results.description}"</p>
                                                    <p className="text-[9px] text-blue-500 mt-2 font-bold uppercase">✨ Se añadirá al final de tu texto actual</p>
                                                </div>
                                            )}
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
