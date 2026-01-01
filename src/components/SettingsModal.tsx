'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { useTheme } from 'next-themes';
import { Trash2, AlertTriangle, Loader2, Moon, Sun, Monitor } from 'lucide-react';
import { deleteAccount } from '@/actions/user';
import { signOut } from 'next-auth/react';
import { toast } from 'sonner';

// Simplified Modal if UI component missing, using fixed overlay
export default function SettingsModal({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) {
    const { theme, setTheme } = useTheme();
    const [confirming, setConfirming] = useState(false);
    const [loading, setLoading] = useState(false);
    const [inputValue, setInputValue] = useState('');

    // Handle ESC key to close
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onOpenChange(false);
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onOpenChange]);

    const handleDelete = async () => {
        if (inputValue !== 'BORRAR') return;

        setLoading(true);
        try {
            const result = await deleteAccount();
            if (result.success) {
                toast.success('Cuenta eliminada. Hasta siempre.');
                await signOut({ callbackUrl: '/' });
            } else {
                toast.error('Error al eliminar la cuenta');
                setLoading(false);
            }
        } catch (e) {
            toast.error('Algo salió mal');
            setLoading(false);
        }
    };

    if (!open) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in pointer-events-auto"
            role="dialog"
            aria-modal="true"
            aria-labelledby="settings-title"
        >
            <div className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-800 animate-in zoom-in-95">
                <div className="p-6 border-b border-gray-100 dark:border-gray-800">
                    <h2 id="settings-title" className="text-xl font-bold">Configuración</h2>
                    <p className="text-sm text-gray-500">Gestiona tu cuenta y preferencias</p>
                </div>

                <div className="p-6 space-y-8">
                    {/* APARIENCIA */}
                    <div>
                        <h3 className="font-semibold mb-2 text-sm uppercase tracking-wider text-gray-500">Apariencia</h3>
                        <div className="grid grid-cols-3 gap-2 bg-gray-50 dark:bg-gray-800 p-1 rounded-xl">
                            <button onClick={() => setTheme('light')} className={`flex items-center justify-center gap-2 p-2 rounded-lg text-sm font-medium transition-all ${theme === 'light' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'}`}>
                                <Sun size={16} /> Claro
                            </button>
                            <button onClick={() => setTheme('dark')} className={`flex items-center justify-center gap-2 p-2 rounded-lg text-sm font-medium transition-all ${theme === 'dark' ? 'bg-gray-700 text-white shadow-sm' : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'}`}>
                                <Moon size={16} /> Oscuro
                            </button>
                            <button onClick={() => setTheme('system')} className={`flex items-center justify-center gap-2 p-2 rounded-lg text-sm font-medium transition-all ${theme === 'system' ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'}`}>
                                <Monitor size={16} /> Auto
                            </button>
                        </div>
                    </div>

                    {/* DATA EXPORT (Placeholder) */}
                    <div>
                        <h3 className="font-semibold mb-2 text-sm uppercase tracking-wider text-gray-500">Tus Datos</h3>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl">
                            <div>
                                <p className="font-medium text-sm">Exportar Datos</p>
                                <p className="text-xs text-gray-400">Descarga tu colección en JSON</p>
                            </div>
                            <Button variant="outline" onClick={async () => {
                                const loadingToast = toast.loading('Generando exportación...');
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
                                    toast.success('Descarga iniciada');
                                } else {
                                    toast.dismiss(loadingToast);
                                    toast.error('Error al exportar');
                                }
                            }}>
                                Descargar
                            </Button>
                        </div>
                    </div>

                    {/* DANGER ZONE */}
                    <div>
                        <h3 className="font-semibold mb-2 text-sm uppercase tracking-wider text-red-500">Zona de Peligro</h3>
                        <div className="border border-red-100 dark:border-red-900/30 bg-red-50/50 dark:bg-red-900/10 rounded-2xl p-4">
                            {!confirming ? (
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium text-sm text-red-700 dark:text-red-400">Eliminar Cuenta</p>
                                        <p className="text-xs text-red-600/70 dark:text-red-400/70">Esta acción es irreversible</p>
                                    </div>
                                    <button
                                        onClick={() => setConfirming(true)}
                                        className="px-3 py-1.5 bg-white dark:bg-red-950 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 text-xs font-bold rounded-lg hover:bg-red-50 transition-colors"
                                    >
                                        Eliminar
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-3 animate-in fade-in slide-in-from-right-4">
                                    <div className="flex items-center gap-2 text-red-600">
                                        <AlertTriangle size={16} />
                                        <p className="text-xs font-bold">¿Estás seguro?</p>
                                    </div>
                                    <p className="text-xs text-gray-600 dark:text-gray-300">
                                        Escribe <strong>BORRAR</strong> para confirmar la eliminación definitiva de tu cuenta y todos tus datos.
                                    </p>
                                    <input
                                        type="text"
                                        placeholder="Escribe BORRAR"
                                        className="w-full px-3 py-2 bg-white dark:bg-black border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-red-500 outline-none"
                                        value={inputValue}
                                        onChange={(e) => setInputValue(e.target.value)}
                                    />
                                    <div className="flex gap-2">
                                        <Button
                                            variant="ghost"
                                            onClick={() => { setConfirming(false); setInputValue(''); }}
                                            className="flex-1"
                                        >
                                            Cancelar
                                        </Button>
                                        <Button
                                            variant="primary"
                                            className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                                            disabled={inputValue !== 'BORRAR' || loading}
                                            onClick={handleDelete}
                                        >
                                            {loading ? <Loader2 className="animate-spin" size={16} /> : 'Confirmar Eliminación'}
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 flex justify-end">
                    <Button variant="ghost" onClick={() => onOpenChange(false)}>
                        Cerrar
                    </Button>
                </div>
            </div>
        </div>
    );
}
