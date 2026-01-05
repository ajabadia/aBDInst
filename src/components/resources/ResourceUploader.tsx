'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/Button';
import { Upload, FileText, Music, FileCode, Check, Loader2, X, Play } from 'lucide-react';
import { toast } from 'sonner';
import { uploadResource } from '@/actions/resource';
import { useRouter } from 'next/navigation';

interface ResourceUploaderProps {
    instrumentId?: string;
    collectionItemId?: string;
    onUploadSuccess?: () => void;
    defaultVisibility?: 'private' | 'public';
}

export default function ResourceUploader({
    instrumentId,
    collectionItemId,
    onUploadSuccess,
    defaultVisibility = 'private'
}: ResourceUploaderProps) {
    const router = useRouter();
    const [file, setFile] = useState<File | null>(null);
    const [url, setUrl] = useState('');
    const [title, setTitle] = useState('');
    const [type, setType] = useState('patch');
    const [visibility, setVisibility] = useState(defaultVisibility);
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            setFile(e.target.files[0]);
            setTitle(e.target.files[0].name.split('.')[0]); // Auto-fill title
        }
    };

    const handleUpload = async () => {
        if (!title) {
            toast.error("El título es obligatorio");
            return;
        }

        const isUrlType = type === 'video' || type === 'link';

        if (isUrlType && !url) {
            toast.error("La URL es obligatoria");
            return;
        }

        if (!isUrlType && !file) {
            toast.error("Debes seleccionar un archivo");
            return;
        }

        setLoading(true);
        const formData = new FormData();
        formData.append('title', title);
        formData.append('type', type);
        formData.append('visibility', visibility);

        if (isUrlType) {
            formData.append('url', url);
        } else if (file) {
            formData.append('file', file);
        }

        if (instrumentId) formData.append('instrumentId', instrumentId);
        if (collectionItemId) formData.append('collectionItemId', collectionItemId);

        try {
            const res = await uploadResource(formData);
            if (res.success) {
                toast.success('Recurso añadido con éxito');
                setFile(null);
                setTitle('');
                setUrl('');
                if (fileInputRef.current) fileInputRef.current.value = '';
                router.refresh(); // Refresh server data
                onUploadSuccess?.();
            } else {
                toast.error(res.error || 'Error al subir');
            }
        } catch (error) {
            toast.error('Error inesperado');
        } finally {
            setLoading(false);
        }
    };

    const getTypeIcon = () => {
        switch (type) {
            case 'audio': return <Music size={20} />;
            case 'manual': return <FileText size={20} />;
            case 'video': return <Play size={20} />;
            default: return <FileCode size={20} />;
        }
    };

    return (
        <div className="apple-card p-6 border border-gray-100 dark:border-white/5 shadow-lg shadow-black/5 bg-white/40 dark:bg-black/40 backdrop-blur-md">
            <h3 className="font-bold text-lg mb-6 flex items-center gap-2 text-gray-900 dark:text-gray-100">
                <div className="p-2 rounded-full bg-blue-500/10 text-blue-500">
                    <Upload size={18} />
                </div>
                Añadir Nuevo Recurso
            </h3>

            <div className="space-y-4">
                <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Tipo de Recurso</label>
                    <select
                        value={type}
                        onChange={(e) => {
                            setType(e.target.value);
                            setFile(null); // Clear file selection when type changes
                            setUrl(''); // Clear URL when type changes
                            setTitle(''); // Clear title when type changes
                        }}
                        className="apple-input w-full"
                    >
                        <option value="patch">Patch / Bank (.syx, .fxp)</option>
                        <option value="manual">Manual (.pdf)</option>
                        <option value="audio">Audio Demo (.mp3)</option>
                        <option value="video">Video YouTube</option>
                        <option value="link">Artículo / Enlace</option>
                        <option value="other">Otro</option>
                    </select>
                </div>

                {(type === 'video' || type === 'link') ? (
                    <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">
                            {type === 'video' ? 'Enlace de YouTube' : 'URL del Artículo'}
                        </label>
                        <input
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            className="apple-input w-full"
                            placeholder="https://..."
                        />
                    </div>
                ) : (
                    !file ? (
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-8 text-center cursor-pointer hover:border-blue-500 dark:hover:border-blue-400 transition-colors bg-gray-50/50 dark:bg-black/20"
                        >
                            <Upload className="mx-auto text-gray-400 mb-2" size={32} />
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Haz clic o arrastra un archivo aquí</p>
                            <p className="text-xs text-gray-400 mt-1">Soporta .zip, .syx, .pdf, .mp3, etc.</p>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-900/30 animate-in fade-in slide-in-from-bottom-2">
                            <div className="p-2 bg-white dark:bg-black/40 rounded-lg text-blue-600">
                                {getTypeIcon()}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{file.name}</p>
                                <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                            </div>
                            <button type="button" onClick={() => setFile(null)} className="p-1 hover:bg-black/5 rounded-full">
                                <X size={16} className="text-gray-500" />
                            </button>
                        </div>
                    )
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="apple-label">Título</label>
                        <input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="apple-input w-full"
                            placeholder={type === 'video' ? "Título del video" : "Nombre del archivo"}
                        />
                    </div>

                    <div>
                        <label className="apple-label">Visibilidad</label>
                        <div className="flex bg-gray-100/50 dark:bg-black/20 p-1 rounded-xl ring-1 ring-black/5 dark:ring-white/5">
                            <button
                                type="button"
                                onClick={() => setVisibility('private')}
                                className={`flex-1 text-xs font-semibold py-2 rounded-lg transition-all shadow-sm ${visibility === 'private'
                                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-[0_1px_3px_rgba(0,0,0,0.1)]'
                                    : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 shadow-none bg-transparent'
                                    }`}
                            >
                                Privado
                            </button>
                            <button
                                type="button"
                                onClick={() => setVisibility('public')}
                                className={`flex-1 text-xs font-semibold py-2 rounded-lg transition-all shadow-sm ${visibility === 'public'
                                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-[0_1px_3px_rgba(0,0,0,0.1)]'
                                    : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 shadow-none bg-transparent'
                                    }`}
                            >
                                Público
                            </button>
                        </div>
                    </div>
                </div>

                <Button
                    type="button" // Use type button to handle async upload separately
                    onClick={handleUpload}
                    isLoading={loading}
                    className="w-full"
                    icon={Check}
                >
                    {(type === 'video' || type === 'link') ? 'Guardar Enlace' : 'Subir Archivo'}
                </Button>
            </div>

            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                onChange={handleFileChange}
                accept=".syx,.mid,.pdf,.mp3,.wav,.zip,.fxp,.rar,.7z,.doc,.docx,.txt"
            />
        </div>
    );
}
