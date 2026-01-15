import { NextRequest, NextResponse } from 'next/server';
import { getUserCollection } from '@/actions/collection';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    try {
        const collection = await getUserCollection();

        if (!collection || collection.length === 0) {
            return new NextResponse('No data found', { status: 404 });
        }

        const headers = ['Marca', 'Modelo', 'Tipo', 'Estado', 'Condición', 'Número Serie', 'Fecha Adquisición', 'Precio'];
        const csvContent = [
            headers.join(','),
            ...collection.map((item: any) => {
                const row = [
                    `"${item.instrumentId.brand}"`,
                    `"${item.instrumentId.model}"`,
                    `"${item.instrumentId.type}"`,
                    item.status,
                    item.condition,
                    item.serialNumber || '',
                    item.acquisition?.date ? new Date(item.acquisition.date).toLocaleDateString() : '',
                    item.acquisition?.price || ''
                ];
                return row.join(',');
            })
        ].join('\n');

        // Add BOM for Excel compatibility
        const bom = '\uFEFF';
        const finalCsv = bom + csvContent;

        return new NextResponse(finalCsv, {
            status: 200,
            headers: {
                'Content-Type': 'text/csv; charset=utf-8',
                'Content-Disposition': 'attachment; filename="mi_coleccion_instrumentos.csv"',
            },
        });
    } catch (error) {
        console.error('CSV Export Error:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
