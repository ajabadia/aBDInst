'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Save, X, Search, Filter, Tag, Upload, Music, Calendar, Edit3, Globe, Layers, RotateCw, Loader2 } from 'lucide-react';
import DragDropUploader from './DragDropUploader';
import { Button } from '@/components/ui/Button';
import { upsertMetadata, deleteMetadata, getCatalogMetadata, refreshArtistMetadata } from '@/actions/metadata';
import Image from 'next/image';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface MetadataItem {
    id?: string;
    type: 'brand' | 'decade' | 'type' | 'artist';
    key: string;
    label: string;
    assetUrl?: string;
    description?: string;
    images?: Array<{
        url: string;
        isPrimary: boolean;
        source?: 'manual' | 'discogs' | 'spotify';
        externalId?: string;
    }>;
}

// Separate component for images with loading state
function MetadataImage({ src, alt, isPrimary, onClick, onDelete }: {
    src: string;
    alt: string;
    isPrimary?: boolean;
    onClick: () => void;
    onDelete: (e: React.MouseEvent) => void;
}) {
    const [isLoaded, setIsLoaded] = useState(false);

    return (
        <div
            onClick={onClick}
            className={cn(
                "relative aspect-square rounded-xl overflow-hidden border-2 transition-all group shadow-sm cursor-pointer",
                isPrimary ? "border-ios-blue ring-4 ring-ios-blue/10" : "border-transparent opacity-80 hover:opacity-100 hover:scale-[1.02]"
            )}>
            {!isLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/5 dark:bg-white/5">
                    <Loader2 className="w-5 h-5 text-ios-blue animate-spin opacity-50" />
                </div>
            )}
            <Image
                src={src}
                alt={alt}
                fill
                className={cn(
                    "object-cover transition-opacity duration-300",
                    isLoaded ? "opacity-100" : "opacity-0"
                )}
                onLoad={() => setIsLoaded(true)}
            />
            <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 bg-black/40 transition-opacity">
                {!isPrimary && (
                    <div className="bg-white/90 dark:bg-black/40 p-2 rounded-full text-ios-blue shadow-lg">
                        <Plus size={20} className="rotate-45" />
                        <p className="text-[10px] font-bold mt-1 text-center">PRINCIPAL</p>
                    </div>
                )}
                <Button
                    size="icon"
                    variant="ghost"
                    className="w-8 h-8 rounded-full text-white hover:text-red-500 bg-black/20"
                    onClick={onDelete}
                >
                    <Trash2 size={12} />
                </Button>
            </div>
            {isPrimary && (
                <div className="absolute top-2 right-2 bg-ios-blue text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase shadow-md">
                    PRINCIPAL
                </div>
            )}
        </div>
    );
}

const TABS = [
    { id: 'brand', label: 'Marcas', icon: Tag, color: 'text-ios-blue', bg: 'bg-ios-blue/10' },
    { id: 'type', label: 'Tipos', icon: Music, color: 'text-ios-indigo', bg: 'bg-ios-indigo/10' },
    { id: 'decade', label: 'Décadas', icon: Calendar, color: 'text-ios-orange', bg: 'bg-ios-orange/10' },
    { id: 'artist', label: 'Artistas', icon: Globe, color: 'text-ios-green', bg: 'bg-ios-green/10' },
];

import BatchArtistImporter from './BatchArtistImporter';

