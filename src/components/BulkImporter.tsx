'use client';

import { useState } from 'react';
import { analyzeBulkList } from '@/actions/ai';
import { createInstrument, deleteInstruments } from '@/actions/instrument';
import { Button } from '@/components/ui/Button';
import { toast } from 'sonner';
import { Loader2, Trash2, ListPlus, Wand2, ArrowRight, X, Undo2, Save, AlertCircle } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

export default function BulkImporter() {
    const [isOpen, setIsOpen] = useState(false);
    const [step, setStep] = useState<'input' | 'processing' | 'review' | 'importing' | 'summary'>('input');

    // State
    const [rawText, setRawText] = useState('');
    const [candidates, setCandidates] = useState<any[]>([]);
    const [importedIds, setImportedIds] = useState<string[]>([]);
    const [progress, setProgress] = useState(0);

    const reset = () => {
        setStep('input');
        setRawText('');
        setCandidates([]);
        setImportedIds([]);
        setProgress(0);
        setIsOpen(false);
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
            <Button onClick={() => setIsOpen(true)} className="gap-2">
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
                                {step === 'input' && (
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
                                        <Button
                                            onClick={handleParse}
                                            disabled={!rawText.trim()}
                                            className="bg-gray-900 dark:bg-white dark:text-gray-900"
                                        >
                                            Analizar Lista <ArrowRight size={16} className="ml-2" />
                                        </Button>
                                    </>
                                )}
                                {step === 'review' && (
                                    <>
                                        <Button variant="ghost" onClick={() => setStep('input')}>Atrás</Button>
                                        <Button
                                            onClick={handleImport}
                                            disabled={candidates.length === 0}
                                            className="bg-green-600 hover:bg-green-700 text-white"
                                        >
                                            <Save size={16} className="mr-2" /> Importar {candidates.length} Ítems
                                        </Button>
                                    </>
                                )}
                                {step === 'summary' && (
                                    <>
                                        <Button variant="danger" onClick={handleUndo}>
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
