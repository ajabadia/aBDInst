'use client';

import { useState } from 'react';
import { Upload, X, CheckCircle2, AlertCircle, Loader2, Sparkles, Filter } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { batchImportArtists } from '@/actions/metadata';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface BatchImportResult {
    name: string;
    status: 'created' | 'exists' | 'error';
    error?: string;
    artistId?: string;
}

export default function BatchArtistImporter({ onClose }: { onClose: () => void }) {
    const [rawList, setRawList] = useState('');
    const [isImporting, setIsImporting] = useState(false);
    const [results, setResults] = useState<BatchImportResult[] | null>(null);

    const handleCleanList = () => {
        // Remove common messy patterns from copy-pasted lists
        const cleaned = rawList
            .split('\n')
            .map(line => {
                // 1. Remove track numbers (e.g. "01 - ", "1. ")
                let clean = line.replace(/^\d+[\s.-]*/, '');
                // 2. Remove common role suffixes (e.g. " (vocals)", " [drums]")
                clean = clean.replace(/\s*[([].*?[\])]\s*$/, '');
                // 3. Trim
                return clean.trim();
            })
            .filter(line => line.length > 2)
            .join('\n');

        setRawList(cleaned);
        toast.success('Lista normalizada');
    };

    const handleImport = async () => {
        if (!rawList.trim()) return;

        setIsImporting(true);
        setResults(null);

        try {
            const res = await batchImportArtists(rawList);
            if (res.success && res.results) {
                setResults(res.results);
                const created = res.results.filter(r => r.status === 'created').length;
                toast.success(`Importación completa: ${created} nuevos artistas creados`);
            } else {
                toast.error(res.error || 'Error en la importación');
            }
        } catch (error) {
            toast.error('Error al conectar con el servidor');
        } finally {
            setIsImporting(false);
        }
    };

    return (
        <div className="flex flex-col h-full space-y-6">
            <div className="space-y-1">
                <h3 className="text-xl font-bold tracking-tight">Importación Masiva</h3>
                <p className="text-sm text-gray-500">Pega una lista de artistas (uno por línea o separados por comas).</p>
            </div>

            <div className="flex-1 min-h-[300px] relative">
                <textarea
                    autoFocus
                    placeholder="Pink Floyd&#10;Depeche Mode&#10;Massive Attack..."
                    value={rawList}
                    onChange={(e) => setRawList(e.target.value)}
                    disabled={isImporting || results !== null}
                    className="w-full h-full apple-input-field p-6 font-mono text-sm resize-none focus:ring-ios-blue/30"
                />

                {results === null && !isImporting && rawList.length > 0 && (
                    <Button
                        size="sm"
                        variant="secondary"
                        onClick={handleCleanList}
                        icon={Filter}
                        className="absolute bottom-4 right-4 rounded-full bg-white/50 backdrop-blur-md shadow-sm"
                    >
                        Limpiar Formato
                    </Button>
                )}
            </div>

            {results && (
                <div className="max-h-[300px] overflow-y-auto rounded-3xl border border-black/5 dark:border-white/5 bg-black/[0.02] dark:bg-white/[0.02] p-4 space-y-2">
                    {results.map((res, i) => (
                        <div key={i} className="flex items-center justify-between p-3 bg-white dark:bg-white/5 rounded-2xl shadow-sm border border-black/5 dark:border-white/5">
                            <div className="flex items-center gap-3">
                                {res.status === 'created' ? (
                                    <CheckCircle2 className="w-5 h-5 text-ios-green" />
                                ) : res.status === 'exists' ? (
                                    <Sparkles className="w-5 h-5 text-ios-blue" />
                                ) : (
                                    <AlertCircle className="w-5 h-5 text-ios-red" />
                                )}
                                <div>
                                    <p className="text-sm font-bold">{res.name}</p>
                                    {res.error && (
                                        <p className="text-[10px] text-ios-red font-medium leading-none mt-0.5">{res.error}</p>
                                    )}
                                </div>
                            </div>

                            {(res.status === 'created' || res.status === 'exists') && res.artistId && (
                                <Link
                                    href={`/catalog/artists/${res.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                                    className="text-[10px] font-bold text-ios-blue hover:underline uppercase tracking-widest"
                                    target="_blank"
                                >
                                    Ver Perfil
                                </Link>
                            )}

                            {res.status === 'exists' && (
                                <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Ya existe</span>
                            )}
                        </div>
                    ))}
                </div>
            )}

            <div className="flex gap-4 pt-4 border-t border-black/5 dark:border-white/5">
                <Button
                    variant="secondary"
                    onClick={results ? () => setResults(null) : onClose}
                    className="flex-1 rounded-2xl"
                    disabled={isImporting}
                >
                    {results ? 'Nueva Importación' : 'Cancelar'}
                </Button>

                {results === null && (
                    <Button
                        onClick={handleImport}
                        disabled={isImporting || !rawList.trim()}
                        className="flex-1 shadow-apple-glow rounded-2xl"
                        icon={isImporting ? Loader2 : Sparkles}
                    >
                        {isImporting ? 'Procesando...' : 'Iniciar Importación'}
                    </Button>
                )}
            </div>
        </div>
    );
}
