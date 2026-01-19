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
    const [rawName, setRawName] = useState(''); // NEW: Instrument Name
    const [rawDesc, setRawDesc] = useState('');
    const [rawSpecs, setRawSpecs] = useState('');
    const [rawUrls, setRawUrls] = useState('');
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
        const res = await generateInstrumentPrompt(rawName, rawDesc, rawSpecs, rawUrls, '');
        if (res.success && res.prompt) {
            navigator.clipboard.writeText(res.prompt);
            toast.success("Prompt copiado al portapapeles");
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

        // Ensure status is unset so backend defaults to pending
        // formData.delete('status'); 

        const res = await createInstrument(formData);

        if (res.success) {
            toast.success("Instrumento enviado para aprobación");
            router.push(`/instruments/${res.id}`);
        } else {
            console.error("Submission error:", res);

            if (res.error === 'DUPLICATE_INSTRUMENT' && res.id) {
                toast.error("Este instrumento ya existe. Redirigiendo...");
                // Short timeout to let the user see the toast
                setTimeout(() => {
                    router.push(`/instruments/${res.id}`);
                }, 1500);
            } else {
                toast.error(res.error || "Error al crear instrumento");
            }
        }
    };

    // Helper for line numbers
    const getLineNumbers = (text: string) => {
        return text.split('\n').map((_, i) => i + 1).join('\n');
    };

    return (
        <div className="max-w-3xl mx-auto py-12 space-y-8 px-4 md:px-0">
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
                                <Button onClick={() => {
                                    setRawName(searchQuery);
                                    setStep('method'); // Go to method selection
                                }}>
                                    Crear Nuevo Instrumento
                                </Button>
                            </div>
                        )}

                        {/* Bypass for demo */}
                        {searchResults.length > 0 && (
                            <div className="flex justify-center pt-4">
                                <Button variant="ghost" size="sm" onClick={() => {
                                    setRawName(searchQuery);
                                    setStep('method');
                                }} className="text-gray-400">
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
                        </p>
                    </button>
                </div>
            )}

            {/* STEP 3: EXTERNAL AI - INPUT */}
            {step === 'external-ai-input' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg text-sm text-blue-800 dark:text-blue-200 flex items-start gap-3">
                        <Sparkles className="w-5 h-5 mt-0.5 shrink-0" />
                        <div>
                            <p className="font-medium mb-1">Crea el Prompt Perfecto</p>
                            <p className="opacity-90">Dinos qué instrumento es y qué detalles tienes. Nosotros crearemos las instrucciones exactas para que la IA (ChatGPT/Claude) te devuelva el JSON perfecto.</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Nombre del Instrumento <span className="text-gray-400 text-xs font-normal ml-2">(Bloqueado: viene de la búsqueda)</span></label>
                            <Input
                                value={rawName}
                                readOnly
                                className="text-lg bg-gray-100 dark:bg-white/10 text-gray-500 cursor-not-allowed"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Para cambiar el nombre, <button onClick={() => setStep('search')} className="text-blue-500 underline hover:text-blue-600">vuelve a la búsqueda</button>.
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Descripción General</label>
                            <textarea
                                className="w-full h-24 p-3 text-sm bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none transition-all"
                                placeholder="Ej. Sintetizador analógico de 6 voces, lanzado en 1984. Tiene chorus ruidoso..."
                                value={rawDesc}
                                onChange={e => setRawDesc(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Especificaciones Técnicas (cortar y pegar)</label>
                            <textarea
                                className="w-full h-32 p-3 text-sm bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none font-mono text-xs"
                                placeholder="Polyphony: 6 voices&#10;Oscillators: DCO&#10;Filter: VCF (High Pass, Low Pass)..."
                                value={rawSpecs}
                                onChange={e => setRawSpecs(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">URLs de Referencia</label>
                            <textarea
                                className="w-full h-20 p-3 text-sm bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                                placeholder="https://vintage-synth-explorer.com/juno106"
                                value={rawUrls}
                                onChange={e => setRawUrls(e.target.value)}
                            />
                        </div>

                        <div className="flex gap-3 pt-4">
                            <Button variant="outline" onClick={() => setStep('method')} className="flex-1">
                                Atrás
                            </Button>
                            <Button
                                onClick={handleGeneratePrompt}
                                className="flex-[2]"
                                disabled={!rawName.trim()}
                            >
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
                        ✓ Prompt copiado. Pégalo en tu IA y trae el código JSON aquí.
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <label className="block text-sm font-medium">Pegar JSON Respuesta</label>
                            <button
                                onClick={() => setRawJson('')}
                                className="text-xs text-red-500 hover:underline"
                            >
                                Borrar contenido
                            </button>
                        </div>

                        <div className="relative border border-gray-200 dark:border-white/10 rounded-lg overflow-hidden h-96 flex bg-gray-50 dark:bg-black/20">
                            {/* Line Numbers */}
                            <div className="w-10 bg-gray-100 dark:bg-white/5 border-r border-gray-200 dark:border-white/10 text-right p-4 text-xs font-mono text-gray-400 select-none overflow-hidden">
                                <pre>{getLineNumbers(rawJson)}</pre>
                            </div>
                            {/* Editor */}
                            <textarea
                                className="flex-1 h-full p-4 text-xs font-mono bg-transparent border-none focus:ring-0 resize-none leading-relaxed"
                                placeholder='{&#10;  "brand": "Roland",&#10;  "model": "Juno-106",&#10;  ...&#10;}'
                                value={rawJson}
                                onChange={e => setRawJson(e.target.value)}
                                spellCheck={false}
                            />
                        </div>

                        {jsonError && (
                            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg animate-in fade-in slide-in-from-top-1">
                                <p className="text-red-600 dark:text-red-400 text-sm flex items-center gap-2">
                                    <span className="font-bold">Error:</span> {jsonError}
                                </p>
                            </div>
                        )}

                        <div className="flex gap-3 pt-4">
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

            {/* STEP 5: PREVIEW */}
            {step === 'preview' && parsedData && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                    <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg text-sm text-green-800 dark:text-green-200 flex items-center gap-2">
                        <Check size={16} /> JSON Validado correctamente. Revisa los datos antes de guardar.
                    </div>

                    <div className="p-6 bg-white dark:bg-white/5 rounded-xl border shadow-sm space-y-6">

                        {/* Header Info */}
                        <div className="border-b border-gray-100 dark:border-white/5 pb-4">
                            <h2 className="text-3xl font-bold mb-2">{parsedData.brand} {parsedData.model}</h2>
                            <div className="flex flex-wrap gap-2 text-sm">
                                <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-md font-medium">{parsedData.type}</span>
                                {parsedData.years && (
                                    <span className="px-2 py-1 bg-gray-100 dark:bg-white/10 rounded-md text-gray-600 dark:text-gray-300">
                                        {Array.isArray(parsedData.years) ? parsedData.years.join(' - ') : parsedData.years}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <h4 className="text-xs uppercase tracking-wider text-gray-500 font-bold mb-2">Descripción</h4>
                            <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm">{parsedData.description}</p>
                        </div>

                        {/* Specs Grid */}
                        {parsedData.specs && parsedData.specs.length > 0 && (
                            <div>
                                <h4 className="text-xs uppercase tracking-wider text-gray-500 font-bold mb-2">Especificaciones</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 text-sm">
                                    {parsedData.specs.map((s: any, i: number) => (
                                        <div key={i} className="flex justify-between border-b border-gray-100 dark:border-white/5 pb-1">
                                            <span className="text-gray-500">{s.label}</span>
                                            <span className="font-medium text-right ml-4">{s.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Remaining Fields (Websites, Price, etc) */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-100 dark:border-white/5">
                            {parsedData.websites && parsedData.websites.length > 0 && (
                                <div>
                                    <h4 className="text-xs uppercase tracking-wider text-gray-500 font-bold mb-2">Referencias</h4>
                                    <ul className="text-sm space-y-1">
                                        {parsedData.websites.map((w: any, i: number) => (
                                            <li key={i} className="truncate">
                                                <a href={w.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                                                    {w.url}
                                                </a>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {parsedData.marketValue && (
                                <div>
                                    <h4 className="text-xs uppercase tracking-wider text-gray-500 font-bold mb-2">Valor de Mercado (Est.)</h4>
                                    <div className="text-sm">
                                        <p>Original: {parsedData.marketValue.original?.price} {parsedData.marketValue.original?.currency} ({parsedData.marketValue.original?.year})</p>
                                        <p>Actual: {parsedData.marketValue.current?.min}-{parsedData.marketValue.current?.max} {parsedData.marketValue.current?.currency}</p>
                                    </div>
                                </div>
                            )}
                        </div>

                    </div>

                    <div className="flex gap-3">
                        <Button variant="outline" onClick={() => setStep('external-ai-json')} className="flex-1">
                            Atrás (Corregir JSON)
                        </Button>
                        <Button onClick={handleFinalSubmit} className="flex-[2]">
                            <Save className="mr-2 h-4 w-4" /> Confirmar y Guardar
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
