'use server';

import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import UserCollection from "@/models/UserCollection";

export async function exportCollectionToCSV() {
    try {
        const session = await auth();
        if (!session?.user) return { success: false, error: "Unauthorized" };

        await dbConnect();

        const items = await UserCollection.find({ userId: (session.user as any).id })
            .populate('instrumentId', 'brand model type year')
            .lean();

        // CSV Header
        const header = ['Marca', 'Modelo', 'Tipo', 'Año', 'Serial', 'Estado', 'Condición', 'Precio Compra', 'Valor Mercado', 'Notas'];

        // CSV Rows
        const rows = items.map((item: any) => {
            const inst = item.instrumentId;
            return [
                inst.brand,
                inst.model,
                inst.type,
                inst.year || '',
                item.serialNumber || '',
                item.status,
                item.condition,
                item.acquisition?.price || '',
                item.marketValue?.current || '',
                // Escape quotes in notes
                `"${(item.maintenanceNotes || '').replace(/"/g, '""')}"`
            ].join(',');
        });

        const csvContent = [header.join(','), ...rows].join('\n');

        // Return as string (client will handle download)
        return { success: true, data: csvContent };

    } catch (error) {
        console.error("Export error:", error);
        return { success: false, error: "Failed to export" };
    }
}
