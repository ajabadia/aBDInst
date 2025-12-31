'use client';

import { toast } from 'sonner';

interface CollectionItem {
    instrumentId: {
        brand: string;
        model: string;
        type: string;
    };
    status: string;
    condition: string;
    serialNumber?: string;
    acquisition?: {
        date?: string;
        price?: number;
    };
}

interface ExportButtonsProps {
    data: CollectionItem[];
}

export default function ExportButtons({ data }: ExportButtonsProps) {

    const exportCSV = () => {
        // Trigger server-side download to bypass wrapper/blob issues
        window.open('/api/export/csv', '_self');
        toast.success('Iniciando descarga CSV...');
    };

    const exportPDF = () => {
        // Trigger server-side download
        window.open('/api/export/pdf', '_self');
        toast.success('Iniciando descarga PDF...');
    };

    return (
        <div className="flex gap-2">
            <button
                onClick={exportCSV}
                className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 px-3 py-2 rounded text-sm transition flex items-center gap-1"
                title="Exportar a CSV"
            >
                <span className="font-bold">CSV</span> 📄
            </button>
            <button
                onClick={exportPDF}
                className="bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 text-red-700 dark:text-red-300 px-3 py-2 rounded text-sm transition flex items-center gap-1"
                title="Exportar a PDF"
            >
                <span className="font-bold">PDF</span> 📕
            </button>
        </div>
    );
}
