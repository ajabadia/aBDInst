'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/Button';
import { Image as ImageIcon, Check, Trash2, Loader2, Grid, Music, FileAudio, Video, FileText } from 'lucide-react';
import { getMediaLibrary, deleteMedia } from '@/lib/media/MediaManager';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface MediaLibraryProps {
    onSelect: (url: string) => void;
    trigger?: React.ReactNode;
    typeFilter?: 'image' | 'audio' | 'video' | 'document';
}

export default function MediaLibrary({ onSelect, trigger, typeFilter }: MediaLibraryProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [items, setItems] = useState<any[]>([]);
    const [selected, setSelected] = useState<string | null>(null);

    useEffect(() => {
        if (open) loadMedia();
    }, [open]);

    async function loadMedia() {
        setLoading(true);
        const res = await getMediaLibrary(100, 1, typeFilter);
        if (res.items) setItems(res.items);
        setLoading(false);
    }

    async function handleDelete(id: string, e: React.MouseEvent) {
        e.stopPropagation();
        if (!confirm('Are you sure? This will remove it from the library list (file remains).')) return;

        await deleteMedia(id);
        setItems(items.filter(i => i._id !== id));
        toast.success('Imagen eliminada de la biblioteca');
    }

    const handleSelect = () => {
        if (selected) {
            onSelect(selected);
            setOpen(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || <Button variant="outline" size="sm" icon={Grid}>Biblioteca</Button>}
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Biblioteca de Medios</DialogTitle>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto min-h-[400px] p-4 bg-gray-50/50 dark:bg-black/5 rounded-xl border border-black/5">
                    {loading ? (
                        <div className="flex justify-center py-20"><Loader2 className="animate-spin" /></div>
                    ) : items.length === 0 ? (
                        <div className="text-center py-20 text-gray-400">
                            <ImageIcon size={48} className="mx-auto mb-4 opacity-20" />
                            <p>No hay imágenes en tu biblioteca aún.</p>
                            <p className="text-sm">Sube imágenes usando el formulario normal.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {items.map((item) => (
                                <div
                                    key={item._id}
                                    onClick={() => setSelected(item.url)}
                                    className={cn(
                                        "relative group aspect-square rounded-xl overflow-hidden border-2 cursor-pointer transition-all bg-gray-100 dark:bg-white/5",
                                        selected === item.url ? "border-ios-blue ring-2 ring-ios-blue/30" : "border-transparent hover:border-gray-200"
                                    )}
                                >
                                    {item.type === 'image' ? (
                                        <Image
                                            src={item.url}
                                            alt={item.filename}
                                            fill
                                            className="object-cover"
                                        />
                                    ) : (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500 p-2">
                                            {item.type === 'audio' && <Music size={32} className="mb-2" />}
                                            {item.type === 'video' && <Video size={32} className="mb-2" />}
                                            {(item.type !== 'audio' && item.type !== 'video') && <FileText size={32} className="mb-2" />}
                                            <p className="text-[10px] text-center w-full truncate px-1">{item.filename}</p>
                                        </div>
                                    )}

                                    {selected === item.url && (
                                        <div className="absolute inset-0 bg-ios-blue/20 flex items-center justify-center z-10">
                                            <div className="bg-ios-blue text-white rounded-full p-1">
                                                <Check size={16} />
                                            </div>
                                        </div>
                                    )}
                                    <button
                                        onClick={(e) => handleDelete(item._id, e)}
                                        className="absolute top-1 right-1 p-1.5 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 z-20"
                                    >
                                        <Trash2 size={12} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="flex justify-end gap-2 pt-4">
                    <Button variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
                    <Button onClick={handleSelect} disabled={!selected}>Seleccionar</Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
