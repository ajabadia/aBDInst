'use client';

import React, { useState } from 'react';
import {
    FileSpreadsheet, Database,
    ShieldCheck, Download,
    FileJson, Loader2, ArrowRight
} from 'lucide-react';
import { Button } from '../ui/Button';
import { toast } from 'sonner';

/**
 * Data Export & Portability dashboard widget.
 * Features Apple-style grid layout for different export options.
 */
export default function ExportTools() {
    const [downloadingFormat, setDownloadingFormat] = useState<string | null>(null);

    const handleDownload = async (format: 'csv' | 'json') => {
        setDownloadingFormat(format);
        toast.info(`Generando archivo ${format.toUpperCase()}...`);

        try {
            // Trigger download via API route
            window.location.href = `/api/export?format=${format}`;
            toast.success('Descarga iniciada');
        } catch (err) {
            toast.error('Error al generar la descarga');
        } finally {
            setDownloadingFormat(null);
        }
    };

    const exportOptions = [
        {
            id: 'csv',
            title: 'Hoja de Cálculo',
            desc: 'Exporta tu colección a CSV para usar en Excel o Google Sheets.',
            icon: FileSpreadsheet,
            color: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
            action: () => handleDownload('csv')
        },
        {
            id: 'json',
            title: 'Copia de Seguridad',
            desc: 'Un volcado completo en JSON para portabilidad total de datos.',
            icon: FileJson,
            color: 'bg-ios-blue/10 text-ios-blue',
            action: () => handleDownload('json')
        },
        {
            id: 'insurance',
            title: 'Informe de Seguro',
            desc: 'Genera un resumen profesional optimizado para reclamaciones.',
            icon: ShieldCheck,
            color: 'bg-ios-orange/10 text-ios-orange',
            action: () => window.open('/api/export?format=insurance', '_blank')
        }
    ];

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {exportOptions.map((opt) => (
                    <div
                        key={opt.id}
                        className="apple-card p-6 bg-white dark:bg-zinc-900/40 border border-black/5 dark:border-white/5 shadow-sm hover:shadow-apple-md transition-all flex flex-col justify-between"
                    >
                        <div className="space-y-4">
                            <div className={`p-3 rounded-2xl w-fit ${opt.color}`}>
                                <opt.icon size={24} />
                            </div>
                            <div>
                                <h4 className="font-bold text-lg">{opt.title}</h4>
                                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mt-1">
                                    {opt.desc}
                                </p>
                            </div>
                        </div>

                        <div className="mt-6 pt-4 border-t border-black/5 dark:border-white/5">
                            <Button
                                variant="ghost"
                                className="w-full justify-between items-center group px-0 border-none hover:bg-transparent"
                                onClick={opt.action}
                                disabled={downloadingFormat === opt.id}
                            >
                                <span className="text-sm font-bold text-gray-900 dark:text-white">
                                    {downloadingFormat === opt.id ? 'Procesando...' : 'Descargar'}
                                </span>
                                {downloadingFormat === opt.id ? (
                                    <Loader2 size={18} className="animate-spin text-ios-blue" />
                                ) : (
                                    <Download size={18} className="text-ios-blue group-hover:translate-y-0.5 transition-transform" />
                                )}
                            </Button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Info Callout */}
            <div className="p-4 bg-ios-blue/5 border border-ios-blue/10 rounded-2xl flex items-start gap-3">
                <Database size={18} className="text-ios-blue shrink-0 mt-0.5" />
                <p className="text-xs text-ios-blue/70 leading-relaxed">
                    Tu privacidad y la propiedad de tus datos son nuestra prioridad.
                    Las exportaciones se generan en tiempo real y no se almacenan copias adicionales en nuestros servidores.
                    Recomendamos realizar una copia de seguridad JSON al menos una vez al mes.
                </p>
            </div>
        </div>
    );
}
