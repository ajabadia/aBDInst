'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateArticle, deleteArticle } from '@/actions/blog';
import { generateBlogContent } from '@/actions/ai';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, Save, Sparkles, Image as ImageIcon, Link as LinkIcon, Trash2, Eye, Plus, X, Search, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { toast } from 'sonner';

interface ArticleEditorProps {
    article: any;
    collection: any[];
}

export default function ArticleEditor({ article, collection }: ArticleEditorProps) {
    const router = useRouter();
    const [formData, setFormData] = useState({
        title: article.title,
        slug: article.slug,
        excerpt: article.excerpt || '',
        content: article.content,
        status: article.status,
        coverImage: article.coverImage || '',
        tags: article.tags?.join(', ') || ''
    });

    const [relatedInstruments, setRelatedInstruments] = useState<any[]>(article.relatedInstruments || []);
    const [isSaving, setIsSaving] = useState(false);

    // AI State
    const [aiPrompt, setAiPrompt] = useState('');
    const [isAiGenerating, setIsAiGenerating] = useState(false);
    const [aiResponse, setAiResponse] = useState('');
    const [showAiModal, setShowAiModal] = useState(false);

    // Instrument Linker State
    const [showInstModal, setShowInstModal] = useState(false);
    const [instSearch, setInstSearch] = useState('');

    const handleSave = async () => {
        setIsSaving(true);
        const res = await updateArticle(article._id, {
            ...formData,
            tags: formData.tags.split(',').map((t: string) => t.trim()).filter(Boolean),
            relatedInstruments: relatedInstruments.map(i => i._id)
        });

        if (res.success) {
            toast.success("Cambios guardados");
        } else {
            toast.error("Error al guardar");
        }
        setIsSaving(false);
    };

    const handleAiGenerate = async () => {
        if (!aiPrompt) return;
        setIsAiGenerating(true);

        try {
            const context = {
                title: formData.title,
                currentContent: formData.content,
                linkedInstruments: relatedInstruments.map(i => ({ brand: i.instrumentId?.brand, model: i.instrumentId?.model, year: i.instrumentId?.year }))
            };

            const res = await generateBlogContent(aiPrompt, context);

            if (res.success) {
                setAiResponse(res.data);
            } else {
                toast.error(res.error || "Error generando contenido");
            }
        } catch (e) {
            console.error(e);
            toast.error("Error desconocido IA");
        }
        setIsAiGenerating(false);
    };

    const applyAiContent = () => {
        setFormData({ ...formData, content: formData.content + '\n\n' + aiResponse });
        setAiResponse('');
        setAiPrompt('');
        setShowAiModal(false);
        toast.success("Contenido añadido");
    };

    // Filter collection for linker
    const filteredCollection = collection.filter(item =>
        !relatedInstruments.find(r => r._id === item._id) &&
        (item.instrumentId?.brand?.toLowerCase().includes(instSearch.toLowerCase()) ||
            item.instrumentId?.model?.toLowerCase().includes(instSearch.toLowerCase()))
    );

    return (
        <div className="flex flex-col h-[calc(100vh-100px)]">
            {/* Toolbar */}
            <div className="flex justify-between items-center pb-4 border-b border-gray-200 dark:border-white/10 mb-6 shrink-0">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/blog">
                        <Button variant="secondary" size="icon" className="rounded-full w-10 h-10">
                            <ArrowLeft size={18} />
                        </Button>
                    </Link>
                    <div className="flex flex-col">
                        <input
                            className="bg-transparent text-xl font-bold focus:outline-none placeholder-gray-400"
                            value={formData.title}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                            placeholder="Título del Artículo"
                        />
                        <span className="text-xs text-gray-500 font-mono">/blog/{formData.slug}</span>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" icon={Sparkles} onClick={() => setShowAiModal(true)} className="border-ios-blue/50 text-ios-blue">
                        Asistente IA
                    </Button>
                    <div className="w-px h-8 bg-gray-200 dark:bg-white/10 mx-2" />
                    <select
                        className="bg-gray-100 dark:bg-white/10 rounded-lg px-3 text-sm border-none focus:ring-0"
                        value={formData.status}
                        onChange={e => setFormData({ ...formData, status: e.target.value })}
                    >
                        <option value="draft">Borrador</option>
                        <option value="published">Publicado</option>
                    </select>
                    <Button onClick={handleSave} disabled={isSaving} icon={Save}>
                        {isSaving ? 'Guardando...' : 'Guardar'}
                    </Button>
                </div>
            </div>

            <div className="flex gap-6 h-full min-h-0">
                {/* Main Editor */}
                <div className="flex-grow flex flex-col gap-4 overflow-y-auto pr-2">
                    <div className="flex gap-4">
                        <div className="w-1/3 space-y-2">
                            <label className="text-xs font-bold uppercase text-gray-400">Imagen Portada (URL)</label>
                            <input
                                className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg p-2 text-sm"
                                placeholder="https://..."
                                value={formData.coverImage}
                                onChange={e => setFormData({ ...formData, coverImage: e.target.value })}
                            />
                        </div>
                        <div className="w-2/3 space-y-2">
                            <label className="text-xs font-bold uppercase text-gray-400">Resumen (SEO)</label>
                            <input
                                className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg p-2 text-sm"
                                placeholder="Breve descripción..."
                                value={formData.excerpt}
                                onChange={e => setFormData({ ...formData, excerpt: e.target.value })}
                            />
                        </div>
                    </div>

                    <textarea
                        className="w-full flex-grow p-6 bg-white dark:bg-black/20 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-ios-blue/20 leading-relaxed font-serif text-lg"
                        placeholder="Empieza a escribir tu historia..."
                        value={formData.content}
                        onChange={e => setFormData({ ...formData, content: e.target.value })}
                    />
                </div>

                {/* Sidebar */}
                <div className="w-80 shrink-0 flex flex-col gap-6 border-l border-gray-200 dark:border-white/10 pl-6 overflow-y-auto">
                    {/* Related Instruments */}
                    <div>
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="font-bold text-sm uppercase text-gray-500">Instrumentos</h3>
                            <Button size="icon" variant="ghost" className="h-6 w-6" icon={Plus} onClick={() => setShowInstModal(true)} />
                        </div>

                        <div className="space-y-2">
                            {relatedInstruments.length === 0 && <p className="text-xs text-center py-4 text-gray-400 italic">Sin vinculaciones</p>}
                            {relatedInstruments.map(inst => (
                                <div key={inst._id} className="flex gap-3 bg-gray-50 dark:bg-white/5 p-2 rounded-lg items-center group">
                                    <div className="w-10 h-10 bg-white rounded overflow-hidden shrink-0 relative">
                                        {inst.instrumentId?.genericImages?.[0] && (
                                            <Image src={inst.instrumentId.genericImages[0]} alt="t" fill className="object-cover" />
                                        )}
                                    </div>
                                    <div className="min-w-0 flex-grow">
                                        <p className="text-xs font-bold truncate">{inst.instrumentId?.brand} {inst.instrumentId?.model}</p>
                                        <p className="text-[10px] text-gray-500">{inst.instrumentId?.year}</p>
                                    </div>
                                    <button
                                        onClick={() => setRelatedInstruments(relatedInstruments.filter(i => i._id !== inst._id))}
                                        className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 p-1"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Metadata */}
                    <div>
                        <h3 className="font-bold text-sm uppercase text-gray-500 mb-3">Etiquetas</h3>
                        <input
                            className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg p-2 text-sm"
                            placeholder="vintage, tour, reparación..."
                            value={formData.tags}
                            onChange={e => setFormData({ ...formData, tags: e.target.value })}
                        />
                    </div>
                </div>
            </div>

            {/* AI Modal */}
            {showAiModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-neutral-900 w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[85vh]">
                        <div className="p-4 border-b dark:border-white/10 flex justify-between items-center bg-gradient-to-r from-ios-blue/10 to-transparent rounded-t-2xl">
                            <h3 className="font-bold flex items-center gap-2 text-ios-blue">
                                <Sparkles size={18} />
                                Asistente de Redacción IA
                            </h3>
                            <button onClick={() => setShowAiModal(false)}><X size={20} /></button>
                        </div>

                        <div className="p-6 flex-grow overflow-y-auto space-y-4">
                            {!aiResponse ? (
                                <div className="space-y-4">
                                    <p className="text-sm text-gray-500">Describe qué quieres añadir o mejorar. La IA usará el título y el contenido actual como contexto.</p>
                                    <textarea
                                        className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl p-4 min-h-[120px] focus:ring-2 focus:ring-ios-blue"
                                        placeholder="Ej: Escribe una introducción sobre la historia de las Stratocaster en los 50..."
                                        value={aiPrompt}
                                        onChange={e => setAiPrompt(e.target.value)}
                                        autoFocus
                                    />
                                    <div className="flex gap-2 flex-wrap">
                                        {['Mejora la gramática', 'Expande el último párrafo', 'Añade una conclusión histórica', 'Sugiere un título mejor'].map(suggestion => (
                                            <button
                                                key={suggestion}
                                                onClick={() => setAiPrompt(suggestion)}
                                                className="text-xs bg-gray-100 dark:bg-white/5 hover:bg-ios-blue/10 hover:text-ios-blue px-3 py-1.5 rounded-full transition-colors"
                                            >
                                                {suggestion}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4 animate-in slide-in-from-bottom-2">
                                    <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-xl border border-gray-100 dark:border-white/10 prose dark:prose-invert max-w-none text-sm">
                                        <pre className="whitespace-pre-wrap font-sans">{aiResponse}</pre>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="p-4 border-t dark:border-white/10 flex justify-end gap-3 bg-gray-50/50 dark:bg-black/20 rounded-b-2xl">
                            {aiResponse ? (
                                <>
                                    <Button variant="ghost" onClick={() => setAiResponse('')}>Descartar</Button>
                                    <Button onClick={applyAiContent} icon={CheckCircle2}>Insertar en Artículo</Button>
                                </>
                            ) : (
                                <Button
                                    onClick={handleAiGenerate}
                                    disabled={!aiPrompt || isAiGenerating}
                                    className="w-full sm:w-auto bg-gradient-to-r from-ios-blue to-purple-600 hover:from-ios-blue/90 hover:to-purple-700 text-white border-none"
                                >
                                    {isAiGenerating ? (
                                        <span className="flex items-center gap-2"><div className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full" /> Generando...</span>
                                    ) : (
                                        <span className="flex items-center gap-2"><Sparkles size={16} /> Generar Contenido</span>
                                    )}
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Instrument Linker Modal */}
            {showInstModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-neutral-900 w-full max-w-md rounded-2xl shadow-2xl flex flex-col max-h-[60vh]">
                        <div className="p-4 border-b dark:border-white/10">
                            <h3 className="font-bold mb-3">Vincular Instrumento</h3>
                            <div className="relative">
                                <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
                                <input
                                    className="w-full bg-gray-100 dark:bg-white/5 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ios-blue"
                                    placeholder="Buscar en colección..."
                                    value={instSearch}
                                    onChange={e => setInstSearch(e.target.value)}
                                    autoFocus
                                />
                            </div>
                        </div>
                        <div className="flex-grow overflow-y-auto p-2">
                            {filteredCollection.length === 0 ? (
                                <div className="text-center py-8 text-gray-400 text-sm">
                                    <p>No se encontraron instrumentos.</p>
                                    {/* Future: Add "create basic instrument" button here */}
                                </div>
                            ) : (
                                <div className="space-y-1">
                                    {filteredCollection.map(item => (
                                        <button
                                            key={item._id}
                                            className="w-full flex items-center gap-3 p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg text-left group transition-colors"
                                            onClick={() => {
                                                setRelatedInstruments([...relatedInstruments, item]);
                                                setShowInstModal(false);
                                                setInstSearch('');
                                            }}
                                        >
                                            <div className="w-8 h-8 bg-gray-200 rounded overflow-hidden shrink-0 relative">
                                                {item.instrumentId?.genericImages?.[0] && (
                                                    <Image src={item.instrumentId.genericImages[0]} alt="t" fill className="object-cover" />
                                                )}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-bold truncate">{item.instrumentId?.brand} {item.instrumentId?.model}</p>
                                            </div>
                                            <Plus size={16} className="ml-auto text-gray-400 group-hover:text-ios-blue opacity-0 group-hover:opacity-100" />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="p-3 border-t dark:border-white/10 text-right">
                            <Button variant="ghost" size="sm" onClick={() => setShowInstModal(false)}>Cancelar</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
