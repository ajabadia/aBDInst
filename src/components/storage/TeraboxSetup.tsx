'use client';

import { useState } from 'react';
import { X, ExternalLink, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { configureStorageProvider, testStorageConnection } from '@/actions/storage';
import { toast } from 'sonner';

interface TeraboxSetupProps {
    onClose: () => void;
}

export default function TeraboxSetup({ onClose }: TeraboxSetupProps) {
    const [loading, setLoading] = useState(false);
    const [testing, setTesting] = useState(false);
    const [formData, setFormData] = useState({
        apiKey: '',
        apiSecret: '',
    });

    const handleTest = async () => {
        if (!formData.apiKey || !formData.apiSecret) {
            toast.error('Completa todos los campos');
            return;
        }

        setTesting(true);
        const result = await testStorageConnection();

        if (result.success) {
            toast.success('✅ Conexión exitosa');
        } else {
            toast.error(result.error || 'Error de conexión');
        }
        setTesting(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.apiKey || !formData.apiSecret) {
            toast.error('Completa todos los campos');
            return;
        }

        setLoading(true);
        const result = await configureStorageProvider('terabox', formData);

        if (result.success) {
            toast.success('✅ Terabox configurado correctamente');
            onClose();
        } else {
            toast.error(result.error || 'Error al configurar');
        }
        setLoading(false);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-white dark:bg-gray-900 border-b dark:border-gray-800 p-6 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold">Configurar Terabox</h2>
                        <p className="text-sm text-gray-500">Conecta tu cuenta de Terabox</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Instructions */}
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-4">
                        <h3 className="font-bold text-blue-900 dark:text-blue-100 mb-2">📋 Cómo obtener tus credenciales</h3>
                        <ol className="text-sm text-blue-700 dark:text-blue-300 space-y-2 list-decimal list-inside">
                            <li>Ve a <a href="https://www.terabox.com/developers" target="_blank" rel="noopener" className="underline">Terabox Developers</a> y crea una cuenta</li>
                            <li>Crea una nueva aplicación</li>
                            <li>Copia el <strong>API Key</strong> y <strong>API Secret</strong></li>
                            <li>Pégalos en el formulario a continuación</li>
                        </ol>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Input
                            label="API Key"
                            name="apiKey"
                            type="text"
                            placeholder="Tu API Key de Terabox"
                            value={formData.apiKey}
                            onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                            required
                        />

                        <Input
                            label="API Secret"
                            name="apiSecret"
                            type="password"
                            placeholder="Tu API Secret de Terabox"
                            value={formData.apiSecret}
                            onChange={(e) => setFormData({ ...formData, apiSecret: e.target.value })}
                            required
                        />

                        {/* Info */}
                        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-4">
                            <h4 className="font-semibold mb-2">🔒 Privacidad y Seguridad</h4>
                            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                                <li>• Tus credenciales se encriptan con AES-256</li>
                                <li>• Solo se guardan en tu cuenta</li>
                                <li>• Free tier: 1TB de almacenamiento</li>
                            </ul>
                        </div>

                        {/* Buttons */}
                        <div className="flex gap-3 pt-4">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={handleTest}
                                isLoading={testing}
                                className="flex-1"
                            >
                                Probar Conexión
                            </Button>
                            <Button
                                type="submit"
                                variant="primary"
                                isLoading={loading}
                                className="flex-1"
                            >
                                Guardar
                            </Button>
                        </div>
                    </form>

                    {/* Help Link */}
                    <div className="text-center">
                        <a
                            href="https://www.terabox.com/developers/docs"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
                        >
                            <ExternalLink size={16} />
                            Documentación de Terabox
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
