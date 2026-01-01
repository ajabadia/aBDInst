'use client';

import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { FileText, Table, Braces } from 'lucide-react';

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

    const handleJSON = async () => {
        const loadingToast = toast.loading('Generando JSON...');
        const { getExportData } = await import('@/actions/export');
        const data = await getExportData();

        if (data) {
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `instrument-collection-export-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            toast.dismiss(loadingToast);
            toast.success('Descarga JSON iniciada');
        } else {
            toast.dismiss(loadingToast);
            toast.error('Error al exportar');
        }
    };

    return (
        <div className="flex gap-2">
            <Button
                onClick={handleJSON}
                variant="secondary"
                className="h-9 px-4 text-xs font-semibold uppercase tracking-wide bg-gray-100 dark:bg-gray-800 hover:bg-yellow-50 hover:text-yellow-600 dark:hover:bg-yellow-900/20 dark:hover:text-yellow-400"
                icon={Braces}
            >
                JSON
            </Button>
            <Button
                onClick={exportCSV}
                variant="secondary"
                className="h-9 px-4 text-xs font-semibold uppercase tracking-wide bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
                icon={Table}
            >
                CSV
            </Button>
            <Button
                onClick={exportPDF}
                variant="secondary"
                className="h-9 px-4 text-xs font-semibold uppercase tracking-wide bg-gray-100 dark:bg-gray-800 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400"
                icon={FileText}
            >
                PDF
            </Button>
        </div>
    );
}
