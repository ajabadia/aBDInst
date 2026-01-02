'use client';

import { useState } from 'react';
import { X, ExternalLink, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { configureStorageProvider } from '@/actions/storage';
import { toast } from 'sonner';

interface GoogleDriveSetupProps {
    onClose: () => void;
}

export default function GoogleDriveSetup({ onClose }: GoogleDriveSetupProps) {
    const [loading, setLoading] = useState(false);
    const [testing, setTesting] = useState(false);

    const handleOAuthFlow = async () => {
        setLoading(true);

        // Redirect to Google OAuth
        const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
        const redirectUri = `${window.location.origin}/api/auth/google-drive/callback`;
        const scope = 'https://www.googleapis.com/auth/drive.file';

        const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
            `client_id=${clientId}&` +
            `redirect_uri=${encodeURIComponent(redirectUri)}&` +
            `response_type=code&` +
            `scope=${encodeURIComponent(scope)}&` +
            `access_type=offline&` +
            `prompt=consent`;

        window.location.href = authUrl;
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-white dark:bg-gray-900 border-b dark:border-gray-800 p-6 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold">Configurar Google Drive</h2>
                        <p className="text-sm text-gray-500">Conecta tu cuenta de Google Drive</p>
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
                            <li>Haz clic en "Conectar con Google"</li>
                            <li>Inicia sesión con tu cuenta de Google</li>
                            <li>Autoriza el acceso a Google Drive</li>
                            <li>Serás redirigido automáticamente</li>
                        </ol>
                    </div>

                    {/* Info */}
                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-4">
                        <h4 className="font-semibold mb-2">🔒 Privacidad y Seguridad</h4>
                        <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                            <li>• Solo accedemos a archivos creados por esta app</li>
                            <li>• Tus credenciales se encriptan con AES-256</li>
                            <li>• Puedes revocar el acceso en cualquier momento</li>
                            <li>• Free tier: 15GB de almacenamiento</li>
                        </ul>
                    </div>

                    {/* OAuth Button */}
                    <div className="pt-4">
                        <Button
                            onClick={handleOAuthFlow}
                            isLoading={loading}
                            className="w-full py-4 text-lg bg-blue-600 hover:bg-blue-700"
                        >
                            {loading ? 'Redirigiendo...' : 'Conectar con Google'}
                        </Button>
                    </div>

                    {/* Help Link */}
                    <div className="text-center">
                        <a
                            href="https://support.google.com/drive"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
                        >
                            <ExternalLink size={16} />
                            Ayuda de Google Drive
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
