'use client';

import { useState } from 'react';
import { FileText, Music, FileCode, Download, Trash2, Globe, Lock, Play, Pause } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { deleteResource } from '@/actions/resource';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface ResourceListProps {
    resources: any[];
    canEdit?: boolean; // If true, show delete button
}

export default function ResourceList({ resources, canEdit = false }: ResourceListProps) {
    const router = useRouter();
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm('¿Seguro que quieres eliminar este archivo?')) return;

        setDeletingId(id);
        try {
            const res = await deleteResource(id);
            if (res.success) {
                toast.success('Recurso eliminado');
                router.refresh();
            } else {
                toast.error(res.error);
            }
        } catch (error) {
            toast.error('Error al eliminar');
        } finally {
            setDeletingId(null);
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'audio': return <Music size={24} className="text-purple-500" />;
            case 'manual': return <FileText size={24} className="text-orange-500" />;
            case 'video': return <Play size={24} className="text-red-600" />;
            case 'link': return <Globe size={24} className="text-blue-400" />;
            default: return <FileCode size={24} className="text-blue-500" />;
        }
    };

    // Helper to construct a URL that forces download with correct filename via our proxy
    const getDownloadUrl = (res: any) => {
        if (res.type === 'video' || res.type === 'link') return res.url;

        // Use our own API proxy which ensures correct Content-Disposition filename
        return `/api/resources/download?id=${res._id}`;
    };

    if (!resources || resources.length === 0) {
        return (
            <div className="text-center py-12 text-gray-500 border border-dashed border-gray-200 dark:border-gray-800 rounded-2xl bg-gray-50/50 dark:bg-black/20">
                <FileText className="mx-auto mb-2 opacity-50" size={32} />
                <p>No hay recursos disponibles aún.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 gap-3">
            {resources.map((res) => (
                <div
                    key={res._id}
                    className="group relative flex items-center gap-4 p-4 bg-white/70 dark:bg-white/5 border border-gray-200/50 dark:border-white/10 rounded-2xl hover:bg-white dark:hover:bg-white/10 transition-all duration-300 shadow-sm hover:shadow-md backdrop-blur-sm"
                >
                    <div className="p-3 bg-white/50 dark:bg-white/10 rounded-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)] dark:shadow-none ring-1 ring-black/5 dark:ring-white/5">
                        {getIcon(res.type)}
                    </div>

                    <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 dark:text-white truncate pr-8 tracking-tight text-[15px]">
                            {res.title}
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mt-1">
                            <span className="uppercase font-bold tracking-wider text-[10px] bg-gray-100 dark:bg-white/10 px-1.5 py-0.5 rounded text-gray-600 dark:text-gray-300">
                                {res.subType || res.type}
                            </span>
                            <span className="opacity-50">•</span>
                            <span>{(res.sizeBytes / 1024).toFixed(1)} KB</span>
                            <span className="opacity-50">•</span>
                            {res.visibility === 'public' ? (
                                <span className="flex items-center gap-1 text-green-600 dark:text-green-400 font-medium">
                                    <Globe size={10} /> Público
                                </span>
                            ) : (
                                <span className="flex items-center gap-1 text-gray-400 dark:text-gray-500">
                                    <Lock size={10} /> Privado
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <a
                            href={getDownloadUrl(res)}
                            target="_blank"
                            rel="noopener noreferrer"
                            download={res.type !== 'video' && res.type !== 'link'} // Don't download videos/links
                            className={`p-2 rounded-lg transition-all ${(res.type === 'video' || res.type === 'link')
                                ? 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/10 hover:scale-105 active:scale-95'
                                : 'text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:scale-105 active:scale-95'
                                }`}
                            title={res.type === 'video' ? "Ver Video" : res.type === 'link' ? "Abrir Enlace" : "Descargar"}
                        >
                            {res.type === 'video' ? <Play size={20} className="fill-current" /> : res.type === 'link' ? <Globe size={20} /> : <Download size={20} />}
                        </a>

                        {canEdit && (
                            <button
                                onClick={(e) => handleDelete(res._id, e)}
                                disabled={deletingId === res._id}
                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all hover:scale-105 active:scale-95"
                                title="Eliminar"
                            >
                                {deletingId === res._id ? (
                                    <div className="w-5 h-5 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <Trash2 size={20} />
                                )}
                            </button>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}
