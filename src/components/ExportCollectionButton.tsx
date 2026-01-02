'use client';

import { Download } from 'lucide-react';
import { exportCollectionToCSV } from '@/actions/export';
import { toast } from 'sonner';

export default function ExportCollectionButton() {
    const handleExport = async () => {
        const loadingToast = toast.loading('Generando archivo...');

        try {
            const res = await exportCollectionToCSV();

            if (res.success && res.data) {
                // Create Blob and download
                const blob = new Blob([res.data], { type: 'text/csv;charset=utf-8;' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', `coleccion_instrumentos_${new Date().toISOString().split('T')[0]}.csv`);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);

                toast.dismiss(loadingToast);
                toast.success('Colección exportada correctamente');
            } else {
                throw new Error(res.error);
            }
        } catch (error) {
            toast.dismiss(loadingToast);
            toast.error('Error al exportar');
        }
    };

    return (
        <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm font-medium rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm transition-all active:scale-95"
            title="Exportar a CSV"
        >
            <Download size={16} />
            <span className="hidden sm:inline">Exportar CSV</span>
        </button>
    );
}
