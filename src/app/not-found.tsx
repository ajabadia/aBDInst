'use client';

import Link from 'next/link';
import { FileQuestion, Home } from 'lucide-react';

export default function NotFound() {
    return (
        <div className="flex h-screen flex-col items-center justify-center bg-gray-50 dark:bg-black text-center px-4">
            <div className="w-24 h-24 bg-gray-100 dark:bg-white/10 rounded-full flex items-center justify-center mb-6 animate-in zoom-in duration-300">
                <FileQuestion className="h-10 w-10 text-gray-400" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white mb-2">
                Página no encontrada
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md">
                Lo sentimos, no pudimos encontrar el recurso que estabas buscando. Puede que haya sido movido o eliminado.
            </p>
            <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 hover:bg-blue-500 hover:scale-105 transition-all"
            >
                <Home size={18} />
                Volver al Inicio
            </Link>
        </div>
    );
}
