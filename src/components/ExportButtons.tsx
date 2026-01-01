'use client';

import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { FileText, Table } from 'lucide-react';

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
