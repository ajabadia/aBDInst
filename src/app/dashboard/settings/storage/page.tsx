import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { getStorageProviderStatus } from '@/actions/storage';
import StorageProviderCard from '@/components/storage/StorageProviderCard';
import { Cloud, HardDrive } from 'lucide-react';

export default async function StorageSettingsPage() {
    const session = await auth();
    if (!session?.user?.id) {
        redirect('/login');
    }

    const storageStatus = await getStorageProviderStatus();

    const providers = [
        {
            id: 'cloudinary',
            name: 'Cloudinary',
            description: 'CDN global con transformaciones automáticas. Free tier: 25GB almacenamiento.',
            icon: 'Cloud',
            available: true,
            configured: storageStatus?.type === 'cloudinary',
            status: storageStatus?.type === 'cloudinary' ? storageStatus.status : 'not_configured'
        },
        {
            id: 'google-drive',
            name: 'Google Drive',
            description: 'Almacenamiento en tu cuenta de Google. Free tier: 15GB.',
            icon: 'HardDrive',
            available: true,
            configured: storageStatus?.type === 'google-drive',
            status: storageStatus?.type === 'google-drive' ? storageStatus.status : 'not_configured'
        },
        {
            id: 'dropbox',
            name: 'Dropbox',
            description: 'Sincronización automática con tu Dropbox. Free tier: 2GB.',
            icon: 'HardDrive',
            available: true,
            configured: storageStatus?.type === 'dropbox',
            status: storageStatus?.type === 'dropbox' ? storageStatus.status : 'not_configured'
        },
        {
            id: 'terabox',
            name: 'TeraBox',
            description: 'Almacenamiento masivo. Free tier: 1TB.',
            icon: 'HardDrive',
            available: true,
            configured: storageStatus?.type === 'terabox',
            status: storageStatus?.type === 'terabox' ? storageStatus.status : 'not_configured'
        }
    ];

    return (
        <div className="container mx-auto px-6 py-12 max-w-6xl">
            <div className="flex items-center gap-4 mb-12">
                <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-900 dark:text-white">
                    <Cloud size={28} />
                </div>
                <div>
                    <h1 className="text-4xl font-bold tracking-tight">Almacenamiento</h1>
                    <p className="text-gray-500">Configura dónde se guardarán las fotos de tu colección</p>
                </div>
            </div>

            {/* Info Banner */}
            <div className="mb-8 p-6 bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20 rounded-2xl">
                <h3 className="font-bold text-blue-900 dark:text-blue-100 mb-2">🔐 Tus Credenciales, Tu Control</h3>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                    Instrument Collector usa <strong>BYOS (Bring Your Own Storage)</strong>.
                    Configuras tu propia cuenta de almacenamiento y tus fotos se guardan ahí,
                    nunca en servidores compartidos. Tú controlas tus datos.
                </p>
            </div>

            {/* Provider Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {providers.map((provider) => (
                    <StorageProviderCard key={provider.id} provider={provider} />
                ))}
            </div>
        </div>
    );
}
