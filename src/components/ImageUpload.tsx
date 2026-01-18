'use client';

import { useState } from 'react';
// import { uploadImage } from '@/actions/upload';
import { toast } from 'sonner';

interface ImageUploadProps {
    onUpload: (url: string) => void;
}

export default function ImageUpload({ onUpload }: ImageUploadProps) {
    const [uploading, setUploading] = useState(false);
    const [preview, setPreview] = useState<string | null>(null);

    async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);

        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch('/api/upload/collection-image', {
                method: 'POST',
                body: formData
            });

            const res = await response.json();

            if (response.ok && res.url) {
                setPreview(res.url);
                onUpload(res.url); // Pass URL back to parent form
            } else {
                toast.error('Error en la subida: ' + (res.error || 'Error desconocido'));
            }
        } catch (error) {
            console.error(error);
            toast.error('Error de red al subir imagen');
        }
        setUploading(false);
    }

    return (
        <div className="border border-dashed border-gray-400 p-4 rounded text-center">
            {preview ? (
                <div className="relative">
                    <img src={preview} alt="Upload preview" className="mx-auto max-h-48 rounded" />
                    <button
                        type="button"
                        onClick={() => setPreview(null)}
                        className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 m-1 text-xs"
                    >
                        X
                    </button>
                </div>
            ) : (
                <label className="cursor-pointer block">
                    <span className="block mb-2 text-sm text-gray-500 dark:text-gray-400">
                        {uploading ? 'Subiendo...' : 'Haz clic o arrastra una imagen aquí'}
                    </span>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleChange}
                        disabled={uploading}
                        className="hidden"
                    />
                </label>
            )}
        </div>
    );
}
