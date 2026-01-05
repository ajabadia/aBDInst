'use client';

import { useState, useRef } from 'react';
import { analyzeBulkList } from '@/actions/ai';
import { createInstrument, deleteInstruments } from '@/actions/instrument';
import { validateImport, bulkImport } from '@/actions/import';
import { parseCSV } from '@/lib/csv-parser';
import { Button } from '@/components/ui/Button';
import { toast } from 'sonner';
import { Loader2, Trash2, ListPlus, Wand2, ArrowRight, X, Undo2, Save, AlertCircle, FileText, Upload, CheckCircle, AlertTriangle, FileUp } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

interface ImportPreview {
    total: number;
    valid: number;
    invalid: number; // Items with blocking errors
    items: any[];
    errors: string[];
}

export default function BulkImporter() {
    const [isOpen, setIsOpen] = useState(false);
    const [mode, setMode] = useState<'text' | 'file'>('text');
    const [step, setStep] = useState<'input' | 'processing' | 'review' | 'importing' | 'summary'>('input');

    // Text Mode State
    const [rawText, setRawText] = useState('');
    const [candidates, setCandidates] = useState<any[]>([]);

    // File Mode State
    const [file, setFile] = useState<File | null>(null);
    const [filePreview, setFilePreview] = useState<ImportPreview | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Shared State
    const [importedIds, setImportedIds] = useState<string[]>([]);
    const [progress, setProgress] = useState(0);

    const reset = () => {
        setStep('input');
        setRawText('');
        setCandidates([]);
        setFile(null);
        setFilePreview(null);
        setImportedIds([]);
        setProgress(0);
        setIsOpen(false);
    };

    // --- FILE MODE HANDLERS ---
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = e.target.files?.[0];
        if (selected) {
            setFile(selected);
            setFilePreview(null);
        }
    };

    const runFileSimulation = async () => {
        if (!file) return;
        setStep('processing');
        try {
            // 1. Client Parse
            const rawData = await parseCSV(file);
            if (rawData.length === 0) {
                toast.error('El archivo parece vacío o inválido');
                setStep('input');
                return;
            }

            // 2. Server Validation (Dry Run)
            const res = await validateImport(rawData);
            if (res.success && res.data) {
                setFilePreview({
                    total: res.data.total,
                    valid: res.data.valid.length,
                    invalid: res.data.invalid.length,
                    items: [...res.data.valid, ...res.data.invalid], // Show all
                    errors: res.data.errors
                });
                setStep('review');
            } else {
                toast.error(res.error || 'Error en validación');
                setStep('input');
            }
        } catch (e) {
            console.error(e);
            toast.error('Error procesando archivo');
            setStep('input');
        }
    };

    const executeFileImport = async () => {
        if (!filePreview) return;
        setStep('importing');
        setProgress(50); // Indeterminate state for now as it is one batch transaction

        // Filter only valid items for import
        const validItems = filePreview.items.filter((i: any) => !i._errors);

        try {
            const res = await bulkImport(validItems);
            if (res.success && res.ids) {
                setImportedIds(res.ids);
                setProgress(100);
                setStep('summary');
                toast.success(`Importados ${res.count} instrumentos`);
            } else {
                toast.error(res.error || 'Fallo en la importación');
                setStep('review');
            }
        } catch (e) {
            toast.error('Error de conexión');
            setStep('review');
        }
    };

    const handleParse = async () => {
        if (!rawText.trim()) return;
        setStep('processing');
        try {
            const res = await analyzeBulkList(rawText);
            if (res.success && Array.isArray(res.data)) {
                // Add temp ID for React keys
                setCandidates(res.data.map((item, i) => ({ ...item, tempId: i })));
                setStep('review');
            } else {
                toast.error(res.error || 'No se reconocieron instrumentos.');
                setStep('input');
            }
        } catch (e) {
            toast.error('Error al analizar.');
            setStep('input');
        }
    };

    const handleUpdateCandidate = (index: number, field: string, value: string) => {
        const newC = [...candidates];
        newC[index] = { ...newC[index], [field]: value };
        setCandidates(newC);
    };

    const handleRemoveCandidate = (index: number) => {
        const newC = [...candidates];
        newC.splice(index, 1);
        setCandidates(newC);
    };

    const handleImport = async () => {
        setStep('importing');
        setProgress(0);
        const newIds: string[] = [];
        let success = 0;

        for (let i = 0; i < candidates.length; i++) {
            const item = candidates[i];
            try {
                const formData = new FormData();
                formData.append('brand', item.brand || 'Unknown');
                formData.append('model', item.model || 'Unknown Model');
                formData.append('type', item.type || 'Other');
                if (item.year) formData.append('year', item.year.toString());
                if (item.description) formData.append('description', item.description);
                if (item.specs) formData.append('specs', JSON.stringify(item.specs));

                const res = await createInstrument(formData);
                if (res.success && res.id) {
                    newIds.push(res.id);
                    success++;
                }
            } catch (e) {
                console.error("Import failed for item", item, e);
            }
            setProgress(Math.round(((i + 1) / candidates.length) * 100));
        }

        setImportedIds(newIds);
        setStep('summary');
        toast.success(`Importación completada: ${success} ítems.`);
    };

    const handleUndo = async () => {
        if (!confirm('¿Estás seguro de deshacer esta importación? Se borrarán los instrumentos creados.')) return;

        const res = await deleteInstruments(importedIds);
        if (res.success) {
            toast.success('Importación deshecha correctamente.');
            reset();
        } else {
            toast.error('Error al deshacer: ' + res.error);
        }
    };

    return (
        <>
            <Button onClick={() => setIsOpen(true)} className="gap-2 whitespace-nowrap" variant="secondary">
                <Wand2 size={16} /> Importar con IA
            </Button>

            <AnimatePresence>
                {isOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden border border-gray-100 dark:border-gray-800"
                        >
                            {/* Header */}
                            <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-white/5">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                        <Wand2 className="text-purple-500" /> Asistente de Importación
                                    </h2>
                                    <p className="text-sm text-gray-500">
                                        {step === 'input' && 'Paso 1: Pega tu lista'}
                                        {step === 'processing' && 'Analizando...'}
                                        {step === 'review' && 'Paso 2: Revisa y Corrige'}
                                        {step === 'importing' && 'Importando...'}
                                        {step === 'summary' && '¡Listo!'}
                                    </p>
                                </div>
                                <button onClick={reset} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                                    <X />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="flex-1 overflow-y-auto p-6">
                                {/* Mode Selector (Only on Input step) */}
                                {step === 'input' && (
                                    <div className="flex gap-4 mb-6">
                                        <button
                                            onClick={() => setMode('text')}
                                            className={`flex-1 p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${mode === 'text' ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20' : 'border-gray-100 dark:border-gray-800'}`}
                                        >
                                            <Wand2 className={mode === 'text' ? 'text-purple-600' : 'text-gray-400'} />
                                            <span className="font-bold text-sm">Texto + IA</span>
                                        </button>
                                        <button
                                            onClick={() => setMode('file')}
                                            className={`flex-1 p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${mode === 'file' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-100 dark:border-gray-800'}`}
                                        >
                                            <FileUp className={mode === 'file' ? 'text-blue-600' : 'text-gray-400'} />
                                            <span className="font-bold text-sm">Subir CSV/JSON</span>
                                        </button>
                                    </div>
                                )}

                                {step === 'input' && mode === 'text' && (
                                    <div className="space-y-4">
                                        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-xl text-sm flex gap-3">
                                            <AlertCircle className="shrink-0" />
                                            <p>Copia y pega una lista desde Excel, PDF o web. La IA detectará marcas y modelos automáticamente. Separa cada ítem por línea.</p>
                                        </div>
                                        <textarea
                                            value={rawText}
                                            onChange={(e) => setRawText(e.target.value)}
                                            placeholder="Ejemplo:&#10;Fender Stratocaster 1962 (Sunburst)&#10;Roland Juno-60&#10;Gibson Les Paul Custom"
                                            className="w-full h-64 p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-black/20 font-mono text-sm focus:ring-2 focus:ring-purple-500 outline-none resize-none"
                                        />
                                    </div>
                                )}

                                {step === 'input' && mode === 'file' && (
                                    <div className={`border-2 border-dashed rounded-xl p-10 text-center transition-colors ${file ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/10' : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50'}`}>
                                        <input
                                            type="file"
                                            accept=".csv,.json"
                                            ref={fileInputRef}
                                            className="hidden"
                                            onChange={handleFileChange}
                                        />
                                        {file ? (
                                            <div className="flex flex-col items-center">
                                                <FileText className="w-16 h-16 text-blue-500 mb-4" />
                                                <p className="font-bold text-lg mb-1">{file.name}</p>
                                                <p className="text-sm text-gray-500 mb-6">{(file.size / 1024).toFixed(2)} KB</p>
                                                <div className="flex gap-2">
                                                    <Button variant="outline" size="sm" onClick={() => { setFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}>Cambiar</Button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                                <Upload className="w-16 h-16 text-gray-300 mb-4" />
                                                <p className="font-bold text-lg">Arrastra tu CSV aquí</p>
                                                <p className="text-sm text-gray-400 mt-2">Soporta formato Reverb y CSV estándar</p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {step === 'processing' && (
                                    <div className="h-64 flex flex-col items-center justify-center text-center space-y-4">
                                        <Loader2 className="w-12 h-12 text-purple-600 animate-spin" />
                                        <div>
                                            <h3 className="text-lg font-medium">Analizando texto...</h3>
                                            <p className="text-gray-500">Estamos identificando los instrumentos.</p>
                                        </div>
                                    </div>
                                )}

                                {step === 'review' && (
                                    <div>
                                        {/* TEXT MODE REVIEW */}
                                        {mode === 'text' && (
                                            <div>
                                                <table className="w-full text-sm text-left">
                                                    <thead className="bg-gray-50 dark:bg-gray-800 text-gray-500 uppercase text-xs tracking-wider sticky top-0">
                                                        <tr>
                                                            <th className="px-4 py-3">Marca</th>
                                                            <th className="px-4 py-3">Modelo</th>
                                                            <th className="px-4 py-3">Tipo</th>
                                                            <th className="px-4 py-3 w-10"></th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                                        {candidates.map((item, idx) => (
                                                            <tr key={item.tempId} className="group hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                                                <td className="p-2">
                                                                    <input
                                                                        value={item.brand}
                                                                        onChange={(e) => handleUpdateCandidate(idx, 'brand', e.target.value)}
                                                                        className="w-full bg-transparent border-b border-transparent focus:border-purple-500 outline-none px-2 py-1"
                                                                    />
                                                                </td>
                                                                <td className="p-2">
                                                                    <input
                                                                        value={item.model}
                                                                        onChange={(e) => handleUpdateCandidate(idx, 'model', e.target.value)}
                                                                        className="w-full bg-transparent border-b border-transparent focus:border-purple-500 outline-none px-2 py-1 font-medium"
                                                                    />
                                                                </td>
                                                                <td className="p-2">
                                                                    <input
                                                                        value={item.type}
                                                                        onChange={(e) => handleUpdateCandidate(idx, 'type', e.target.value)}
                                                                        className="w-full bg-transparent border-b border-transparent focus:border-purple-500 outline-none px-2 py-1 text-gray-500"
                                                                    />
                                                                </td>
                                                                <td className="p-2 text-right">
                                                                    <button
                                                                        onClick={() => handleRemoveCandidate(idx)}
                                                                        className="text-gray-400 hover:text-red-500 p-2"
                                                                    >
                                                                        <Trash2 size={16} />
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                                {candidates.length === 0 && (
                                                    <div className="text-center py-10 text-gray-500">
                                                        No hay ítems. Vuelve atrás para añadir texto.
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* FILE MODE REVIEW */}
                                        {mode === 'file' && filePreview && (
                                            <div className="space-y-6">
                                                <div className="flex justify-between items-start bg-gray-50 dark:bg-gray-800/50 p-6 rounded-2xl">
                                                    <div>
                                                        <h3 className="text-lg font-bold">Resumen de Validación</h3>
                                                        <div className="flex gap-6 mt-2 text-sm">
                                                            <span className="text-gray-500">Total: <strong className="text-gray-900 dark:text-white">{filePreview.total}</strong></span>
                                                            <span className="text-green-600">Válidos: <strong>{filePreview.valid}</strong></span>
                                                            <span className={filePreview.invalid > 0 ? "text-red-500" : "text-gray-400"}>Inválidos: <strong>{filePreview.invalid}</strong></span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {filePreview.errors.length > 0 && (
                                                    <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                                                        <h4 className="flex items-center gap-2 text-red-700 dark:text-red-300 font-bold text-sm mb-2">
                                                            <AlertTriangle size={16} /> Errores Bloqueantes ({filePreview.invalid})
                                                        </h4>
                                                        <ul className="list-disc list-inside text-xs text-red-600 dark:text-red-400 space-y-1 max-h-32 overflow-y-auto">
                                                            {filePreview.errors.map((err, i) => <li key={i}>{err}</li>)}
                                                        </ul>
                                                        <p className="text-[10px] text-red-500 mt-2">* Los ítems con errores serán ignorados.</p>
                                                    </div>
                                                )}

                                                <div className="overflow-x-auto border rounded-xl border-gray-100 dark:border-gray-800">
                                                    <table className="w-full text-sm text-left">
                                                        <thead className="text-xs text-gray-500 uppercase bg-gray-50 dark:bg-gray-800">
                                                            <tr>
                                                                <th className="px-4 py-2">Estado</th>
                                                                <th className="px-4 py-2">Marca</th>
                                                                <th className="px-4 py-2">Modelo</th>
                                                                <th className="px-4 py-2">Año</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                                            {filePreview.items.slice(0, 10).map((item, i) => (
                                                                <tr key={i} className={item._errors ? "bg-red-50/50 dark:bg-red-900/10" : ""}>
                                                                    <td className="px-4 py-2">
                                                                        {item._errors ? (
                                                                            <X size={14} className="text-red-500" />
                                                                        ) : (
                                                                            <CheckCircle size={14} className="text-green-500" />
                                                                        )}
                                                                    </td>
                                                                    <td className="px-4 py-2 font-medium">{item.brand || '-'}</td>
                                                                    <td className="px-4 py-2">{item.model || '-'}</td>
                                                                    <td className="px-4 py-2">{item.year || '-'}</td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                    {filePreview.items.length > 10 && (
                                                        <p className="text-xs text-center text-gray-400 p-2 bg-gray-50 dark:bg-gray-800/50">
                                                            ... y {filePreview.items.length - 10} más
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {step === 'importing' && (
                                    <div className="py-12 space-y-6 max-w-md mx-auto text-center">
                                        <h3 className="text-xl font-bold">Importando al Catálogo</h3>
                                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden">
                                            <div
                                                className="bg-purple-600 h-full transition-all duration-300 ease-out"
                                                style={{ width: `${progress}%` }}
                                            />
                                        </div>
                                        <p className="text-gray-500">{progress}% Completado</p>
                                    </div>
                                )}

                                {step === 'summary' && (
                                    <div className="py-10 text-center space-y-6">
                                        <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <ListPlus size={40} />
                                        </div>
                                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">¡Importación Exitosa!</h3>
                                        <p className="text-gray-500">
                                            Se han añadido <strong>{importedIds.length}</strong> nuevos instrumentos al catálogo maestro.
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Footer */}
                            <div className="p-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-white/5 flex justify-between items-center">
                                {step === 'input' && (
                                    <>
                                        <div></div>
                                        {mode === 'text' ? (
                                            <Button
                                                onClick={handleParse}
                                                disabled={!rawText.trim()}
                                                className="bg-gray-900 dark:bg-white dark:text-gray-900"
                                            >
                                                Analizar Lista <ArrowRight size={16} className="ml-2" />
                                            </Button>
                                        ) : (
                                            <Button
                                                onClick={runFileSimulation}
                                                disabled={!file}
                                                className="bg-blue-600 hover:bg-blue-700 text-white"
                                            >
                                                Simular Importación <ArrowRight size={16} className="ml-2" />
                                            </Button>
                                        )}
                                    </>
                                )}
                                {step === 'review' && (
                                    <>
                                        <Button variant="ghost" onClick={() => setStep('input')}>Atrás</Button>
                                        {mode === 'text' ? (
                                            <Button
                                                onClick={handleImport}
                                                disabled={candidates.length === 0}
                                                className="bg-green-600 hover:bg-green-700 text-white"
                                            >
                                                <Save size={16} className="mr-2" /> Importar {candidates.length} Ítems
                                            </Button>
                                        ) : (
                                            <Button
                                                onClick={executeFileImport}
                                                disabled={!filePreview || filePreview.valid === 0}
                                                className="bg-green-600 hover:bg-green-700 text-white"
                                            >
                                                <Save size={16} className="mr-2" /> Importar {filePreview?.valid} Ítems
                                            </Button>
                                        )}

                                    </>
                                )}
                                {step === 'summary' && (
                                    <>
                                        <Button variant="destructive" onClick={handleUndo}>
                                            <Undo2 size={16} className="mr-2" /> Deshacer Importación
                                        </Button>
                                        <Button onClick={reset} variant="secondary">
                                            Cerrar
                                        </Button>
                                    </>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}
