import { NextRequest, NextResponse } from 'next/server';
import { getUserCollection } from '@/actions/collection';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export async function GET(req: NextRequest) {
    try {
        const collection = await getUserCollection();

        if (!collection || collection.length === 0) {
            return new NextResponse('No data found', { status: 404 });
        }

        // Initialize jsPDF
        const doc = new jsPDF();

        doc.text('Mi Colección de Instrumentos', 14, 20);
        doc.setFontSize(10);
        doc.text(`Generado el: ${new Date().toLocaleDateString()}`, 14, 28);

        const tableData = collection.map((item: any) => [
            `${item.instrumentId.brand} ${item.instrumentId.model}`,
            item.instrumentId.type,
            item.status,
            item.condition,
            item.serialNumber || '-',
            item.acquisition?.date ? new Date(item.acquisition.date).toLocaleDateString() : '-',
            item.acquisition?.price ? `${item.acquisition.price} EUR` : '-'
        ]);

        autoTable(doc, {
            startY: 35,
            head: [['Instrumento', 'Tipo', 'Estado', 'Condición', 'S/N', 'Adquirido', 'Precio']],
            body: tableData,
            styles: { fontSize: 8 },
            headStyles: { fillColor: [37, 99, 235] } // Blue-600
        });

        const pdfBuffer = doc.output('arraybuffer');

        return new NextResponse(pdfBuffer, {
            status: 200,
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': 'attachment; filename="mi_coleccion.pdf"',
            },
        });
    } catch (error) {
        console.error('PDF Export Error:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
