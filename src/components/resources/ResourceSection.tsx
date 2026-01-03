'use client';

import { useState } from 'react';
import ResourceList from './ResourceList';
import ResourceUploader from './ResourceUploader';
import { Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface ResourceSectionProps {
    instrumentId?: string;
    collectionItemId?: string;
    resources: any[];
    canEdit: boolean; // Enables upload/delete
    defaultVisibility?: 'private' | 'public';
}

export default function ResourceSection({
    instrumentId,
    collectionItemId,
    resources,
    canEdit,
    defaultVisibility = 'private'
}: ResourceSectionProps) {
    const [showUploader, setShowUploader] = useState(false);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Archivos y Patches</h3>
                    <p className="text-sm text-gray-500">
                        {resources.length} {resources.length === 1 ? 'archivo' : 'archivos'} adjuntos
                    </p>
                </div>

                {canEdit && (
                    <Button
                        type="button" // Prevent form submission
                        onClick={() => setShowUploader(!showUploader)}
                        variant={showUploader ? "secondary" : "primary"}
                        icon={showUploader ? X : Plus}
                        className={showUploader ? "bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30 border-none" : ""}
                    >
                        {showUploader ? 'Cancelar' : 'Añadir Archivo'}
                    </Button>
                )}
            </div>

            {showUploader && (
                <div className="animate-in slide-in-from-top-4 fade-in duration-200">
                    <ResourceUploader
                        instrumentId={instrumentId}
                        collectionItemId={collectionItemId}
                        onUploadSuccess={() => setShowUploader(false)}
                        defaultVisibility={defaultVisibility}
                    />
                </div>
            )}

            <ResourceList resources={resources} canEdit={canEdit} />
        </div>
    );
}
