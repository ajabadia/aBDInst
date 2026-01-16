'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { FileText, Download, Loader2, ShieldCheck } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { toast } from 'sonner';

interface ReportsSectionProps {
    collection: any[]; // Full collection data
}

export default function ReportsSection({ collection }: ReportsSectionProps) {
    const [isGenerating, setIsGenerating] = useState(false);

    const generatePDF = async () => {
        setIsGenerating(true);
        try {
            const doc = new jsPDF();

            // --- HEADER ---
            doc.setFontSize(20);
            doc.text("Reporte de Inventario / Seguro", 14, 22);

            doc.setFontSize(10);
            doc.setTextColor(100);
            doc.text(`Generado el: ${new Date().toLocaleDateString()} a las ${new Date().toLocaleTimeString()}`, 14, 28);
            doc.text("Instrument Collector App", 14, 33);

            // --- SUMMARY ---
            const totalItems = collection.length;
            const totalValue = collection.reduce((acc, item) => acc + (item.acquisition?.price || 0), 0);
            const currency = collection[0]?.acquisition?.currency || 'EUR';

            doc.setDrawColor(200);
            doc.line(14, 40, 196, 40);

            doc.setFontSize(12);
            doc.setTextColor(0);
            doc.text(`Total Ítems: ${totalItems}`, 14, 50);
            doc.text(`Valor Total Estimado: ${new Intl.NumberFormat('es-ES', { style: 'currency', currency }).format(totalValue)}`, 14, 56);

            doc.setFontSize(9);
            doc.setTextColor(150);
            doc.text("* Valor basado en precio de compra/declarado. No constituye tasación oficial.", 14, 62);

            // --- TABLE ---
            const tableData = collection.map(item => [
                `${item.instrumentId?.brand} ${item.instrumentId?.model}`, // Item
                item.instrumentId?.type || 'Misc', // Tipo
                item.instrumentId?.year || 'N/A', // Año
                item.serialNumber || '---', // S/N
                item.status || 'Active', // Estado
                item.acquisition?.price ? new Intl.NumberFormat('es-ES', { style: 'currency', currency: item.acquisition.currency }).format(item.acquisition.price) : '---' // Valor
            ]);

            autoTable(doc, {
                startY: 70,
                head: [['Instrumento', 'Tipo', 'Año', 'Nº Serie', 'Estado', 'Valor Decl.']],
                body: tableData,
                theme: 'striped',
                headStyles: { fillColor: [0, 0, 0] }, // Black header
                styles: { fontSize: 9 },
                alternateRowStyles: { fillColor: [245, 245, 245] }
            });

            // --- FOOTER ---
            const pageCount = (doc as any).internal.getNumberOfPages();
            for (let i = 1; i <= pageCount; i++) {
                doc.setPage(i);
                doc.setFontSize(8);
                doc.setTextColor(150);
                doc.text(`Página ${i} de ${pageCount} - Documento generado digitalmente por Instrument Collector`, 105, 290, { align: 'center' });
            }

            // --- HASH/SIGNATURE (Mock) ---
            const hash = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
            doc.text(`Digital ID: ${hash.toUpperCase()}`, 14, 285);

            doc.save(`Inventario_Seguro_${new Date().toISOString().split('T')[0]}.pdf`);
            toast.success("Reporte PDF descargado");

        } catch (error) {
            console.error(error);
            toast.error("Error al generar el PDF");
        }
        setIsGenerating(false);
    };

    return (
        <div className="apple-card p-6 bg-white dark:bg-white/5 space-y-4">
            <div className="flex items-start justify-between">
                <div>
                    <h3 className="text-lg font-bold flex items-center gap-2">
                        <ShieldCheck className="text-ios-blue" size={20} />
                        Reportes para Seguros
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-sm">
                        Genera un documento PDF oficial con tu inventario completo, números de serie y valoración total para tu póliza.
                    </p>
                </div>
                <Button
                    variant="outline"
                    onClick={generatePDF}
                    disabled={isGenerating || collection.length === 0}
                    icon={isGenerating ? Loader2 : Download}
                >
                    {isGenerating ? 'Generando...' : 'Descargar PDF'}
                </Button>
            </div>
        </div>
    );
}
