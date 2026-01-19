'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateShowroom, deleteShowroom, duplicateShowroom } from '@/actions/showroom';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input'; // Assuming exist
import { toast } from 'sonner';
import { ArrowLeft, Save, Eye, Trash2, GripVertical, Check, Plus, X, Copy } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { FileText } from 'lucide-react';
import ImageUpload from '@/components/ImageUpload';
import SlideManagerModal from './SlideManagerModal';
// No op (lines removed)

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
        isPublic: showroom.isPublic, // Keep for backward compat
        status: showroom.status || 'published',
        visibility: showroom.visibility || 'public',
        coverImage: showroom.coverImage || '',
        kioskEnabled: showroom.kioskEnabled !== undefined ? showroom.kioskEnabled : true,
        privacy: {
            showPrices: showroom.privacy?.showPrices || false,
            showSerialNumbers: showroom.privacy?.showSerialNumbers || false,
            showAcquisitionDate: showroom.privacy?.showAcquisitionDate || false,
            showStatus: showroom.privacy?.showStatus || false
        }
    });

    const [items, setItems] = useState<any[]>(showroom.items || []);
    const [isSaving, setIsSaving] = useState(false);
    const [slideModal, setSlideModal] = useState<{ open: boolean; itemIndex: number }>({ open: false, itemIndex: -1 });

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

    const handleDuplicate = async () => {
        if (!confirm("¿Crear una copia de este showroom?")) return;
        setIsSaving(true);
        const res = await duplicateShowroom(showroom._id);
        if (res.success && res.data) {
            toast.success("Showroom duplicado");
            router.push(`/dashboard/showrooms/${res.data._id}`);
        } else {
            toast.error("Error al duplicar");
            setIsSaving(false);
        }
    };

    const addItem = (collectionId: string) => {
        // V3: Magic Import V2 - Generate default sequence
        const details = collection.find(c => c._id === collectionId);
        const defaultSlides = [];

        // Slide 1: Main Image (Cover)
        const mainImage = details?.images?.[0]?.url || details?.instrumentId?.genericImages?.[0];
        if (mainImage) {
            defaultSlides.push({
                type: 'image',
                url: mainImage,
                layout: 'cover',
                caption: 'Vista Principal'
            });
        }

        // Slide 2: Specs (Text)
        const brand = details?.instrumentId?.brand || 'Marca Desc';
        const model = details?.instrumentId?.model || 'Modelo Desc';
        const year = details?.year ? `Año: ${details.year}` : '';
        const serial = (details?.serialNumber && showroom.privacy?.showSerialNumbers) ? `S/N: ${details.serialNumber}` : '';

        const specsText = `${brand} ${model}\n${details.instrumentId?.type || ''}\n${year}\n${serial}`;

        defaultSlides.push({
            type: 'text',
            text: specsText.trim(),
            layout: 'center', // or 'specs' if supported
            caption: 'Ficha Técnica'
        });

        // Slide 3: History (From Public Note if exists)
        // We use the initial public note from the item, usually explicitly added by user, 
        // but here we check if the collection item itself has some notes we want to promote?
        // Actually, the user requirement says "from publicNote if exists". 
        // Newly added items usually have empty publicNote in the showroom context, 
        // so maybe it refers to `details.publicNote` (if that existed in collection schema) 
        // OR we just leave it ready. 
        // BUT, if the user fills the publicNote in the editor, we might want to sync it?
        // For now, let's create it ONLY if the Collection Item has some "story" or we just create a placeholder?
        // "Auto-generate 'History' slide (Text slide from `publicNote` if exists)."
        // Since `publicNote` is a property of the ShowroomItem (which we are just creating), it is empty.
        // Unless it refers to `details?.notes` (private notes?). 
        // Let's assume for now we generate a placeholder slide IF the instrument has a description in the catalog/instrumentId?
        // Or maybe we just Create the slide structure and let the user fill it. 
        // Let's rely on `details.notes` (User's private notes) if we want to be helpful, 
        // BUT better safe than sorry: Let's create the slide only if there is explicit content.

        // checking `instrumentId.description` (Catalog description)
        if (details?.instrumentId?.description) {
            defaultSlides.push({
                type: 'text',
                text: details.instrumentId.description,
                layout: 'quote',
                caption: 'Historia del Modelo'
            });
        }

        setItems([...items, {
            collectionId,
            publicNote: '', // User can edit this for the "Cartel"
            placardText: '',
            displayOrder: items.length,
            slides: defaultSlides
        }]);
    };

    const removeItem = (collectionId: string) => {
        setItems(items.filter(i => i.collectionId !== collectionId));
    };

    // Helper to get collection item details
    const getItemDetails = (id: string) => collection.find(c => c._id === id);

    const generatePDF = () => {
        try {
            const doc = new jsPDF();

            // --- HEADER ---
            doc.setFontSize(20);
            doc.text(`Reporte: ${showroom.name}`, 14, 22);

            doc.setFontSize(10);
            doc.setTextColor(100);
            doc.text(`Generado el: ${new Date().toLocaleDateString()}`, 14, 28);
            doc.text("Instrument Collector App", 14, 33);

            // Fetch actual full items
            const fullItems = items.map(i => getItemDetails(i.collectionId)).filter(Boolean);

            // --- SUMMARY ---
            const totalItems = fullItems.length;
            const totalValue = fullItems.reduce((acc, item) => acc + (item.acquisition?.price || 0), 0);
            const currency = fullItems[0]?.acquisition?.currency || 'EUR';

            doc.setDrawColor(200);
            doc.line(14, 40, 196, 40);

            doc.setFontSize(12);
            doc.setTextColor(0);
            doc.text(`Total Ítems: ${totalItems}`, 14, 50);
            doc.text(`Valor Total Estimado: ${new Intl.NumberFormat('es-ES', { style: 'currency', currency }).format(totalValue)}`, 14, 56);

            // --- TABLE ---
            const tableData = fullItems.map(item => [
                `${item.instrumentId?.brand} ${item.instrumentId?.model}`,
                item.instrumentId?.type || 'Misc',
                item.instrumentId?.year || 'N/A',
                item.serialNumber || '---',
                item.acquisition?.price ? new Intl.NumberFormat('es-ES', { style: 'currency', currency: item.acquisition.currency }).format(item.acquisition.price) : '---'
            ]);

            autoTable(doc, {
                startY: 65,
                head: [['Instrumento', 'Tipo', 'Año', 'Nº Serie', 'Valor']],
                body: tableData,
                theme: 'striped',
                headStyles: { fillColor: [0, 0, 0] },
                styles: { fontSize: 10 },
            });

            doc.save(`${showroom.name.replace(/\s+/g, '_')}_Report.pdf`);
            toast.success("Reporte descargado");
        } catch (e) {
            console.error(e);
            toast.error("Error generando PDF");
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-200 dark:border-white/10 pb-6">
                <div className="flex items-center gap-3 w-full md:w-auto">
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

                <div className="flex flex-wrap gap-2 w-full md:w-auto items-center">
                    <Button variant="outline" size="sm" onClick={handleDuplicate} icon={Copy} disabled={isSaving}>
                        Duplicar
                    </Button>
                    <Button variant="outline" size="sm" onClick={generatePDF} icon={FileText}>
                        PDF
                    </Button>
                    <Link href={`/s/${showroom.slug}`} target="_blank" className="flex-1 md:flex-none">
                        <Button variant="secondary" icon={Eye} className="w-full">Ver Público</Button>
                    </Link>
                    <Button onClick={handleSave} disabled={isSaving} icon={Save} className="flex-1 md:flex-none w-full">
                        {isSaving ? 'Guardando...' : 'Guardar Cambios'}
                    </Button>
                </div>
            </div>

            {slideModal.itemIndex >= 0 && items[slideModal.itemIndex] && (
                <SlideManagerModal
                    open={slideModal.open}
                    onOpenChange={(open) => setSlideModal(prev => ({ ...prev, open }))}
                    initialSlides={items[slideModal.itemIndex].slides || []}
                    itemName={collection.find(c => c._id === items[slideModal.itemIndex].collectionId)?.instrumentId?.name || 'Instrumento'}
                    onSave={(newSlides) => {
                        const newItems = [...items];
                        newItems[slideModal.itemIndex].slides = newSlides;
                        setItems(newItems);
                    }}
                />
            )}

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
                            <label className="text-sm font-medium">Cartel (Portada)</label>
                            <ImageUpload
                                endpoint="/api/upload/showroom-cover"
                                currentImage={formData.coverImage}
                                onUpload={(url) => setFormData({ ...formData, coverImage: url })}
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

                    <div className="apple-card p-6 bg-white dark:bg-white/5 space-y-6">
                        <h3 className="font-bold border-b pb-2 dark:border-white/5">Estado y Visibilidad</h3>

                        {/* Status Select */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Estado del Showroom</label>
                            <select
                                className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg p-2"
                                value={formData.status}
                                onChange={e => setFormData({ ...formData, status: e.target.value })}
                            >
                                <option value="draft">Borrador (Privado)</option>
                                <option value="published">Publicado</option>
                                <option value="archived">Archivado (Solo lectura)</option>
                            </select>
                            <p className="text-xs text-gray-500">
                                {formData.status === 'draft' && "Solo tú puedes ver este showroom."}
                                {formData.status === 'published' && "Visible según configuración de privacidad."}
                                {formData.status === 'archived' && "No visible en listas públicas."}
                            </p>
                        </div>

                        {/* Visibility (Only if Published) */}
                        {formData.status === 'published' && (
                            <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                                <label className="text-sm font-medium">Visibilidad</label>
                                <div className="flex gap-2">
                                    {['public', 'unlisted', 'private'].map((mode) => (
                                        <button
                                            key={mode}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, visibility: mode })}
                                            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold uppercase tracking-wider border transition-colors ${formData.visibility === mode
                                                ? 'bg-ios-blue text-white border-transparent'
                                                : 'bg-transparent border-gray-200 dark:border-white/10 text-gray-500 hover:bg-gray-50 dark:hover:bg-white/5'
                                                }`}
                                        >
                                            {mode === 'public' && 'Público'}
                                            {mode === 'unlisted' && 'Oculto (Link)'}
                                            {mode === 'private' && 'Privado'}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="border-t border-gray-100 dark:border-white/5 pt-4">
                            <SimpleSwitch
                                label="Habilitar Modo Kiosko"
                                checked={formData.kioskEnabled}
                                onCheckedChange={c => setFormData({ ...formData, kioskEnabled: c })}
                            />
                            <p className="text-xs text-gray-500 -mt-2 mb-4">
                                Permite visualización a pantalla completa para museos o exposiciones físicas.
                            </p>
                        </div>

                        <div className="space-y-2 pt-4 border-t border-gray-100 dark:border-white/5">
                            <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400">Detalles de Privacidad</h4>
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
                            <SimpleSwitch
                                label="Mostrar Estado"
                                checked={formData.privacy.showStatus}
                                onCheckedChange={c => setFormData({ ...formData, privacy: { ...formData.privacy, showStatus: c } })}
                            />
                            <SimpleSwitch
                                label="Mostrar Fecha de Adquisición"
                                checked={formData.privacy.showAcquisitionDate}
                                onCheckedChange={c => setFormData({ ...formData, privacy: { ...formData.privacy, showAcquisitionDate: c } })}
                            />
                        </div>

                        <Button variant="destructive" className="w-full mt-4" onClick={handleDelete} icon={Trash2}>
                            Eliminar Showroom
                        </Button>
                    </div>

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
                                    <div key={item.collectionId} className="p-4 bg-gray-50 dark:bg-black/20 rounded-xl space-y-4 group border border-transparent hover:border-gray-200 dark:hover:border-white/10 transition-colors">
                                        <div className="flex gap-4 items-start">
                                            <div className="w-16 h-16 bg-white rounded-lg overflow-hidden shrink-0 relative shadow-sm">
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
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <p className="font-bold text-lg leading-tight">{details.instrumentId?.brand} {details.instrumentId?.model}</p>
                                                        <p className="text-xs text-gray-500 font-mono uppercase mt-1">{details.year || 'N/A'} • {details.instrumentId?.type}</p>
                                                    </div>
                                                    <button onClick={() => removeItem(item.collectionId)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors">
                                                        <X size={18} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Curator Fields */}
                                        <div className="space-y-3 pt-2 border-t border-black/5 dark:border-white/5">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-1">
                                                    <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Cartel de Museo (Placard)</label>
                                                    <textarea
                                                        className="w-full text-sm bg-white dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-lg p-2 min-h-[80px] focus:ring-2 ring-ios-blue/20 outline-none"
                                                        placeholder="Texto breve y poético para el cartel..."
                                                        value={item.placardText || ''}
                                                        onChange={(e) => {
                                                            const newItems = [...items];
                                                            newItems[idx].placardText = e.target.value;
                                                            setItems(newItems);
                                                        }}
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Ficha Técnica / Nota</label>
                                                    <textarea
                                                        className="w-full text-sm bg-white dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-lg p-2 min-h-[80px] focus:ring-2 ring-ios-blue/20 outline-none"
                                                        placeholder="Datos técnicos, historia de la adquisición..."
                                                        value={item.publicNote || ''}
                                                        onChange={(e) => {
                                                            const newItems = [...items];
                                                            newItems[idx].publicNote = e.target.value;
                                                            setItems(newItems);
                                                        }}
                                                    />
                                                </div>
                                            </div>

                                            {/* V3 Slides Preview */}
                                            <div className="pt-2 border-t border-black/5 dark:border-white/5">
                                                <div className="flex justify-between items-center mb-2">
                                                    <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                                                        Diapositivas ({item.slides?.length || 0})
                                                    </label>
                                                    <button
                                                        type="button"
                                                        className="text-xs text-ios-blue font-bold px-2 py-1 bg-ios-blue/10 rounded-full hover:bg-ios-blue/20 transition-colors"
                                                        onClick={() => setSlideModal({ open: true, itemIndex: idx })}
                                                    >
                                                        Gestionar
                                                    </button>
                                                </div>

                                                {item.slides && item.slides.length > 0 ? (
                                                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                                                        {item.slides.map((slide: any, sIdx: number) => (
                                                            <div key={sIdx} className="w-20 h-20 bg-gray-100 dark:bg-white/5 rounded-lg relative overflow-hidden shrink-0 border border-black/5 dark:border-white/5 group/slide">
                                                                {slide.type === 'image' && (
                                                                    <img src={slide.url} alt="Slide" className="w-full h-full object-cover" />
                                                                )}
                                                                {slide.type === 'text' && (
                                                                    <div className="w-full h-full p-2 bg-white dark:bg-black flex items-center justify-center">
                                                                        <span className="text-[10px] text-center text-gray-500 line-clamp-3">
                                                                            {slide.text}
                                                                        </span>
                                                                    </div>
                                                                )}
                                                                <div className="absolute top-1 right-1 bg-black/50 text-white rounded text-[8px] px-1">
                                                                    {sIdx + 1}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <p className="text-xs text-gray-400 italic">No hay diapositivas generadas.</p>
                                                )}
                                            </div>
                                        </div>
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
