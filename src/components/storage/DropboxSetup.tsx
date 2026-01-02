'use client';

import { useState } from 'react';
import { X, ExternalLink, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { configureStorageProvider } from '@/actions/storage';
import { toast } from 'sonner';

interface DropboxSetupProps {
    onClose: () => void;
}

export default function DropboxSetup({ onClose }: DropboxSetupProps) {
    const [loading, setLoading] = useState(false);

    const handleOAuthFlow = async () => {
        setLoading(true);

        // Redirect to Dropbox OAuth
        const clientId = process.env.NEXT_PUBLIC_DROPBOX_APP_KEY;
        const redirectUri = `${window.location.origin}/api/auth/dropbox/callback`;

        const authUrl = `https://www.dropbox.com/oauth2/authorize?` +
            `client_id=${clientId}&` +
            `redirect_uri=${encodeURIComponent(redirectUri)}&` +
            `response_type=code&` +
            `token_access_type=offline`;

        window.location.href = authUrl;
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-white dark:bg-gray-900 border-b dark:border-gray-800 p-6 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold">Configurar Dropbox</h2>
                        <p className="text-sm text-gray-500">Conecta tu cuenta de Dropbox</p>
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
                        <h3 className="font-bold text-blue-900 dark:text-blue-100 mb-2">📋 Instrucciones</h3>
                        <ol className="text-sm text-blue-700 dark:text-blue-300 space-y-2 list-decimal list-inside">
                            <li>Haz clic en "Conectar con Dropbox"</li>
                            <li>Inicia sesión con tu cuenta de Dropbox</li>
                            <li>Autoriza el acceso a tu Dropbox</li>
                            <li>Serás redirigido automáticamente</li>
                        </ol>
                    </div>

                    {/* Info */}
                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-4">
                        <h4 className="font-semibold mb-2">🔒 Privacidad y Seguridad</h4>
                        <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                            <li>• Solo accedemos a la carpeta de la app</li>
                            <li>• Tus credenciales se encriptan con AES-256</li>
                            <li>• Puedes revocar el acceso en cualquier momento</li>
                            <li>• Free tier: 2GB de almacenamiento</li>
                        </ul>
                    </div>

                    {/* OAuth Button */}
                    <div className="pt-4">
                        <Button
                            onClick={handleOAuthFlow}
                            isLoading={loading}
                            className="w-full py-4 text-lg bg-blue-600 hover:bg-blue-700"
                        >
                            {loading ? 'Redirigiendo...' : 'Conectar con Dropbox'}
                        </Button>
                    </div>

                    {/* Help Link */}
                    <div className="text-center">
                        <a
                            href="https://help.dropbox.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
                        >
                            <ExternalLink size={16} />
                            Ayuda de Dropbox
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
