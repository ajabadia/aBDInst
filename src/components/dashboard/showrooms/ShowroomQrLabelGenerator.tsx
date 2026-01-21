'use client';

import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';
import { Button } from '@/components/ui/Button';
import { Printer } from 'lucide-react';
import { toast } from 'sonner';

interface ShowroomItem {
    collectionId: {
        instrumentId?: {
            _id: string;
            brand: string;
            model: string;
            year?: string;
        };
        albumId?: {
            _id: string;
            artist: string;
            title: string;
            year?: string;
        };
        _id: string;
    };
    itemType: 'instrument' | 'music';
}

interface ShowroomQrLabelGeneratorProps {
    showroomName: string;
    items: ShowroomItem[];
}

export default function ShowroomQrLabelGenerator({ showroomName, items }: ShowroomQrLabelGeneratorProps) {

    const generateAllLabels = async () => {
        if (!items.length) {
            toast.error("El showroom no tiene ítems");
            return;
        }

        const id = toast.loading("Generando etiquetas...");

        try {
            const doc = new jsPDF({
                orientation: 'landscape',
                unit: 'mm',
                format: [50, 30] // Standard jewelry/small label size 50mm x 30mm
            });

            const baseUrl = window.location.origin;

            for (let i = 0; i < items.length; i++) {
                const item = items[i];
                if (i > 0) doc.addPage([50, 30], 'landscape');

                // Data Extraction
                let title = '';
                let subtitle = '';
                let year = '';
                let qrUrl = '';

                if (item.itemType === 'instrument' && item.collectionId.instrumentId) {
                    const inst = item.collectionId.instrumentId;
                    title = inst.brand;
                    subtitle = inst.model;
                    year = inst.year || '';
                    qrUrl = `${baseUrl}/instruments/${inst._id || (item.collectionId as any)._id}`;
                } else if (item.itemType === 'music' && item.collectionId.albumId) {
                    const album = item.collectionId.albumId;
                    title = album.artist;
                    subtitle = album.title;
                    year = album.year || '';
                    qrUrl = `${baseUrl}/dashboard/music`; // Placeholder for music detail if exists
                }

                // Generate QR Code
                const qrDataUrl = await QRCode.toDataURL(qrUrl, { margin: 0 });

                // Layout
                // QR Code on the left
                doc.addImage(qrDataUrl, 'PNG', 2, 2, 26, 26);

                // Text on the right
                doc.setFontSize(8);
                doc.setFont("helvetica", "bold");
                doc.text(title.substring(0, 15).toUpperCase(), 30, 6);

                doc.setFontSize(7);
                doc.setFont("helvetica", "normal");
                const subtitleLines = doc.splitTextToSize(subtitle, 18);
                doc.text(subtitleLines, 30, 10);

                if (year) {
                    doc.setFontSize(6);
                    doc.text(`Year: ${year}`, 30, 22);
                }

                doc.setFontSize(4);
                doc.setTextColor(150);
                doc.text(showroomName.substring(0, 25), 30, 27);
                doc.setTextColor(0);
            }

            // Save
            doc.save(`Labels_${showroomName.replace(/\s+/g, '_')}.pdf`);
            toast.dismiss(id);
            toast.success("PDF generado con éxito");

        } catch (error) {
            console.error("Error generating labels", error);
            toast.dismiss(id);
            toast.error("Error al generar las etiquetas");
        }
    };

    return (
        <Button
            onClick={generateAllLabels}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
            icon={Printer}
        >
            Etiquetas QR
        </Button>
    );
}
