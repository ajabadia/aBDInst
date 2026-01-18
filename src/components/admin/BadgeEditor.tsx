
'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { generateBadgePrompt, generateBadgeImage } from '@/actions/ai';
import { updateBadge, createBadge } from '@/actions/badge';
// import { uploadImage } from '@/actions/upload';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { Copy, Wand2, Loader2, Save, X, Image as ImageIcon } from 'lucide-react';

interface BadgeEditorProps {
    badge?: any;
    onClose: () => void;
    onSave: () => void;
}

export default function BadgeEditor({ badge, onClose, onSave }: BadgeEditorProps) {
    const [loading, setLoading] = useState(false);
    const [aiLoading, setAiLoading] = useState(false);
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [currentImage, setCurrentImage] = useState(badge?.imageUrl || '');

    // Form State
    const [formData, setFormData] = useState({
        code: badge?.code || '',
        name: badge?.name || '',
        description: badge?.description || '',
        category: badge?.category || 'milestone',
        active: badge?.active ?? true
    });

    const handleCopyPrompt = async () => {
        const prompt = await generateBadgePrompt(formData.name, formData.description);
        await navigator.clipboard.writeText(prompt);
        toast.success("Prompt copiado al portapapeles 📋");
    };

    const handleGenerateAI = async () => {
        if (!formData.name) return toast.error("Ponle un nombre primero");

        setAiLoading(true);
        try {
            const prompt = await generateBadgePrompt(formData.name, formData.description);
            // Call Server Action
            const result = await generateBadgeImage(prompt);
            if (result.success) {
                setGeneratedImage(result.url);
                toast.success("Imagen generada (Simulación)");
            }
        } catch (e) {
            toast.error("Error generando imagen");
        } finally {
            setAiLoading(false);
        }
    };

    const handleSave = async () => {
        setLoading(true);
        const data = new FormData();
        Object.entries(formData).forEach(([k, v]) => data.append(k, String(v)));
        if (currentImage) data.append('imageUrl', currentImage);

        const res = badge
            ? await updateBadge(badge._id, data)
            : await createBadge(data);

        if (res.success) {
            toast.success("Medalla guardada");
            onSave();
            onClose();
        } else {
            toast.error(res.error);
        }
        setLoading(false);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
                    <h2 className="text-lg font-bold flex items-center gap-2">
                        {badge ? 'Editar Trofeo' : 'Nuevo Trofeo'}
                        <span className="text-xs font-normal bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">AI Powered</span>
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition"><X size={18} /></button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* LEFT: INFO */}
                        <div className="space-y-4">
                            <div>
                                <label className="apple-label">Código (ID Único)</label>
                                <input
                                    className="apple-input font-mono uppercase text-sm"
                                    value={formData.code}
                                    onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                    placeholder="ej. SUPER_COLLECTOR"
                                />
                            </div>

                            <div>
                                <label className="apple-label">Nombre del Trofeo</label>
                                <input
                                    className="apple-input font-bold"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="ej. Maestro del Ritmo"
                                />
                            </div>

                            <div>
                                <label className="apple-label">Descripción</label>
                                <textarea
                                    className="apple-input min-h-[100px]"
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Otorgado por coleccionar 5 cajas de ritmos..."
                                />
                            </div>

                            <div>
                                <label className="apple-label">Categoría</label>
                                <select
                                    className="apple-select"
                                    value={formData.category}
                                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                                >
                                    <option value="milestone">Hito</option>
                                    <option value="community">Comunidad</option>
                                    <option value="special">Especial</option>
                                    <option value="instrument">Instrumento Específico</option>
                                </select>
                            </div>
                        </div>

                        {/* RIGHT: AI FACTORY */}
                        <div className="space-y-4">
                            <label className="apple-label flex items-center gap-2">
                                <Wand2 size={16} className="text-purple-500" />
                                Fábrica de Imagenes
                            </label>

                            <div className="relative aspect-square rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 flex items-center justify-center overflow-hidden bg-gray-50 dark:bg-gray-800 group">
                                {currentImage || generatedImage ? (
                                    <img src={generatedImage || currentImage || ''} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="text-center text-gray-400 p-4 w-full h-full flex flex-col items-center justify-center">
                                        <img
                                            src="/images/badges/badge-placeholder.png"
                                            className="w-24 h-24 object-contain opacity-50 mb-2"
                                        />
                                        <p className="text-xs">Imagen por Defecto</p>
                                    </div>
                                )}

                                {generatedImage && (
                                    <div className="absolute inset-x-0 bottom-0 p-3 bg-black/60 backdrop-blur text-white flex justify-center gap-3">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setCurrentImage(generatedImage);
                                                setGeneratedImage(null);
                                            }}
                                            className="text-xs font-bold hover:text-green-400"
                                        >
                                            Usar Esta
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-2">
                                <Button
                                    type="button"
                                    onClick={handleGenerateAI}
                                    disabled={aiLoading || loading}
                                    className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white"
                                >
                                    {aiLoading ? <Loader2 className="animate-spin" /> : <Wand2 size={16} />}
                                    Generar AI
                                </Button>

                                <label className="flex-1">
                                    <input
                                        type="file"
                                        accept="image/*,image/svg+xml"
                                        className="hidden"
                                        onChange={async (e) => {
                                            const file = e.target.files?.[0];
                                            if (!file) return;

                                            setLoading(true);
                                            const formData = new FormData();
                                            formData.append('file', file);
                                            formData.append('folder', 'badges');

                                            try {
                                                const uploadFormData = new FormData();
                                                uploadFormData.append('file', file);

                                                const response = await fetch('/api/upload/badge', {
                                                    method: 'POST',
                                                    body: uploadFormData
                                                });

                                                const res = await response.json();

                                                if (response.ok && res.url) {
                                                    setCurrentImage(res.url);
                                                    setGeneratedImage(null);
                                                    toast.success("Imagen subida correctamente");
                                                } else {
                                                    toast.error("Error al subir: " + (res.error || 'Error desconocido'));
                                                }
                                            } catch (err) {
                                                console.error(err);
                                                toast.error("Error en la subida");
                                            } finally {
                                                setLoading(false);
                                            }
                                        }}
                                        disabled={loading}
                                    />
                                    <span className={cn(
                                        "flex items-center justify-center gap-2 h-full rounded-xl font-semibold cursor-pointer transition-all",
                                        "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600",
                                        loading && "opacity-50 pointer-events-none"
                                    )}>
                                        <ImageIcon size={16} />
                                        Subir
                                    </span>
                                </label>

                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={handleCopyPrompt}
                                    title="Copiar Prompt"
                                    className="w-10 px-0"
                                >
                                    <Copy size={16} />
                                </Button>
                            </div>

                            <div className="text-[10px] text-gray-500 p-2 bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-100 dark:border-yellow-900 rounded-lg">
                                Tip: Usa "Copiar Prompt" para probar en DALL-E, Midjourney o Imagen si la generación directa no te convence.
                            </div>

                            <div>
                                <label className="apple-label">URL Manual</label>
                                <input
                                    className="apple-input text-xs"
                                    value={currentImage}
                                    onChange={e => setCurrentImage(e.target.value)}
                                    placeholder="https://cloudinary..."
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-3 bg-gray-50/50 dark:bg-gray-800/50">
                    <Button variant="ghost" onClick={onClose} disabled={loading}>Cancelar</Button>
                    <Button onClick={handleSave} disabled={loading} className="bg-ios-blue text-white">
                        {loading ? <Loader2 className="animate-spin" /> : <Save size={16} />}
                        Guardar Trofeo
                    </Button>
                </div>
            </div>
        </div>
    );
}

