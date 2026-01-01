'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { X, ExternalLink, CheckCircle, AlertCircle } from 'lucide-react';
import { configureStorageProvider, testStorageConnection } from '@/actions/storage';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface CloudinarySetupProps {
    onClose: () => void;
}

export default function CloudinarySetup({ onClose }: CloudinarySetupProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [testing, setTesting] = useState(false);
    const [testResult, setTestResult] = useState<{ success: boolean; error?: string } | null>(null);

    const [formData, setFormData] = useState({
        cloudName: '',
        apiKey: '',
        apiSecret: ''
    });

    const handleTest = async () => {
        if (!formData.cloudName || !formData.apiKey || !formData.apiSecret) {
            toast.error('Completa todos los campos');
            return;
        }

        setTesting(true);
        setTestResult(null);

        try {
            const result = await configureStorageProvider('cloudinary', formData);
            setTestResult(result);

            if (result.success) {
                toast.success('¡Conexión exitosa!');
            } else {
                toast.error(result.error || 'Error en la conexión');
            }
        } catch (error) {
            setTestResult({ success: false, error: 'Error inesperado' });
            toast.error('Error al probar la conexión');
        } finally {
            setTesting(false);
        }
    };

    const handleSave = async () => {
        if (!testResult?.success) {
            toast.error('Primero prueba la conexión');
            return;
        }

        setLoading(true);
        try {
            toast.success('Configuración guardada');
            router.refresh();
            onClose();
        } catch (error) {
            toast.error('Error al guardar');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] border border-gray-200 dark:border-gray-800 p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-bold">Configurar Cloudinary</h2>
                        <p className="text-sm text-gray-500">Conecta tu cuenta de Cloudinary</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Instructions */}
                <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/30 rounded-xl">
                    <h3 className="font-bold text-blue-900 dark:text-blue-100 mb-2">📝 Cómo obtener tus credenciales</h3>
                    <ol className="text-sm text-blue-700 dark:text-blue-300 space-y-1 list-decimal list-inside">
                        <li>Ve a <a href="https://cloudinary.com" target="_blank" rel="noopener" className="underline">cloudinary.com</a> y crea una cuenta gratuita</li>
                        <li>En el Dashboard, encontrarás tu <strong>Cloud Name</strong></li>
                        <li>En "Settings → Access Keys", copia tu <strong>API Key</strong> y <strong>API Secret</strong></li>
                    </ol>
                    <a
                        href="https://cloudinary.com/console"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 mt-3 text-sm font-bold text-blue-600 hover:text-blue-700"
                    >
                        Abrir Cloudinary Console
                        <ExternalLink size={14} />
                    </a>
                </div>

                {/* Form */}
                <div className="space-y-4 mb-6">
                    <div>
                        <label className="apple-label">Cloud Name</label>
                        <input
                            type="text"
                            value={formData.cloudName}
                            onChange={(e) => setFormData({ ...formData, cloudName: e.target.value })}
                            className="apple-input"
                            placeholder="my-cloud-name"
                        />
                    </div>

                    <div>
                        <label className="apple-label">API Key</label>
                        <input
                            type="text"
                            value={formData.apiKey}
                            onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                            className="apple-input"
                            placeholder="123456789012345"
                        />
                    </div>

                    <div>
                        <label className="apple-label">API Secret</label>
                        <input
                            type="password"
                            value={formData.apiSecret}
                            onChange={(e) => setFormData({ ...formData, apiSecret: e.target.value })}
                            className="apple-input"
                            placeholder="••••••••••••••••••••"
                        />
                        <p className="text-[10px] text-gray-400 mt-1 px-1">
                            🔒 Se guardará encriptado. Nunca se comparte con terceros.
                        </p>
                    </div>
                </div>

                {/* Test Result */}
                {testResult && (
                    <div className={`mb-6 p-4 rounded-xl border ${testResult.success
                            ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-900/30'
                            : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-900/30'
                        }`}>
                        <div className="flex items-center gap-2">
                            {testResult.success ? (
                                <>
                                    <CheckCircle className="text-green-600" size={20} />
                                    <span className="font-bold text-green-900 dark:text-green-100">
                                        ¡Conexión exitosa!
                                    </span>
                                </>
                            ) : (
                                <>
                                    <AlertCircle className="text-red-600" size={20} />
                                    <span className="font-bold text-red-900 dark:text-red-100">
                                        Error: {testResult.error}
                                    </span>
                                </>
                            )}
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div className="flex gap-3">
                    <Button
                        variant="secondary"
                        onClick={handleTest}
                        isLoading={testing}
                        className="flex-1"
                    >
                        Probar Conexión
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleSave}
                        isLoading={loading}
                        disabled={!testResult?.success}
                        className="flex-1"
                    >
                        Guardar
                    </Button>
                </div>
            </div>
        </div>
    );
}
