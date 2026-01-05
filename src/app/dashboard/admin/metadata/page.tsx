'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Upload, Trash2, Search, Save, Tag, Calendar, Music } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { upsertMetadata, deleteMetadata, getCatalogMetadata } from '@/actions/metadata';
import Image from 'next/image';
import { toast } from 'sonner';

interface MetadataItem {
    id?: string;
    type: 'brand' | 'decade' | 'type';
    key: string;
    label: string;
    assetUrl?: string;
    description?: string;
}

const TABS = [
    { id: 'brand', label: 'Marcas', icon: Tag },
    { id: 'type', label: 'Tipos', icon: Music },
    { id: 'decade', label: 'Décadas', icon: Calendar },
];

export default function MetadataPage() {
    const [activeTab, setActiveTab] = useState('brand');
    const [items, setItems] = useState<MetadataItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingItem, setEditingItem] = useState<Partial<MetadataItem> | null>(null);

    useEffect(() => {
        loadMetadata();
    }, [activeTab]);

    const loadMetadata = async () => {
        setLoading(true);
        const data = await getCatalogMetadata(activeTab);
        setItems(data as MetadataItem[]);
        setLoading(false);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingItem || !editingItem.key) return;

        const result = await upsertMetadata({
            type: activeTab as any,
            key: editingItem.key,
            label: editingItem.label || editingItem.key,
            assetUrl: editingItem.assetUrl,
            description: editingItem.description
        });

        if (result.success) {
            toast.success('Metadatos guardados correctamente');
            setEditingItem(null);
            loadMetadata();
        } else {
            toast.error('Error al guardar: ' + result.error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('¿Estás seguro de eliminar este metadato?')) return;
        const result = await deleteMetadata(id);
        if (result.success) {
            toast.success('Eliminado correctamente');
            loadMetadata();
        } else {
            toast.error('Error al eliminar');
        }
    };

    // Simplified Image Upload simulation (in real app would use Cloudinary/S3)
    // For now we allow pasting URL or simulated upload 
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // In a real scenario, upload to server here.
            // For this implementation, we'll prompt for URL or assume a prompt flow
            // But since I cannot implement full upload route right now without heavy changes,
            // I will guide the user to input a URL.
            alert("Por favor, introduce la URL de la imagen en el campo de texto. La subida directa de archivos requeriría una ruta de API adicional.");
        }
    };

    return (
        <div className="space-y-6">
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold apple-heading">Gestor de Metadatos</h1>
                    <p className="text-gray-500 dark:text-gray-400">Administra logos, iconos e imágenes para el catálogo.</p>
                </div>
                <Button onClick={() => setEditingItem({ type: activeTab as any, key: '', label: '' })} icon={Plus}>
                    Añadir Nuevo
                </Button>
            </header>

            {/* Tabs */}
            <div className="flex p-1 bg-gray-100 dark:bg-gray-800/50 rounded-2xl w-fit">
                {TABS.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`
                            flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all
                            ${activeTab === tab.id
                                ? 'bg-white dark:bg-gray-800 text-blue-600 shadow-sm'
                                : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'
                            }
                        `}
                    >
                        <tab.icon size={16} />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence mode="popLayout">
                    {items.map((item) => (
                        <motion.div
                            key={item.id}
                            layout
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 relative group hover:shadow-lg transition-all"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-2xl">
                                    {item.assetUrl ? (
                                        <div className="relative w-12 h-12">
                                            <Image
                                                src={item.assetUrl}
                                                alt={item.label}
                                                fill
                                                className="object-contain"
                                            />
                                        </div>
                                    ) : (
                                        <div className="w-12 h-12 flex items-center justify-center text-gray-400">
                                            <IconForType type={item.type} />
                                        </div>
                                    )}
                                </div>
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => setEditingItem(item)}
                                        className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(item.id!)}
                                        className="p-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>

                            <h3 className="font-bold text-lg">{item.label}</h3>
                            <code className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-lg">
                                {item.key}
                            </code>
                            {item.description && (
                                <p className="text-sm text-gray-500 mt-2 line-clamp-2">{item.description}</p>
                            )}
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Edit Modal */}
            <AnimatePresence>
                {editingItem && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            className="bg-white dark:bg-gray-900 rounded-[2rem] p-8 max-w-lg w-full shadow-2xl"
                        >
                            <h2 className="text-2xl font-bold mb-6">
                                {editingItem.id ? 'Editar Metadato' : 'Nuevo Metadato'}
                            </h2>

                            <form onSubmit={handleSave} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1 ml-1">Clave (ID)</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Ej: roland, 1980, synthesizer"
                                        value={editingItem.key || ''}
                                        onChange={e => setEditingItem({ ...editingItem, key: e.target.value })}
                                        className="apple-input-field"
                                    />
                                    <p className="text-xs text-gray-400 mt-1 ml-1">Debe coincidir exactamente con el valor en la base de datos (brand/type).</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1 ml-1">Etiqueta Visible</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Ej: Roland Corporation"
                                        value={editingItem.label || ''}
                                        onChange={e => setEditingItem({ ...editingItem, label: e.target.value })}
                                        className="apple-input-field"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1 ml-1">URL del Activo (Logo/Icono)</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="url"
                                            placeholder="https://..."
                                            value={editingItem.assetUrl || ''}
                                            onChange={e => setEditingItem({ ...editingItem, assetUrl: e.target.value })}
                                            className="apple-input-field"
                                        />
                                    </div>
                                    <p className="text-xs text-blue-500 mt-2 cursor-pointer hover:underline" onClick={() => window.open('https://worldvectorlogo.com', '_blank')}>
                                        Buscar logos vectoriales ↗
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1 ml-1">Descripción (Opcional)</label>
                                    <textarea
                                        rows={3}
                                        value={editingItem.description || ''}
                                        onChange={e => setEditingItem({ ...editingItem, description: e.target.value })}
                                        className="apple-input-field resize-none"
                                    />
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <Button type="button" variant="secondary" onClick={() => setEditingItem(null)} className="flex-1">
                                        Cancelar
                                    </Button>
                                    <Button type="submit" className="flex-1">
                                        Guardar
                                    </Button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

function IconForType({ type }: { type: string }) {
    switch (type) {
        case 'brand': return <Tag size={20} />;
        case 'decade': return <Calendar size={20} />;
        case 'type': return <Music size={20} />;
        default: return <Tag size={20} />;
    }
}
