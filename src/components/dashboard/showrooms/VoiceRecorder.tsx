'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/Button';
import { Mic, Square, Loader2, Play, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface VoiceRecorderProps {
    onUpload: (url: string) => void;
    currentAudio?: string;
}

export default function VoiceRecorder({ onUpload, currentAudio }: VoiceRecorderProps) {
    const [isRecording, setIsRecording] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [audioUrl, setAudioUrl] = useState<string | null>(currentAudio || null);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                await uploadAudio(audioBlob);
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start();
            setIsRecording(true);
            toast.info("Grabando voz...");
        } catch (error) {
            console.error("Error accessing mic", error);
            toast.error("No se pudo acceder al micrófono");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    const uploadAudio = async (blob: Blob) => {
        setIsUploading(true);
        const loadingToast = toast.loading('Subiendo grabación...');

        try {
            const formData = new FormData();
            formData.append('file', blob, 'recording.webm');
            formData.append('context', 'showroom-audio');

            const response = await fetch('/api/upload/media', {
                method: 'POST',
                body: formData
            });

            const res = await response.json();

            if (response.ok && res.url) {
                onUpload(res.url);
                setAudioUrl(res.url);
                toast.success('Grabación guardada');
            } else {
                toast.error('Error al guardar: ' + (res.error || 'Error desconocido'));
            }
        } catch (error) {
            console.error(error);
            toast.error('Error de red al subir grabación');
        } finally {
            toast.dismiss(loadingToast);
            setIsUploading(false);
        }
    };

    const deleteRecording = () => {
        setAudioUrl(null);
        onUpload('');
    };

    return (
        <div className="flex items-center gap-2 bg-gray-50 dark:bg-black/20 p-2 rounded-xl border border-gray-200 dark:border-white/10">
            {!isRecording ? (
                <Button
                    size="sm"
                    variant="secondary"
                    className="h-8 gap-2 rounded-lg bg-red-500/10 text-red-600 hover:bg-red-500/20 border-transparent"
                    onClick={startRecording}
                    disabled={isUploading}
                >
                    <Mic size={14} />
                    {audioUrl ? 'Volver a Grabar' : 'Grabar Voz'}
                </Button>
            ) : (
                <Button
                    size="sm"
                    variant="destructive"
                    className="h-8 gap-2 animate-pulse rounded-lg"
                    onClick={stopRecording}
                >
                    <Square size={14} fill="currentColor" />
                    Detener
                </Button>
            )}

            {audioUrl && !isRecording && (
                <div className="flex items-center gap-2 ml-auto">
                    <audio src={audioUrl} className="hidden" id="mini-audio-preview" />
                    <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-blue-500"
                        onClick={() => {
                            const audio = document.getElementById('mini-audio-preview') as HTMLAudioElement;
                            audio?.play();
                        }}
                    >
                        <Play size={14} fill="currentColor" />
                    </Button>
                    <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-gray-400 hover:text-red-500"
                        onClick={deleteRecording}
                    >
                        <Trash2 size={14} />
                    </Button>
                </div>
            )}

            {isUploading && <Loader2 size={14} className="animate-spin text-ios-blue ml-auto" />}
        </div>
    );
}
