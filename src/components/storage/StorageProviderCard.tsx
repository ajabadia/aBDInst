'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Check, X, Settings as SettingsIcon, AlertCircle } from 'lucide-react';
import CloudinarySetup from './CloudinarySetup';

interface StorageProviderCardProps {
    provider: {
        id: string;
        name: string;
        description: string;
        icon: any;
        available: boolean;
        configured: boolean;
        status: string;
    };
}

export default function StorageProviderCard({ provider }: StorageProviderCardProps) {
    const [showSetup, setShowSetup] = useState(false);
    const Icon = provider.icon;

    const getStatusBadge = () => {
        if (!provider.available) {
            return (
                <span className="px-3 py-1 text-xs font-bold bg-gray-100 dark:bg-gray-800 text-gray-500 rounded-full">
                    Próximamente
                </span>
            );
        }

        if (provider.status === 'configured') {
            return (
                <span className="px-3 py-1 text-xs font-bold bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full flex items-center gap-1">
                    <Check size={12} />
                    Configurado
                </span>
            );
        }

        if (provider.status === 'error') {
            return (
                <span className="px-3 py-1 text-xs font-bold bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-full flex items-center gap-1">
                    <AlertCircle size={12} />
                    Error
                </span>
            );
        }

        return (
            <span className="px-3 py-1 text-xs font-bold bg-gray-100 dark:bg-gray-800 text-gray-500 rounded-full">
                No configurado
            </span>
        );
    };

    return (
        <>
            <div className={`bg-white/40 dark:bg-black/20 backdrop-blur-md rounded-[2rem] border p-6 transition-all ${provider.available
                    ? 'border-gray-200/50 dark:border-white/10 hover:border-blue-200 dark:hover:border-blue-900/50'
                    : 'border-gray-100 dark:border-gray-900 opacity-60'
                }`}>
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${provider.configured
                                ? 'bg-green-100 dark:bg-green-900/30 text-green-600'
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
                            }`}>
                            <Icon size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg">{provider.name}</h3>
                            {getStatusBadge()}
                        </div>
                    </div>
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                    {provider.description}
                </p>

                <Button
                    variant={provider.configured ? "secondary" : "primary"}
                    onClick={() => setShowSetup(true)}
                    disabled={!provider.available}
                    icon={provider.configured ? SettingsIcon : undefined}
                    className="w-full"
                >
                    {provider.configured ? 'Reconfigurar' : 'Configurar'}
                </Button>
            </div>

            {/* Setup Modal */}
            {showSetup && provider.id === 'cloudinary' && (
                <CloudinarySetup onClose={() => setShowSetup(false)} />
            )}
        </>
    );
}
