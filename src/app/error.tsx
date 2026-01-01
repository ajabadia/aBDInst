'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error(error);
    }, [error]);

    return (
        <div className="flex h-[80vh] flex-col items-center justify-center text-center px-4">
            <div className="w-20 h-20 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-6">
                <AlertTriangle className="h-10 w-10 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Algo ha salido mal
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md">
                Ha ocurrido un error inesperado. Nuestro equipo ha sido notificado (bueno, en teoría).
            </p>
            <button
                onClick={reset}
                className="inline-flex items-center gap-2 rounded-full bg-gray-900 dark:bg-white px-6 py-2.5 text-sm font-semibold text-white dark:text-black hover:opacity-90 transition-opacity"
            >
                <RefreshCcw size={16} />
                Intentar de nuevo
            </button>
        </div>
    );
}
