'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface ImageUploaderProps {
    collectionId: string;
    onUploadComplete: () => void;
    onClose: () => void;
}

export default function ImageUploader({ collectionId, onUploadComplete, onClose }: ImageUploaderProps) {
    const [files, setFiles] = useState<File[]>([]);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        setError(null);

        // Validate file sizes (max 10MB per file)
        const oversized = acceptedFiles.filter(f => f.size > 10 * 1024 * 1024);
        if (oversized.length > 0) {
            setError(`${oversized.length} archivo(s) exceden 10MB`);
            return;
        }

        setFiles(prev => [...prev, ...acceptedFiles]);
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.heic']
        },
        maxFiles: 10
    });

    const removeFile = (index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleUpload = async () => {
        if (files.length === 0) return;

        setUploading(true);
        setError(null);

        try {
            const formData = new FormData();
            files.forEach(file => formData.append('images', file));
            formData.append('collectionId', collectionId);

            const response = await fetch('/api/upload/collection-images', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Upload failed');
            }

            onUploadComplete();
            onClose();
        } catch (err: any) {
            setError(err.message || 'Error al subir imágenes');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] border border-gray-200 dark:border-gray-800 p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-bold">Subir Fotos</h2>
                        <p className="text-sm text-gray-500">Añade fotos de tu instrumento</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Dropzone */}
                <div
                    {...getRootProps()}
                    className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all ${isDragActive
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-300 dark:border-gray-700 hover:border-blue-400'
                        }`}
                >
                    <input {...getInputProps()} />
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                            <Upload className="text-blue-600" size={32} />
                        </div>
                        {isDragActive ? (
                            <p className="text-lg font-semibold text-blue-600">Suelta las imágenes aquí...</p>
                        ) : (
                            <>
                                <p className="text-lg font-semibold">Arrastra imágenes o haz click</p>
                                <p className="text-sm text-gray-500">
                                    JPG, PNG, WebP, HEIC • Máx 10MB por archivo • Hasta 10 fotos
                                </p>
                            </>
                        )}
                    </div>
                </div>

                {/* Error */}
                {error && (
                    <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/30 rounded-xl flex items-center gap-2">
                        <AlertCircle className="text-red-600" size={20} />
                        <span className="text-sm text-red-700 dark:text-red-300">{error}</span>
                    </div>
                )}

                {/* Preview */}
                {files.length > 0 && (
                    <div className="mt-6">
                        <h3 className="font-bold mb-3">{files.length} imagen(es) seleccionada(s)</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {files.map((file, index) => (
                                <div key={index} className="relative group">
                                    <div className="aspect-square rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800">
                                        <img
                                            src={URL.createObjectURL(file)}
                                            alt={file.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <button
                                        onClick={() => removeFile(index)}
                                        className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <X size={16} />
                                    </button>
                                    <p className="text-xs text-gray-500 mt-1 truncate">{file.name}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 mt-6">
                    <Button
                        variant="secondary"
                        onClick={onClose}
                        className="flex-1"
                        disabled={uploading}
                    >
                        Cancelar
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleUpload}
                        isLoading={uploading}
                        disabled={files.length === 0}
                        icon={Upload}
                        className="flex-1"
                    >
                        Subir {files.length > 0 && `(${files.length})`}
                    </Button>
                </div>
            </div>
        </div>
    );
}
