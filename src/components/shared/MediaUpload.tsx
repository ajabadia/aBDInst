'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Loader2, UploadCloud } from 'lucide-react';

interface MediaUploadProps {
    onUpload: (url: string) => void;
    endpoint?: string;
    accept?: string;
    label?: string;
    context?: string;
}

export default function MediaUpload({
    onUpload,
    endpoint = '/api/upload/media',
    accept = 'image/*',
    label = 'Subir Archivo',
    context = 'showroom'
}: MediaUploadProps) {
    const [uploading, setUploading] = useState(false);

    async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const loadingToast = toast.loading('Subiendo archivo...');

        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('context', context);

            const response = await fetch(endpoint, {
                method: 'POST',
                body: formData
            });

            const res = await response.json();

            if (response.ok && res.url) {
                onUpload(res.url);
                toast.success('Archivo subido correctamente');
            } else {
                toast.error('Error en la subida: ' + (res.error || 'Error desconocido'));
            }
        } catch (error) {
            console.error(error);
            toast.error('Error de red al subir');
        } finally {
            toast.dismiss(loadingToast);
            setUploading(false);
        }
    }

    return (
        <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 rounded-lg transition-colors text-xs font-medium text-gray-700 dark:text-gray-300">
            {uploading ? <Loader2 size={14} className="animate-spin" /> : <UploadCloud size={14} />}
            <span>{uploading ? 'Subiendo...' : label}</span>
            <input
                type="file"
                accept={accept}
                onChange={handleChange}
                disabled={uploading}
                className="hidden"
            />
        </label>
    );
}
