import { NextRequest, NextResponse } from 'next/server';
import { getCollectionExportCSV, getCollectionExportJSON } from '@/actions/export';
import { auth } from '@/auth';

export const dynamic = 'force-dynamic';

/**
 * GET /api/export
 * Query Params: format = csv | json
 */
export async function GET(req: NextRequest) {
    const session = await auth();
    if (!session?.user?.id) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const format = searchParams.get('format') || 'csv';

    try {
        if (format === 'csv') {
            const csvData = await getCollectionExportCSV();
            return new NextResponse(csvData, {
                headers: {
                    'Content-Type': 'text/csv',
                    'Content-Disposition': `attachment; filename=instrument-collection-${new Date().toISOString().split('T')[0]}.csv`,
                },
            });
        }

        if (format === 'json') {
            const jsonData = await getCollectionExportJSON();
            return new NextResponse(jsonData, {
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Disposition': `attachment; filename=instrument-collection-backup-${new Date().toISOString().split('T')[0]}.json`,
                },
            });
        }

        if (format === 'insurance') {
            const { generateInsuranceSummary } = await import('@/actions/reports');
            const data = await generateInsuranceSummary();

            // Simple HTML Template for printing
            const html = `
                <html>
                <head>
                    <title>Informe de Seguro - ${data.owner}</title>
                    <style>
                        body { font-family: -apple-system, system-ui, sans-serif; padding: 40px; color: #333; }
                        h1 { font-size: 32px; border-bottom: 2px solid #000; padding-bottom: 10px; }
                        .stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin: 40px 0; background: #f9f9f9; padding: 20px; border-radius: 10px; }
                        .stat-item { text-align: center; }
                        .stat-label { font-size: 10px; text-transform: uppercase; color: #888; letter-spacing: 1px; }
                        .stat-val { font-size: 20px; font-weight: bold; }
                        table { width: 100%; border-collapse: collapse; margin-top: 40px; }
                        th { text-align: left; font-size: 12px; text-transform: uppercase; border-bottom: 1px solid #ddd; padding: 10px; }
                        td { padding: 15px 10px; border-bottom: 1px solid #eee; font-size: 14px; }
                        .item-img { width: 60px; height: 60px; object-fit: cover; border-radius: 8px; }
                        @media print { .no-print { display: none; } }
                    </style>
                </head>
                <body>
                    <div class="no-print" style="margin-bottom: 20px;">
                        <button onclick="window.print()" style="padding: 10px 20px; background: #007aff; color: white; border: none; border-radius: 8px; cursor: pointer;">Imprimir Informe</button>
                    </div>
                    <h1>Informe de Propiedad e Inventario</h1>
                    <p><strong>Propietario:</strong> ${data.owner}</p>
                    <p><strong>Fecha del Informe:</strong> ${data.date}</p>

                    <div class="stats">
                        <div class="stat-item">
                            <div class="stat-label">Unidades</div>
                            <div class="stat-val">${data.stats.itemCount}</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-label">Inversión Total</div>
                            <div class="stat-val">${data.stats.totalAcquisitionValue.toLocaleString()} ${data.stats.currency}</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-label">Valor Mercado Est.</div>
                            <div class="stat-val">${data.stats.totalEstimatedMarketValue.toLocaleString()} ${data.stats.currency}</div>
                        </div>
                    </div>

                    <table>
                        <thead>
                            <tr>
                                <th>Imagen</th>
                                <th>Instrumento</th>
                                <th>Nº Serie</th>
                                <th>Estado</th>
                                <th>Valor Est.</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${data.items.map(item => `
                                <tr>
                                    <td><img src="${item.primaryImage}" class="item-img" /></td>
                                    <td><strong>${item.brand}</strong> ${item.model}</td>
                                    <td><code>${item.serialNumber || 'N/A'}</code></td>
                                    <td>${item.condition}</td>
                                    <td>${item.estimatedValue.toLocaleString()} ${data.stats.currency}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>

                    <footer style="margin-top: 60px; font-size: 10px; color: #aaa; text-align: center;">
                        Informe generado por Instrument Collector - ${new Date().getFullYear()}
                    </footer>
                </body>
                </html>
            `;

            return new NextResponse(html, {
                headers: {
                    'Content-Type': 'text/html',
                },
            });
        }

        return new NextResponse('Invalid format', { status: 400 });

    } catch (error: any) {
        console.error('[EXPORT-API] Error:', error);
        return new NextResponse(error.message, { status: 500 });
    }
}
