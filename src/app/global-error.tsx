'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { AlertCircle, RefreshCcw } from 'lucide-react';

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error('Global Error:', error);
    }, [error]);

    return (
        <html>
            <body className="antialiased">
                <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-black p-4 text-center">
                    <div className="max-w-md w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <div className="w-20 h-20 rounded-3xl bg-red-100 dark:bg-red-900/20 flex items-center justify-center mx-auto mb-8">
                            <AlertCircle className="text-red-600 dark:text-red-400 w-10 h-10" />
                        </div>

                        <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white mb-4">
                            Error Crítico
                        </h1>

                        <p className="text-lg text-gray-500 dark:text-gray-400 mb-10 leading-relaxed">
                            Algo ha fallado de forma inesperada a nivel de sistema. Por favor, intenta recargar la aplicación.
                        </p>

                        <div className="flex flex-col gap-3">
                            <Button
                                onClick={() => reset()}
                                className="w-full py-4 text-lg bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2"
                            >
                                <RefreshCcw size={20} />
                                Reintentar Carga
                            </Button>

                            <Button
                                variant="ghost"
                                onClick={() => window.location.href = '/'}
                                className="w-full text-gray-500 hover:text-gray-900"
                            >
                                Volver al Inicio
                            </Button>
                        </div>

                        {error.digest && (
                            <p className="mt-8 text-xs font-mono text-gray-400 uppercase tracking-widest">
                                ID: {error.digest}
                            </p>
                        )}
                    </div>
                </div>
            </body>
        </html>
    );
}