export default function MetadataManager({ initialData }: { initialData: any[] }) {
    const searchParams = useSearchParams();
    const router = useRouter();
    const tabParam = searchParams.get('tab');

    // Validate tabParam against TABS, fallback to 'brand'
    const validTabs = TABS.map(t => t.id);
    const initialTab = (tabParam && validTabs.includes(tabParam)) ? tabParam : 'brand';

    const [activeTab, setActiveTab] = useState(initialTab);
    const [items, setItems] = useState<MetadataItem[]>(initialData as MetadataItem[]);
    const [loading, setLoading] = useState(false);
    const [editingItem, setEditingItem] = useState<Partial<MetadataItem> | null>(null);
    const [showBatchImport, setShowBatchImport] = useState(false);

    useEffect(() => {
        loadMetadata();
        // Update URL to match active tab for deep linking
        const params = new URLSearchParams(window.location.search);
        params.set('tab', activeTab);
        router.replace(`${window.location.pathname}?${params.toString()}`, { scroll: false });
    }, [activeTab]);

    const loadMetadata = async () => {
        setLoading(true);
        try {
            const data = await getCatalogMetadata(activeTab);
            setItems(data as MetadataItem[]);
        } catch (e) {
            toast.error("Error al cargar metadatos");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e?: React.FormEvent | React.MouseEvent) => {
        if (e) e.preventDefault();
        if (!editingItem || !editingItem.key) return;

        const result = await upsertMetadata({
            type: activeTab as any,
            key: editingItem.key,
            label: editingItem.label || editingItem.key,
            assetUrl: editingItem.assetUrl,
            images: editingItem.images,
            description: editingItem.description
        });

        if (result.success) {
            toast.success('Metadatos actualizados');
            setEditingItem(null);
            loadMetadata();
        } else {
            toast.error('Error: ' + result.error);
        }
    };

    const handleDelete = async (id: string) => {
        const result = await deleteMetadata(id);
        if (result.success) {
            toast.success('Eliminado');
            loadMetadata();
        } else {
            toast.error('Error al eliminar');
        }
    };

    const handleRefresh = async (id: string, label: string) => {
        const promise = refreshArtistMetadata(id);

        toast.promise(promise, {
            loading: `Refrescando datos de ${label}...`,
            success: (res) => {
                if (res.success) {
                    loadMetadata();
                    // If we are currently editing this item, update the form
                    if (editingItem?.id === id) {
                        setEditingItem(res.data);
                    }
                    return 'Datos actualizados desde Discogs';
                }
                throw new Error(res.error || 'No se encontraron datos');
            },
            error: (err) => err.message
        });
    };

    return (
        <div className="max-w-7xl mx-auto space-y-10 p-2 md:p-6">
            <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-4xl font-bold tracking-tight">Arquitectura del Catálogo</h1>
                    <p className="text-gray-500 dark:text-gray-400 font-medium text-lg">Define logos, categorías y periodos maestros.</p>
                </div>
                <div className="flex gap-3">
                    {activeTab === 'artist' && (
                        <Button
                            variant="secondary"
                            onClick={() => setShowBatchImport(true)}
                            icon={Upload}
                            className="rounded-[1.25rem]"
                        >
                            Importación Masiva
                        </Button>
                    )}
                    <Button onClick={() => setEditingItem({ type: activeTab as any, key: '', label: '' })} icon={Plus} className="shadow-apple-glow">
                        Crear Entrada
                    </Button>
                </div>
            </header>

            {/* Apple Segmented Control */}
            <div className="flex p-1.5 bg-black/5 dark:bg-white/5 rounded-2xl w-fit border border-black/5 dark:border-white/5">
                {TABS.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={cn(
                            "flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-200",
                            activeTab === tab.id
                                ? "bg-white dark:bg-white/15 text-ios-blue dark:text-white shadow-apple-sm border border-black/5 dark:border-white/5"
                                : "text-gray-500 hover:text-gray-900 dark:hover:text-gray-300"
                        )}
                    >
                        <tab.icon size={16} className={cn(activeTab === tab.id ? tab.color : "opacity-50")} />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Items Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                <AnimatePresence mode="popLayout">
                    {items.map((item) => (
                        <motion.div
                            key={item.id}
                            layout
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="apple-card p-6 bg-white dark:bg-white/5 group relative overflow-hidden"
                        >
                            <div className="flex items-start justify-between mb-6">
                                <div className="w-16 h-16 rounded-[1.25rem] bg-black/[0.03] dark:bg-white/[0.03] flex items-center justify-center p-3 relative group-hover:scale-105 transition-transform">
                                    {item.assetUrl ? (
                                        <Image
                                            src={item.assetUrl}
                                            alt={item.label}
                                            width={48}
                                            height={48}
                                            className="object-contain"
                                        />
                                    ) : (
                                        <div className="text-gray-300 dark:text-gray-600">
                                            <IconForType type={item.type} size={32} />
                                        </div>
                                    )}
                                </div>
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-1 group-hover:translate-y-0">
                                    {item.type === 'artist' && (
                                        <Button
                                            size="icon"
                                            variant="secondary"
                                            onClick={() => handleRefresh(item.id!, item.label)}
                                            className="rounded-full w-8 h-8 hover:text-ios-blue"
                                            title="Refrescar de Discogs"
                                        >
                                            <RotateCw size={14} />
                                        </Button>
                                    )}
                                    <Button size="icon" variant="secondary" onClick={() => setEditingItem(item)} className="rounded-full w-8 h-8">
                                        <Edit3 size={14} />
                                    </Button>
                                    <Button size="icon" variant="destructive" onClick={() => handleDelete(item.id!)} className="rounded-full w-8 h-8">
                                        <Trash2 size={14} />
                                    </Button>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <h3 className="font-bold text-lg tracking-tight leading-tight">{item.label}</h3>
                                <code className="inline-block text-[10px] font-bold text-ios-blue bg-ios-blue/5 px-2 py-0.5 rounded-md uppercase tracking-wider">
                                    {item.key}
                                </code>
                                {item.description && (
                                    <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed pt-2">
                                        {item.description}
                                    </p>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Apple Pro Modal */}
            <AnimatePresence>
                {editingItem && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setEditingItem(null)}
                            className="absolute inset-0 bg-black/20 dark:bg-black/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="glass-panel rounded-[2.5rem] p-6 md:p-10 max-w-5xl w-[95%] md:w-[80%] shadow-apple-lg relative z-10 overflow-hidden max-h-[90vh] flex flex-col"
                        >
                            {/* Modal Close Button */}
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setEditingItem(null)}
                                className="absolute top-6 right-6 rounded-full hover:bg-black/5 z-20"
                            >
                                <X size={20} />
                            </Button>

                            <div className="flex items-center gap-4 mb-8 flex-shrink-0">
                                <div className="p-3 bg-ios-blue/10 text-ios-blue rounded-2xl">
                                    <Layers size={24} />
                                </div>
                                <h2 className="text-3xl font-bold tracking-tight">
                                    {editingItem.id ? 'Editar Detalle' : 'Nueva Entrada'}
                                </h2>
                                {editingItem.id && editingItem.type === 'artist' && (
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        onClick={() => handleRefresh(editingItem.id!, editingItem.label || '')}
                                        icon={RotateCw}
                                        className="ml-auto rounded-full"
                                    >
                                        Refrescar
                                    </Button>
                                )}
                            </div>

                            <form onSubmit={handleSave} className="space-y-8 overflow-y-auto pr-2 custom-scrollbar pb-4 flex-grow">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="apple-label ml-1">Identificador (Key)</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="ej: roland"
                                            value={editingItem.key || ''}
                                            onChange={e => setEditingItem({ ...editingItem, key: e.target.value.toLowerCase().trim() })}
                                            className="apple-input-field font-mono"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="apple-label ml-1">Nombre Visible</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="ej: Roland Corp"
                                            value={editingItem.label || ''}
                                            onChange={e => setEditingItem({ ...editingItem, label: e.target.value })}
                                            className="apple-input-field"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <label className="apple-label ml-1 flex items-center gap-2">
                                        <Globe size={14} className="text-ios-blue" />
                                        Galería de Imágenes
                                    </label>

                                    {/* Existing Images Gallery */}
                                    {editingItem.images && editingItem.images.length > 0 && (
                                        <div className="p-4 bg-black/5 dark:bg-white/5 rounded-[2rem] border border-black/5 dark:border-white/5">
                                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                                {editingItem.images.map((img, idx) => (
                                                    <MetadataImage
                                                        key={idx}
                                                        src={img.url}
                                                        alt={`Image ${idx}`}
                                                        isPrimary={img.isPrimary}
                                                        onClick={() => {
                                                            if (img.isPrimary) return;
                                                            const newImages = editingItem.images?.map((i, k) => ({
                                                                ...i,
                                                                isPrimary: k === idx
                                                            }));
                                                            setEditingItem({
                                                                ...editingItem,
                                                                images: newImages,
                                                                assetUrl: img.url
                                                            });
                                                        }}
                                                        onDelete={(e) => {
                                                            e.stopPropagation();
                                                            const newImages = editingItem.images?.filter((_, k) => k !== idx);
                                                            let newAssetUrl = editingItem.assetUrl;
                                                            if (img.isPrimary) {
                                                                newAssetUrl = newImages && newImages.length > 0 ? newImages[0].url : undefined;
                                                                if (newImages && newImages.length > 0) newImages[0].isPrimary = true;
                                                            }
                                                            setEditingItem({
                                                                ...editingItem,
                                                                images: newImages,
                                                                assetUrl: newAssetUrl
                                                            });
                                                        }}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <DragDropUploader
                                        value={undefined} // Always empty for "Add to Gallery"
                                        onUpload={(url) => {
                                            const newImage: NonNullable<MetadataItem['images']>[number] = { url, isPrimary: !editingItem.images?.length, source: 'manual' };
                                            const newImages = [...(editingItem.images || []), newImage];
                                            setEditingItem({
                                                ...editingItem,
                                                images: newImages,
                                                assetUrl: newImage.isPrimary ? url : editingItem.assetUrl
                                            });
                                        }}
                                    />
                                    <p className="text-[11px] text-gray-400 font-medium px-1 text-center">
                                        Arrastra para añadir a la galería. La primera será la principal por defecto.
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <label className="apple-label ml-1">Notas del Sistema</label>
                                    <textarea
                                        rows={3}
                                        value={editingItem.description || ''}
                                        onChange={e => setEditingItem({ ...editingItem, description: e.target.value })}
                                        className="apple-input-field resize-none"
                                        placeholder="Información adicional sobre este metadato..."
                                    />
                                </div>
                            </form>

                            {/* Sticky Footer */}
                            <div className="flex gap-4 pt-6 border-t border-black/5 dark:border-white/5 bg-white/50 dark:bg-black/20 backdrop-blur-md flex-shrink-0 -mx-10 px-10 -mb-10 pb-10 mt-4 h-32 items-center">
                                <Button type="button" variant="secondary" onClick={() => setEditingItem(null)} className="flex-1 rounded-2xl h-12 text-base font-bold">
                                    Descartar
                                </Button>
                                <Button type="button" onClick={handleSave} className="shadow-apple-glow flex-1 rounded-2xl h-12 text-base font-bold">
                                    Guardar Cambios
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                )}

                {showBatchImport && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowBatchImport(false)}
                            className="absolute inset-0 bg-black/20 dark:bg-black/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="glass-panel rounded-[2.5rem] p-6 md:p-10 max-w-2xl w-[95%] shadow-apple-lg relative z-10 overflow-hidden max-h-[90vh] flex flex-col"
                        >
                            <BatchArtistImporter onClose={() => setShowBatchImport(false)} />
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

function IconForType({ type, size = 20 }: { type: string, size?: number }) {
    switch (type) {
        case 'brand': return <Tag size={size} />;
        case 'decade': return <Calendar size={size} />;
        case 'type': return <Music size={size} />;
        case 'artist': return <Globe size={size} />;
        default: return <Tag size={size} />;
    }
}
