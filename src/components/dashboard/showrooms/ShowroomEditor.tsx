'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateShowroom, deleteShowroom } from '@/actions/showroom';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input'; // Assuming exist
import { Switch } from '@/components/ui/Switch'; // Assuming exist or use simple input
import { toast } from 'sonner';
import { ArrowLeft, Save, Eye, Trash2, GripVertical, Check, Plus, X } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

// Simple Switch Component if not available
function SimpleSwitch({ checked, onCheckedChange, label }: { checked: boolean; onCheckedChange: (c: boolean) => void; label: string }) {
    return (
        <div className="flex items-center justify-between py-3">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
            <button
                type="button"
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${checked ? 'bg-ios-blue' : 'bg-gray-200 dark:bg-gray-700'}`}
                onClick={() => onCheckedChange(!checked)}
            >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
        </div>
    );
}

export default function ShowroomEditor({ showroom, collection }: { showroom: any; collection: any[] }) {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: showroom.name,
        description: showroom.description || '',
        theme: showroom.theme || 'minimal',
        isPublic: showroom.isPublic,
        privacy: showroom.privacy || { showPrices: false, showSerialNumbers: false, showAcquisitionDate: false }
    });

    const [items, setItems] = useState<any[]>(showroom.items || []);
    const [isSaving, setIsSaving] = useState(false);

    // Available items (not in showroom)
    const availableItems = collection.filter(c => !items.find((i: any) => i.collectionId === c._id));

    const handleSave = async () => {
        setIsSaving(true);
        const res = await updateShowroom(showroom._id, {
            ...formData,
            items
        });

        if (res.success) {
            toast.success("Showroom actualizado");
        } else {
            toast.error("Error al guardar");
        }
        setIsSaving(false);
    };

    const handleDelete = async () => {
        if (!confirm("¿Seguro que quieres eliminar este showroom?")) return;
        await deleteShowroom(showroom._id);
        router.push('/dashboard/showrooms');
    };

    const addItem = (collectionId: string) => {
        setItems([...items, { collectionId, publicNote: '', displayOrder: items.length }]);
    };

    const removeItem = (collectionId: string) => {
        setItems(items.filter(i => i.collectionId !== collectionId));
    };

    // Helper to get collection item details
    const getItemDetails = (id: string) => collection.find(c => c._id === id);

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-200 dark:border-white/10 pb-6">
                <div className="flex items-center gap-3">
                    <Link href="/dashboard/showrooms">
                        <Button variant="secondary" size="icon" className="rounded-full w-10 h-10">
                            <ArrowLeft size={18} />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold">Editar Showroom</h1>
                        <p className="text-xs text-gray-500 font-mono">{showroom.slug}</p>
                    </div>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <Link href={`/s/${showroom.slug}`} target="_blank" className="flex-1 md:flex-none">
                        <Button variant="secondary" icon={Eye} className="w-full">Ver Público</Button>
                    </Link>
                    <Button onClick={handleSave} disabled={isSaving} icon={Save} className="flex-1 md:flex-none w-full">
                        {isSaving ? 'Guardando...' : 'Guardar Cambios'}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Settings */}
                <div className="space-y-6">
                    <div className="apple-card p-6 bg-white dark:bg-white/5 space-y-4">
                        <h3 className="font-bold border-b pb-2 dark:border-white/5">Configuración</h3>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Nombre</label>
                            <input
                                className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg p-2"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Descripción</label>
                            <textarea
                                className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg p-2 h-24"
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Tema Visual</label>
                            <select
                                className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg p-2"
                                value={formData.theme}
                                onChange={e => setFormData({ ...formData, theme: e.target.value })}
                            >
                                <option value="minimal">Minimalista (Blanco/Negro)</option>
                                <option value="dark">Dark Mode Puro</option>
                                <option value="boutique">Boutique (Serif + Oro)</option>
                            </select>
                        </div>
                    </div>

                    <div className="apple-card p-6 bg-white dark:bg-white/5 space-y-4">
                        <h3 className="font-bold border-b pb-2 dark:border-white/5">Privacidad</h3>
                        <SimpleSwitch
                            label="Público (Visible para todos)"
                            checked={formData.isPublic}
                            onCheckedChange={c => setFormData({ ...formData, isPublic: c })}
                        />
                        <SimpleSwitch
                            label="Mostrar Precios"
                            checked={formData.privacy.showPrices}
                            onCheckedChange={c => setFormData({ ...formData, privacy: { ...formData.privacy, showPrices: c } })}
                        />
                        <SimpleSwitch
                            label="Mostrar Números de Serie"
                            checked={formData.privacy.showSerialNumbers}
                            onCheckedChange={c => setFormData({ ...formData, privacy: { ...formData.privacy, showSerialNumbers: c } })}
                        />
                    </div>

                    <Button variant="destructive" className="w-full" onClick={handleDelete} icon={Trash2}>
                        Eliminar Showroom
                    </Button>
                </div>

                {/* Right: Items Manager */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Selected Items */}
                    <div className="apple-card p-6 bg-white dark:bg-white/5 min-h-[300px]">
                        <h3 className="font-bold mb-4 flex justify-between items-center">
                            Ítems en Exhibición ({items.length})
                            <span className="text-xs font-normal text-gray-500">Arrastra para reordenar (Pronto)</span>
                        </h3>

                        <div className="space-y-3">
                            {items.length === 0 && (
                                <p className="text-center text-gray-400 py-10">
                                    No hay instrumentos en este showroom. Añádelos desde abajo.
                                </p>
                            )}
                            {items.map((item, idx) => {
                                const details = getItemDetails(item.collectionId);
                                if (!details) return null;
                                return (
                                    <div key={item.collectionId} className="flex gap-4 p-3 bg-gray-50 dark:bg-black/20 rounded-xl items-center group">
                                        <div className="w-12 h-12 bg-white rounded-lg overflow-hidden shrink-0 relative">
                                            {details.images?.[0]?.url || details.instrumentId?.genericImages?.[0] ? (
                                                <Image
                                                    src={details.images?.[0]?.url || details.instrumentId?.genericImages?.[0]}
                                                    alt="thumb"
                                                    fill
                                                    className="object-cover"
                                                />
                                            ) : <div className="w-full h-full bg-gray-200" />}
                                        </div>
                                        <div className="flex-grow min-w-0">
                                            <p className="font-bold truncate">{details.instrumentId?.brand} {details.instrumentId?.model}</p>
                                            <input
                                                className="text-xs bg-transparent border-b border-transparent hover:border-gray-300 w-full focus:outline-none focus:border-blue-500 placeholder-gray-400"
                                                placeholder="Añadir nota pública..."
                                                value={item.publicNote || ''}
                                                onChange={(e) => {
                                                    const newItems = [...items];
                                                    newItems[idx].publicNote = e.target.value;
                                                    setItems(newItems);
                                                }}
                                            />
                                        </div>
                                        <button onClick={() => removeItem(item.collectionId)} className="p-2 text-gray-400 hover:text-red-500">
                                            <X size={18} />
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Available Items */}
                    <div className="apple-card p-6 bg-white dark:bg-white/5">
                        <h3 className="font-bold mb-4">Añadir de tu Colección</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-2">
                            {availableItems.map(inst => (
                                <div key={inst._id} className="flex items-center gap-3 p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg border border-transparent hover:border-black/5 cursor-pointer" onClick={() => addItem(inst._id)}>
                                    <div className="w-10 h-10 bg-white rounded-md overflow-hidden shrink-0 relative">
                                        {inst.images?.[0]?.url || inst.instrumentId?.genericImages?.[0] ? (
                                            <Image
                                                src={inst.images?.[0]?.url || inst.instrumentId?.genericImages?.[0]}
                                                alt="thumb"
                                                fill
                                                className="object-cover"
                                            />
                                        ) : <div className="w-full h-full bg-gray-200" />}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-bold truncate">{inst.instrumentId?.brand} {inst.instrumentId?.model}</p>
                                        <p className="text-xs text-gray-500">{inst.status}</p>
                                    </div>
                                    <Plus size={16} className="ml-auto text-ios-blue" />
                                </div>
                            ))}
                            {availableItems.length === 0 && <p className="text-sm text-gray-400 col-span-2 text-center">No quedan instrumentos disponibles.</p>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
