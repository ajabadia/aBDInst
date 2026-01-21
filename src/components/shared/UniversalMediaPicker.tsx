'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { UploadCloud, Grid, Link as LinkIcon, X, Check } from 'lucide-react';
import MediaUpload from '@/components/shared/MediaUpload';
import MediaLibrary from '@/components/media/MediaLibrary';
import { toast } from 'sonner';

interface UniversalMediaPickerProps {
    onSelect: (url: string) => void;
    currentValue?: string;
    typeFilter?: 'image' | 'audio' | 'video';
    label?: string;
}

export default function UniversalMediaPicker({
    onSelect,
    currentValue,
    typeFilter = 'image',
    label = "Cambiar Media"
}: UniversalMediaPickerProps) {
    const [mode, setMode] = useState<'upload' | 'library' | 'url' | 'idle'>('idle');
    const [urlInput, setUrlInput] = useState('');

    const handleUrlSubmit = () => {
        if (urlInput.trim()) {
            onSelect(urlInput.trim());
            setMode('idle');
            setUrlInput('');
            toast.success("Enlace añadido");
        }
    };

    if (mode === 'idle') {
        return (
            <div className="flex gap-2">
                <Button
                    size="sm"
                    variant="outline"
                    icon={UploadCloud}
                    onClick={() => setMode('upload')}
                    className="h-8 text-[10px]"
                >
                    Subir
                </Button>
                <MediaLibrary
                    typeFilter={typeFilter}
                    onSelect={onSelect}
                    trigger={
                        <Button
                            size="sm"
                            variant="outline"
                            icon={Grid}
                            className="h-8 text-[10px]"
                        >
                            Biblioteca
                        </Button>
                    }
                />
                <Button
                    size="sm"
                    variant="outline"
                    icon={LinkIcon}
                    onClick={() => setMode('url')}
                    className="h-8 text-[10px]"
                >
                    URL
                </Button>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-2 p-1 bg-gray-100 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/10 animate-in fade-in slide-in-from-top-1">
            {mode === 'upload' && (
                <MediaUpload
                    onUpload={(url) => {
                        onSelect(url);
                        setMode('idle');
                    }}
                    accept={typeFilter === 'image' ? "image/*" : typeFilter === 'audio' ? "audio/*" : "*/*"}
                    label="Haga clic para subir"
                />
            )}

            {mode === 'url' && (
                <div className="flex gap-1 flex-1 px-1">
                    <input
                        className="flex-1 bg-white dark:bg-black/40 border-none rounded-lg px-3 py-1 text-xs outline-none focus:ring-1 ring-ios-blue"
                        placeholder="https://google.com/image.jpg..."
                        value={urlInput}
                        onChange={e => setUrlInput(e.target.value)}
                        autoFocus
                    />
                    <Button size="icon" variant="ghost" className="h-7 w-7 text-green-500" onClick={handleUrlSubmit}>
                        <Check size={14} />
                    </Button>
                </div>
            )}

            <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7 text-gray-400 hover:text-red-500"
                onClick={() => setMode('idle')}
            >
                <X size={14} />
            </Button>
        </div>
    );
}
