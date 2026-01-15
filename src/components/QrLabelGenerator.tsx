
'use client';

import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';
import { Button } from '@/components/ui/Button';
import { Printer } from 'lucide-react';
import { toast } from 'sonner';

interface QrLabelGeneratorProps {
    instrumentId: string;
    brand: string;
    model: string;
    year?: string;
    location?: string;
    serial?: string;
}

export default function QrLabelGenerator({
    instrumentId,
    brand,
    model,
    year,
    location,
    serial
}: QrLabelGeneratorProps) {

    const generateLabel = async () => {
        try {
            const doc = new jsPDF({
                orientation: 'landscape',
                unit: 'mm',
                format: [50, 30] // Standard jewelry/small label size 50mm x 30mm
            });

            // Generate QR Code
            const qrUrl = `${window.location.origin}/instruments/${instrumentId}`;
            const qrDataUrl = await QRCode.toDataURL(qrUrl, { margin: 0 });

            // Layout
            // QR Code on the left
            doc.addImage(qrDataUrl, 'PNG', 2, 2, 26, 26);

            // Text on the right
            doc.setFontSize(8);
            doc.setFont("helvetica", "bold");
            doc.text(brand.substring(0, 15).toUpperCase(), 30, 6);

            doc.setFontSize(7);
            doc.setFont("helvetica", "normal");
            // Multi-line model to wrap
            const modelLines = doc.splitTextToSize(model, 18);
            doc.text(modelLines, 30, 10);

            if (year) {
                doc.setFontSize(6);
                doc.text(`Year: ${year}`, 30, 18);
            }

            if (location) {
                doc.setFontSize(5);
                doc.text(`Loc: ${location.substring(0, 15)}`, 30, 22);
            }

            if (serial) {
                doc.setFontSize(5);
                doc.text(`S/N: ${serial}`, 30, 26);
            }

            // Save
            doc.save(`${brand}_${model}_Label.pdf`);
            toast.success("Etiqueta generada correctamente");

        } catch (error) {
            console.error("Error generating label", error);
            toast.error("Error al generar la etiqueta");
        }
    };

    return (
        <Button
            onClick={generateLabel}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
        >
            <Printer size={16} />
            Imprimir Etiqueta
        </Button>
    );
}
