'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Search, Sparkles, Clipboard, Check, ArrowRight, Save, Key } from 'lucide-react';
import { getInstruments } from '@/actions/instrument';
import { useDebouncedCallback } from 'use-debounce';
import { generateInstrumentPrompt, validateInstrumentJSON } from '@/actions/magic-import';
import { toast } from 'sonner';
import { createInstrument, addToCollection } from '@/actions/instrument';

type Step = 'search' | 'method' | 'external-ai-input' | 'external-ai-json' | 'preview';

export default function SubmissionWizard() {
    const router = useRouter();
    const [step, setStep] = useState<Step>('search');
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    // External AI State
    const [rawDesc, setRawDesc] = useState('');
    const [rawSpecs, setRawSpecs] = useState('');
    const [rawUrls, setRawUrls] = useState(''); // NEW: Separate URLs field
    const [rawJson, setRawJson] = useState('');
    const [parsedData, setParsedData] = useState<any>(null);
    const [jsonError, setJsonError] = useState('');

    const handleSearch = useDebouncedCallback(async (term: string) => {
        if (!term) {
            setSearchResults([]);
            return;
        }
        setIsSearching(true);
        const results = await getInstruments(term);
        setSearchResults(results);
        setIsSearching(false);
    }, 500);

    const handleAddToCollection = async (instrumentId: string) => {
        const res = await addToCollection(instrumentId);
        if (res.success) {
            toast.success("Añadido a tu colección");
            router.push('/dashboard/collection');
        } else {
            toast.error(res.error || "No se pudo añadir");
        }
    };

    const handleGeneratePrompt = async () => {
        const res = await generateInstrumentPrompt(rawDesc, rawSpecs, rawUrls, '');
        if (res.success && res.prompt) {
            navigator.clipboard.writeText(res.prompt);
            toast.success("Prompt copiado al portapapeles");
            // Move to JSON paste step
            setStep('external-ai-json');
        }
    };

    const handleValidateJson = async () => {
        setJsonError('');
        const res = await validateInstrumentJSON(rawJson);
        if (res.success) {
            setParsedData(res.data);
            setStep('preview');
        } else {
            setJsonError(res.error || "Error desconocido");
        }
    };

    const handleFinalSubmit = async () => {
        if (!parsedData) return;

        const formData = new FormData();
        Object.keys(parsedData).forEach(key => {
            if (typeof parsedData[key] === 'object') {
                formData.append(key, JSON.stringify(parsedData[key]));
            } else {
                formData.append(key, parsedData[key]);
            }
        });

        const res = await createInstrument(formData);
        if (res.success) {
            toast.success("Instrumento enviado para aprobación");
            router.push(`/instruments/${res.id}`);
        } else {
            toast.error(res.error || "Error al crear instrumento");
        }
    };

    return (
        <div className="max-w-3xl mx-auto py-12 space-y-8">
            {/* Header */}
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Nuevo Instrumento</h1>
                <p className="text-gray-500">Sigue los pasos para añadir un instrumento a la base de datos global.</p>
            </div>

            {/* Stepper Indicator */}
            <div className="flex justify-center gap-2 mb-8">
                {['search', 'method', 'input', 'json', 'preview'].map((s, i) => {
                    const stepMap: Record<Step, number> = {
                        'search': 0,
                        'method': 1,
                        'external-ai-input': 2,
                        'external-ai-json': 3,
                        'preview': 4
                    };
                    return (
                        <div key={s} className={`h-1 w-12 rounded-full transition-colors ${stepMap[step] >= i ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                            }`} />
                    );
                })}
            </div>

            {/* STEP 1: SEARCH */}
            {step === 'search' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-3 text-gray-400" />
                        <Input
                            placeholder="Busca por marca y modelo (ej. Korg Minilogue)..."
                            className="pl-10 h-12 text-lg"
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                handleSearch(e.target.value);
                            }}
                        />
                    </div>

                    <div className="space-y-4">
                        {isSearching && <p className="text-center text-gray-500">Buscando...</p>}

                        {!isSearching && searchResults.length > 0 && (
                            <div className="space-y-2">
                                <p className="text-sm font-medium text-gray-500">Resultados encontrados:</p>
                                {searchResults.map((inst) => (
                                    <div key={inst.id} className="p-4 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl flex items-center justify-between">
                                        <div>
                                            <h3 className="font-bold">{inst.brand} {inst.model}</h3>
                                            <p className="text-xs text-gray-500">{inst.type}</p>
                                        </div>
                                        <Button variant="outline" size="sm" onClick={() => handleAddToCollection(inst.id)}>
                                            Tener este
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {!isSearching && searchQuery.length > 3 && searchResults.length === 0 && (
                            <div className="text-center p-8 bg-gray-50 dark:bg-white/5 rounded-xl border border-dashed border-gray-200">
                                <p className="text-gray-600 mb-4">No encontramos "{searchQuery}".</p>
                                <Button onClick={() => setStep('method')}>
                                    Crear Nuevo Instrumento
                                </Button>
                            </div>
                        )}

                        {/* Bypass for demo if needed */}
                        {searchResults.length > 0 && (
                            <div className="flex justify-center pt-4">
                                <Button variant="ghost" size="sm" onClick={() => setStep('method')} className="text-gray-400">
                                    Mi instrumento es diferente, crear nuevo
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* STEP 2: METHOD */}
            {step === 'method' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4">
                    <button
                        onClick={() => setStep('external-ai-input')}
                        className="group relative p-8 text-left bg-gradient-to-br from-purple-500/5 to-blue-500/5 border border-purple-100 dark:border-white/10 rounded-2xl hover:border-purple-500 transition-all"
                    >
                        <div className="absolute top-4 right-4 p-2 bg-purple-100 text-purple-600 rounded-lg group-hover:bg-purple-600 group-hover:text-white transition-colors">
                            <Sparkles size={24} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Asistente Externo</h3>
                        <p className="text-sm text-gray-500 leading-relaxed">
                            Usa tu IA preferida (ChatGPT, Claude, etc).
                            Te daremos un prompt optimizado y tú nos traes el JSON resultante.
                            <br /><br />
                            <span className="font-medium text-purple-600">Recomendado si no tienes API Key.</span>
                        </p>
                    </button>

                    <button
                        onClick={() => toast.info("Magic Import Auto requiere API Key configurada (Futura Expansión)")}
                        className="group relative p-8 text-left bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl hover:border-gray-400 opacity-60 cursor-not-allowed"
                    >
                        <div className="absolute top-4 right-4 p-2 bg-gray-200 text-gray-500 rounded-lg">
                            <Key size={24} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Magic Import Auto</h3>
                        <p className="text-sm text-gray-500 leading-relaxed">
                            Generación automática usando la API integrada de Gemini.
                            <br /><br />
                            <span className="font-medium text-gray-400">Requiere configuración avanzada.</span>
                        </p>
                    </button>
                </div>
            )}

            {/* STEP 3: EXTERNAL AI - INPUT */}
            {step === 'external-ai-input' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg text-sm text-blue-800 dark:text-blue-200">
                        Describe tu instrumento con los detalles que tengas. Luego generaremos un prompt para tu IA favorita.
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Descripción General</label>
                            <textarea
                                className="w-full h-24 p-3 text-sm bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                                placeholder="Ej. Sintetizador analógico de Roland, lanzado en 1984..."
                                value={rawDesc}
                                onChange={e => setRawDesc(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Especificaciones Técnicas</label>
                            <textarea
                                className="w-full h-32 p-3 text-sm bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                                placeholder="Ej. 6 voces, filtro analógico low-pass, chorus integrado..."
                                value={rawSpecs}
                                onChange={e => setRawSpecs(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">URLs de Referencia (opcional)</label>
                            <textarea
                                className="w-full h-20 p-3 text-sm bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                                placeholder="https://www.roland.com/es/products/juno-106/"
                                value={rawUrls}
                                onChange={e => setRawUrls(e.target.value)}
                            />
                        </div>

                        <div className="flex gap-3 pt-4">
                            <Button variant="outline" onClick={() => setStep('method')} className="flex-1">
                                Atrás
                            </Button>
                            <Button onClick={handleGeneratePrompt} className="flex-[2]">
                                <Clipboard className="mr-2 h-4 w-4" /> Generar y Copiar Prompt
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* STEP 4: EXTERNAL AI - JSON PASTE */}
            {step === 'external-ai-json' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                    <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg text-sm text-green-800 dark:text-green-200">
                        ✓ Prompt copiado. Ahora pégalo en ChatGPT/Claude y trae el JSON resultado aquí.
                    </div>

                    <div className="space-y-4">
                        <label className="block text-sm font-medium">Pega el JSON generado por la IA</label>
                        <textarea
                            className="w-full h-64 p-4 text-xs font-mono bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                            placeholder='{ "brand": "Roland", "model": "Juno-106", ... }'
                            value={rawJson}
                            onChange={e => setRawJson(e.target.value)}
                        />
                        {jsonError && (
                            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                                <p className="text-red-600 dark:text-red-400 text-sm">{jsonError}</p>
                            </div>
                        )}

                        <div className="flex gap-3">
                            <Button variant="outline" onClick={() => setStep('external-ai-input')} className="flex-1">
                                Atrás
                            </Button>
                            <Button onClick={handleValidateJson} className="flex-[2]">
                                <ArrowRight className="mr-2 h-4 w-4" /> Validar y Continuar
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* STEP 4: PREVIEW */}
            {step === 'preview' && parsedData && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                    <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg text-sm text-green-800 dark:text-green-200 flex items-center gap-2">
                        <Check size={16} /> JSON Validado correctamente.
                    </div>

                    <div className="p-6 bg-white dark:bg-white/5 rounded-xl border shadow-sm space-y-4">
                        <h2 className="text-2xl font-bold">{parsedData.brand} {parsedData.model}</h2>
                        <div className="flex gap-2 text-sm text-gray-500">
                            <span className="px-2 py-1 bg-gray-100 rounded-md">{parsedData.type}</span>
                            <span className="px-2 py-1 bg-gray-100 rounded-md">{parsedData.years?.[0]}</span>
                        </div>
                        <p className="text-gray-600 dark:text-gray-300">{parsedData.description}</p>

                        <div className="grid grid-cols-2 gap-4 text-sm mt-4">
                            {parsedData.specs?.slice(0, 4).map((s: any, i: number) => (
                                <div key={i} className="flex justify-between border-b pb-1">
                                    <span className="text-gray-500">{s.label}</span>
                                    <span className="font-medium">{s.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <Button variant="outline" onClick={() => setStep('external-ai')} className="flex-1">
                            Atrás
                        </Button>
                        <Button onClick={handleFinalSubmit} className="flex-[2]">
                            <Save className="mr-2 h-4 w-4" /> Guardar Instrumento
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
