import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import QRCode from 'qrcode';

interface PDFData {
    id: string;
    brand: string;
    model: string;
    type: string;
    year?: string | number;
    description?: string;
    specs?: any[];
    marketValue?: any;
    genericImages?: string[];
}

export async function generateInstrumentPDF(data: PDFData) {
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
    });

    const margin = 20;
    const pageWidth = doc.internal.pageSize.getWidth();
    let currentY = 20;

    // --- HEADER ---
    doc.setFontSize(10);
    doc.setTextColor(150);
    doc.text('CATÁLOGO MAESTRO / FICHA TÉCNICA', margin, currentY);
    
    currentY += 10;
    doc.setFontSize(28);
    doc.setTextColor(0);
    doc.setFont('helvetica', 'bold');
    doc.text(`${data.brand}`.toUpperCase(), margin, currentY);
    
    currentY += 10;
    doc.setFontSize(22);
    doc.setFont('helvetica', 'normal');
    doc.text(data.model, margin, currentY);

    currentY += 15;

    // --- IMAGE & BASIC INFO ---
    const imageUrl = data.genericImages?.[0];
    if (imageUrl) {
        try {
            // Note: In a real environment, images must allow CORS or be proxied
            doc.addImage(imageUrl, 'JPEG', margin, currentY, 60, 45);
        } catch (e) {
            doc.setDrawColor(230);
            doc.rect(margin, currentY, 60, 45);
            doc.setFontSize(8);
            doc.text('Imagen referencial', margin + 15, currentY + 22);
        }
    }

    const infoX = imageUrl ? 90 : margin;
    doc.setFontSize(10);
    doc.setTextColor(0);
    doc.setFont('helvetica', 'bold');
    doc.text('TIPO:', infoX, currentY);
    doc.setFont('helvetica', 'normal');
    doc.text(data.type || 'N/A', infoX + 25, currentY);

    currentY += 7;
    doc.setFont('helvetica', 'bold');
    doc.text('AÑO:', infoX, currentY);
    doc.setFont('helvetica', 'normal');
    doc.text(String(data.year || 'N/A'), infoX + 25, currentY);

    // --- MARKET VALUE SECTION ---
    if (data.marketValue?.current) {
        currentY += 15;
        doc.setFillColor(248, 249, 250);
        doc.rect(infoX, currentY - 5, 100, 25, 'F');
        
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text('VALOR DE MERCADO ESTIMADO:', infoX + 5, currentY + 2);
        
        doc.setFontSize(14);
        doc.setTextColor(0, 128, 0); // Success Green
        const price = `${data.marketValue.current.value || 0} ${data.marketValue.current.currency || 'EUR'}`;
        doc.text(price, infoX + 5, currentY + 12);
        
        doc.setFontSize(8);
        doc.setTextColor(100);
        const range = `Rango: ${data.marketValue.current.min || '-'} a ${data.marketValue.current.max || '-'} ${data.marketValue.current.currency}`;
        doc.text(range, infoX + 5, currentY + 18);
        doc.setTextColor(0);
    }

    currentY = imageUrl ? Math.max(currentY + 25, 95) : currentY + 30;

    // --- DESCRIPTION ---
    if (data.description) {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('DESCRIPCIÓN', margin, currentY);
        currentY += 5;
        doc.setFont('helvetica', 'normal');
        const splitDesc = doc.splitTextToSize(data.description, pageWidth - (margin * 2));
        doc.text(splitDesc, margin, currentY);
        currentY += (splitDesc.length * 5) + 10;
    }

    // --- SPECS TABLE ---
    if (data.specs && data.specs.length > 0) {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('ESPECIFICACIONES TÉCNICAS', margin, currentY);
        
        autoTable(doc, {
            startY: currentY + 2,
            head: [['Categoría', 'Propiedad', 'Valor']],
            body: data.specs.map(s => [s.category, s.label, s.value]),
            margin: { left: margin },
            styles: { fontSize: 9, cellPadding: 3 },
            headStyles: { fillColor: [33, 37, 41] },
            alternateRowStyles: { fillColor: [250, 250, 250] }
        });
        
        // Update currentY to position after table
        currentY = (doc as any).lastAutoTable.finalY + 15;
    }

    // --- QR CODE GENERATION ---
    try {
        const publicUrl = `${window.location.origin}/instruments/${data.id || ''}`;
        const qrDataUrl = await QRCode.toDataURL(publicUrl, { margin: 1, width: 100 });
        
        // Draw QR at the bottom right of the current content or next page
        if (currentY > 240) {
            doc.addPage();
            currentY = 20;
        }
        
        const qrSize = 30;
        doc.addImage(qrDataUrl, 'PNG', pageWidth - margin - qrSize, currentY, qrSize, qrSize);
        
        doc.setFontSize(7);
        doc.setTextColor(150);
        doc.text('Escanea para ver la', pageWidth - margin - qrSize, currentY + qrSize + 4);
        doc.text('ficha actualizada online', pageWidth - margin - qrSize, currentY + qrSize + 7);
    } catch (e) {
        console.error("QR Generation failed", e);
    }

    // --- FOOTER ---
    const pageCount = (doc as any).internal.pages.length - 1; // Correct way to get page count
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(`Generado el ${new Date().toLocaleDateString()} - Instrument Collector`, margin, 285);
        doc.text(`Página ${i} de ${pageCount}`, pageWidth - margin - 20, 285);
    }

    // --- ROBUST DOWNLOAD ---
    const safeBrand = data.brand.replace(/[^a-z0-9]/gi, '_');
    const safeModel = data.model.replace(/[^a-z0-9]/gi, '_');
    const filename = `ficha_${safeBrand}_${safeModel}.pdf`.toLowerCase();
    
    const blob = doc.output('blob');
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    
    setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }, 200);

    return { success: true, filename };
}
