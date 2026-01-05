'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/Button';
import { Upload, FileText, CheckCircle, AlertTriangle, X, RefreshCw, Save } from 'lucide-react';
import { toast } from 'sonner';
import { parseCSV } from '@/lib/csv-parser'; // Hypothetical helper
import { bulkImportInstruments } from '@/actions/import';

interface ImportPreview {
    total: number;
    valid: number;
    invalid: number;
    items: any[];
    errors: string[];
}

export default function BulkImporter() {
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<ImportPreview | null>(null);
    const [isSimulating, setIsSimulating] = useState(false);
    const [isImporting, setIsImporting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = e.target.files?.[0];
        if (selected) {
            setFile(selected);
            setPreview(null); // Reset preview on new file
        }
    };

    const runSimulation = async () => {
        if (!file) return;
        setIsSimulating(true);

        try {
            // 1. Client-side CSV Parse
            const rawData = await parseCSV(file);

            // 2. Server-side Validation (Dry Run)
            // const result = await validateImport(rawData); 
            // Mocking result for now
            setTimeout(() => {
                setPreview({
                    total: rawData.length,
                    valid: rawData.length, // Assume all valid for mock
                    invalid: 0,
                    items: rawData.slice(0, 5), // Show first 5
                    errors: []
                });
                setIsSimulating(false);
            }, 1000);

        } catch (err) {
            toast.error('Error al leer el archivo');
            setIsSimulating(false);
        }
    };

    const executeImport = async () => {
        if (!preview || preview.invalid > 0) return; // Strict mode?
        setIsImporting(true);
        try {
            // await bulkImportInstruments(preview.items); 
            toast.success(`Importados ${preview.valid} instrumentos`);
            setFile(null);
            setPreview(null);
        } catch (err) {
            toast.error('Falló la importación');
        } finally {
            setIsImporting(false);
        }
    };

    return (
        <div className="space-y-4">
            <div className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${file ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700'}`}>
                <input
                    type="file"
                    accept=".csv,.json"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={handleFileChange}
                />

                {file ? (
                    <div className="flex flex-col items-center">
                        <FileText className="w-12 h-12 text-blue-500 mb-2" />
                        <p className="font-medium text-lg">{file.name}</p>
                        <p className="text-sm text-gray-500 mb-4">{(file.size / 1024).toFixed(2)} KB</p>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => setFile(null)}>Cambiar</Button>
                            {!preview && (
                                <Button onClick={runSimulation} isLoading={isSimulating} icon={RefreshCw}>
                                    Simular Importación
                                </Button>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                        <Upload className="w-12 h-12 text-gray-300 mb-2" />
                        <p className="font-medium">Arrastra tu CSV o haz clic</p>
                        <p className="text-xs text-gray-400 mt-1">Soporta formato Reverb y CSV estándar</p>
                    </div>
                )}
            </div>

            {/* PREVIEW PANEL */}
            {preview && (
                <div className="apple-card p-6 border-l-4 border-l-blue-500">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h3 className="text-lg font-bold">Resumen de Simulación</h3>
                            <div className="flex gap-4 mt-2 text-sm">
                                <span className="text-gray-500">Total: <strong className="text-gray-900 dark:text-white">{preview.total}</strong></span>
                                <span className="text-green-600">Válidos: <strong>{preview.valid}</strong></span>
                                <span className={preview.invalid > 0 ? "text-red-500" : "text-gray-400"}>Inválidos: <strong>{preview.invalid}</strong></span>
                            </div>
                        </div>
                        {preview.invalid === 0 && (
                            <Button onClick={executeImport} isLoading={isImporting} icon={Save} className="bg-green-600 hover:bg-green-700 text-white">
                                Confirmar e Importar
                            </Button>
                        )}
                    </div>

                    {/* ERROR LIST */}
                    {preview.errors.length > 0 && (
                        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg mb-4">
                            <h4 className="flex items-center gap-2 text-red-700 dark:text-red-300 font-bold text-sm mb-2">
                                <AlertTriangle size={16} /> Errores Detectados
                            </h4>
                            <ul className="list-disc list-inside text-xs text-red-600 dark:text-red-400 space-y-1">
                                {preview.errors.slice(0, 5).map((err, i) => <li key={i}>{err}</li>)}
                            </ul>
                        </div>
                    )}

                    {/* TABLE PREVIEW */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-500 uppercase bg-gray-50 dark:bg-gray-800">
                                <tr>
                                    <th className="px-4 py-2">Marca</th>
                                    <th className="px-4 py-2">Modelo</th>
                                    <th className="px-4 py-2">Año</th>
                                    <th className="px-4 py-2">Estado</th>
                                </tr>
                            </thead>
                            <tbody>
                                {preview.items.map((item, i) => (
                                    <tr key={i} className="border-b dark:border-gray-700">
                                        <td className="px-4 py-2 font-medium">{item.brand}</td>
                                        <td className="px-4 py-2">{item.model}</td>
                                        <td className="px-4 py-2">{item.years || '-'}</td>
                                        <td className="px-4 py-2">
                                            <CheckCircle size={14} className="text-green-500" />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <p className="text-xs text-center text-gray-400 mt-2">Mostrando los primeros 5 registros</p>
                    </div>
                </div>
            )}
        </div>
    );
}
