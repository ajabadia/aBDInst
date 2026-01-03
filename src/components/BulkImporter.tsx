'use client';

import { useState } from 'react';
import { analyzeBulkList } from '@/actions/ai';
import { createInstrument } from '@/actions/instrument'; // Assuming this exists or I'll use a loop
import { Button } from '@/components/ui/Button';
import { toast } from 'sonner';
import { Loader2, Trash2, CheckCircle, ListPlus } from 'lucide-react';

export default function BulkImporter({ onComplete }: { onComplete?: () => void }) {
    const [rawText, setRawText] = useState('');
    const [candidates, setCandidates] = useState<any[]>([]);
    const [step, setStep] = useState<'input' | 'processing' | 'review' | 'importing'>('input');
    const [importProgress, setImportProgress] = useState(0);

    const handleParse = async () => {
        if (!rawText.trim()) return;
        setStep('processing');

        try {
            const res = await analyzeBulkList(rawText);
            if (res.success && Array.isArray(res.data)) {
                setCandidates(res.data);
                setStep('review');
            } else {
                toast.error(res.error || 'No se pudieron reconocer instrumentos.');
                setStep('input');
            }
        } catch (e) {
            toast.error('Error al analizar la lista.');
            setStep('input');
        }
    };

    const handleImportAll = async () => {
        setStep('importing');
        let successCount = 0;

        for (let i = 0; i < candidates.length; i++) {
            const item = candidates[i];
            try {
                // Adapt item to form data structure if needed, or update createInstrument to accept JSON
                // Ideally createInstrument accepts a FormData object usually.
                const formData = new FormData();
                formData.append('brand', item.brand || 'Unknown');
                formData.append('model', item.model || 'Unknown Model');
                formData.append('type', item.type || 'Other');
                if (item.year) formData.append('year', item.year.toString());
                if (item.description) formData.append('description', item.description);
                if (item.specs) formData.append('specs', JSON.stringify(item.specs));

                const res = await createInstrument(formData);

                if (!res.success) {
                    throw new Error(res.error || 'Unknown error creating instrument');
                }
                successCount++;
            } catch (e: any) {
                console.error(`Failed to import ${item.brand} ${item.model}`, e);
                toast.error(`Error importing ${item.brand} ${item.model}: ${e.message}`);
            }
            setImportProgress(Math.round(((i + 1) / candidates.length) * 100));
        }

        toast.success(`Importados ${successCount} de ${candidates.length} instrumentos.`);
        setStep('input');
        setRawText('');
        setCandidates([]);
        if (onComplete) onComplete();
    };

    const handleRemove = (index: number) => {
        const newCandidates = [...candidates];
        newCandidates.splice(index, 1);
        setCandidates(newCandidates);
    };

    return (
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
            <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-green-100 text-green-600 rounded-lg">
                    <ListPlus size={24} />
                </div>
                <div>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">Importación Masiva</h2>
                    <p className="text-xs text-gray-500">Pega una lista y la IA hará el resto.</p>
                </div>
            </div>

            {step === 'input' && (
                <div className="space-y-4">
                    <textarea
                        value={rawText}
                        onChange={(e) => setRawText(e.target.value)}
                        placeholder="Ej: Fender Stratocaster 1954 (Sunburst)&#10;Gibson Les Paul Standard&#10;Yamaha DX7..."
                        className="w-full h-40 p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-black/20 text-sm font-mono focus:ring-2 focus:ring-green-500 outline-none resize-none"
                    />
                    <Button
                        onClick={handleParse}
                        disabled={!rawText.trim()}
                        className="w-full bg-green-600 hover:bg-green-700 text-white"
                    >
                        Procesar Lista
                    </Button>
                </div>
            )}

            {step === 'processing' && (
                <div className="py-12 flex flex-col items-center justify-center text-center">
                    <Loader2 className="w-8 h-8 text-green-500 animate-spin mb-2" />
                    <p className="text-sm font-medium text-gray-600">Analizando lista...</p>
                </div>
            )}

            {step === 'review' && (
                <div className="space-y-4">
                    <div className="max-h-[300px] overflow-y-auto border border-gray-100 dark:border-gray-800 rounded-xl">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 dark:bg-gray-800 text-gray-500 font-medium">
                                <tr>
                                    <th className="px-4 py-2">Marca</th>
                                    <th className="px-4 py-2">Modelo</th>
                                    <th className="px-4 py-2">Tipo</th>
                                    <th className="px-4 py-2 w-10"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                {candidates.map((item, idx) => (
                                    <tr key={idx} className="group hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                        <td className="px-4 py-2 font-medium">{item.brand}</td>
                                        <td className="px-4 py-2">{item.model}</td>
                                        <td className="px-4 py-2 text-gray-500">{item.type}</td>
                                        <td className="px-4 py-2 text-right">
                                            <button
                                                onClick={() => handleRemove(idx)}
                                                className="text-gray-400 hover:text-red-500 transition-colors"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="secondary" onClick={() => setStep('input')} className="flex-1">Cancelar</Button>
                        <Button onClick={handleImportAll} className="flex-1 bg-green-600 hover:bg-green-700 text-white">
                            Importar {candidates.length} Ítems
                        </Button>
                    </div>
                </div>
            )}

            {step === 'importing' && (
                <div className="space-y-4 py-8">
                    <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2.5 overflow-hidden">
                        <div
                            className="bg-green-500 h-2.5 rounded-full transition-all duration-300"
                            style={{ width: `${importProgress}%` }}
                        />
                    </div>
                    <p className="text-center text-sm font-medium text-gray-600">
                        Guardando en catálogo... {importProgress}%
                    </p>
                </div>
            )}
        </div>
    );
}
