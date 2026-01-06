'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, Loader2, FileType } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface DragDropUploaderProps {
    value?: string;
    onUpload: (url: string) => void;
    className?: string;
    allowedTypes?: string[];
}

export default function DragDropUploader({
    value,
    onUpload,
    className,
    allowedTypes = ['image/svg+xml', 'image/png', 'image/jpeg', 'image/webp']
}: DragDropUploaderProps) {
    const [uploading, setUploading] = useState(false);

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            // Import dynamically or pass action as prop would be cleaner, but for now direct import usage pattern
            // We need to use a server action that we expose. 
            // Since this component is client-side, we depend on the passed action or fetch.
            // We'll assume the parent handles the actual "action" call or we fetch an endpoint.
            // But typically in this project we import server actions directly (Next.js alpha feature or server reference).
            // Let's rely on a passed prop or standard fetch if we can't import easily.
            // Actually, we can import `uploadMetadataAsset` if it's 'use server' and we are in a client component.
            // Let's try importing it at the top level.

            const { uploadMetadataAsset } = await import('@/actions/metadata');
            const result = await uploadMetadataAsset(formData);

            if (result.success && result.url) {
                onUpload(result.url);
                toast.success('Archivo subido correctamente');
            } else {
                toast.error('Error al subir: ' + result.error);
            }
        } catch (error: any) {
            toast.error('Error de red al subir');
            console.error(error);
        } finally {
            setUploading(false);
        }
    }, [onUpload]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: allowedTypes.reduce((acc, type) => ({ ...acc, [type]: [] }), {}),
        maxFiles: 1,
        multiple: false
    });

    return (
        <div className={cn("w-full", className)}>
            {!value ? (
                <div
                    {...getRootProps()}
                    className={cn(
                        "border-2 border-dashed rounded-2xl p-6 transition-all cursor-pointer flex flex-col items-center justify-center gap-3 text-center min-h-[160px]",
                        isDragActive
                            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                            : "border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50"
                    )}
                >
                    <input {...getInputProps()} />
                    {uploading ? (
                        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                    ) : (
                        <>
                            <div className="p-3 bg-white dark:bg-white/5 rounded-full shadow-sm">
                                <Upload className="w-6 h-6 text-gray-400" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                    Haz clic o arrastra un archivo aquí
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                    SVG, PNG, JPG (Max 5MB)
                                </p>
                            </div>
                        </>
                    )}
                </div>
            ) : (
                <div className="relative group rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-2">
                    <div className="relative h-40 w-full flex items-center justify-center bg-[url('/grid-pattern.svg')] dark:bg-[url('/grid-pattern-dark.svg')]">
                        {value.endsWith('.svg') || value.includes('resource_type=raw') ? ( // Simple heuristic
                            // Display SVG as image
                            <img src={value} alt="Preview" className="max-h-full max-w-full object-contain" />
                        ) : (
                            <Image
                                src={value}
                                alt="Preview"
                                fill
                                className="object-contain"
                            />
                        )}
                    </div>
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            onUpload('');
                        }}
                        className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                        title="Eliminar imagen"
                    >
                        <X size={14} />
                    </button>
                    <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/50 backdrop-blur-md rounded-lg text-[10px] text-white font-mono truncate max-w-[90%]">
                        {value.split('/').pop()}
                    </div>
                </div>
            )}
        </div>
    );
}
