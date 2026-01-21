'use client';

import { createInstrument, updateInstrument, getInstruments } from '@/actions/instrument';
import { useFormStatus } from 'react-dom';
import FileUpload from './FileUpload';
import { SPEC_CATEGORIES, PREDEFINED_SPECS } from '@/lib/spec-constants';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Tabs, Tab } from '@/components/Tabs';
import { useSession } from 'next-auth/react';
import { Button } from './ui/Button';
import { Save, X, Star, StarOff, Globe, Link as LinkIcon, FileText, Plus, Search, Sparkles, Zap, Users, Disc3 } from 'lucide-react';
import ResourceSection from './resources/ResourceSection';
import MagicImporter from './MagicImporter';
import MusicalContextSection from './instrument/MusicalContextSection';
import MediaLibrary from './media/MediaLibrary';
import MarketInsights from './instruments/MarketInsights';
import { getDeepEnrichment } from '@/actions/enrichment';



interface InstrumentFormProps {
    initialData?: any;
    instrumentId?: string;
    resources?: any[];
}

// Simplified internal types for the form state
type SpecItem = { category: string; label: string; value: string };

export default function InstrumentForm({ initialData, instrumentId, resources = [] }: InstrumentFormProps) {
    const { data: session } = useSession();
    const userRole = (session?.user as any)?.role || 'user';
    const isAdmin = userRole === 'admin';
    const isPrivileged = ['admin', 'editor', 'supereditor'].includes(userRole);

    const isEditing = !!instrumentId;
    // Initialize specs from initialData or empty array
    // initialData.specs might be an array (new format) or object (old format - we should probably ignore old format or migrate manually)
    // For now assuming array or empty.
    const [specs, setSpecs] = useState<SpecItem[]>(Array.isArray(initialData?.specs) ? initialData.specs : []);
    const [images, setImages] = useState<string[]>(initialData?.genericImages || []);
    const [websites, setWebsites] = useState<{ url: string, isPrimary: boolean }[]>(
        Array.isArray(initialData?.websites)
            ? initialData.websites
            : (initialData?.website ? [{ url: initialData.website, isPrimary: true }] : [])
    );

    // Documents state
    const [documents, setDocuments] = useState<{ title: string, url: string, type: string }[]>(initialData?.documents || []);

    // Market Value State (Centralized)
    const [marketValue, setMarketValue] = useState(initialData?.marketValue || { original: {}, current: {}, history: [] });

    // State for all instruments (to populate parentId selector)
    const [allInstruments, setAllInstruments] = useState<any[]>([]);

    // Multiple Relationships
    const [relatedGearIds, setRelatedGearIds] = useState<string[]>(
        Array.isArray(initialData?.relatedTo)
            ? initialData.relatedTo.map((i: any) => i._id || i)
            : (initialData?.relatedTo ? [initialData.relatedTo._id || initialData.relatedTo] : [])
    );

    // Inheritance States
    const [parentId, setParentId] = useState<string>(initialData?.parentId?._id || initialData?.parentId || '');
    const [excludedImages, setExcludedImages] = useState<string[]>(initialData?.excludedImages || []);
    const [parentImages, setParentImages] = useState<string[]>([]);

    // Musical Context (for enrichment)
    const [artists, setArtists] = useState<any[]>(initialData?.artists || []);
    const [albums, setAlbums] = useState<any[]>(initialData?.albums || []);

    // Controlled Identification State
    const [brand, setBrand] = useState(initialData?.brand || '');
    const [model, setModel] = useState(initialData?.model || '');
    const [type, setType] = useState(initialData?.type || 'Synthesizer');
    const [subtype, setSubtype] = useState(initialData?.subtype || '');
    const [version, setVersion] = useState(initialData?.version || '');
    const [variantLabel, setVariantLabel] = useState(initialData?.variantLabel || '');
    const [years, setYears] = useState(Array.isArray(initialData?.years) ? initialData.years.join(', ') : (initialData?.years || ''));
    const [description, setDescription] = useState(initialData?.description || '');
    const [reverbUrl, setReverbUrl] = useState(initialData?.reverbUrl || '');

    useEffect(() => {
        getInstruments().then(setAllInstruments);
    }, []);

    const addRelatedGear = (id: string) => {
        if (id && !relatedGearIds.includes(id)) {
            setRelatedGearIds([...relatedGearIds, id]);
        }
    };

    const removeRelatedGear = (id: string) => {
        setRelatedGearIds(relatedGearIds.filter(i => i !== id));
    };

    // Effect to fetch parent images when parentId changes
    useEffect(() => {
        if (parentId) {
            const parent = allInstruments.find(i => i._id === parentId);
            if (parent?.genericImages) {
                setParentImages(parent.genericImages);
            } else {
                // If not found in current list (maybe because only basic fields were fetched), 
                // we could do a more specific fetch, but for now let's assume all instruments list has them.
                // Wait, getInstruments in InstrumentForm.tsx (src/actions/instrument.ts) selects genericImages. 
            }
        } else {
            setParentImages([]);
            setExcludedImages([]);
        }
    }, [parentId, allInstruments]);

    const toggleImageExclusion = (url: string) => {
        setExcludedImages(prev =>
            prev.includes(url) ? prev.filter(u => u !== url) : [...prev, url]
        );
    };

    const addWebsite = () => {
        setWebsites(prev => [...prev, { url: '', isPrimary: prev.length === 0 }]);
    };

    const removeWebsite = (index: number) => {
        setWebsites(prev => {
            const next = prev.filter((_, i) => i !== index);
            // If we removed the primary, make the first one primary
            if (prev[index].isPrimary && next.length > 0) {
                next[0].isPrimary = true;
            }
            return next;
        });
    };

    const updateWebsite = (index: number, val: string) => {
        setWebsites(prev => {
            const next = [...prev];
            next[index] = { ...next[index], url: val };
            return next;
        });
    };

    const togglePrimaryWebsite = (index: number) => {
        setWebsites(prev => prev.map((ws, i) => ({
            ...ws,
            isPrimary: i === index
        })));
    };

    const addImage = (url: string) => {
        setImages(prev => [...prev, url]);
    };

    const removeImage = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index));
    };

    const makeMainImage = (index: number) => {
        setImages(prev => {
            const newImages = [...prev];
            const [selected] = newImages.splice(index, 1);
            newImages.unshift(selected);
            return newImages;
        });
    };

    // Document Helpers
    const addDocument = (urls: string[]) => {
        const newDocs = urls.map(url => ({
            title: url.split('/').pop() || 'Documento',
            url: url,
            type: url.split('.').pop() || 'file'
        }));
        setDocuments(prev => [...prev, ...newDocs]);
    };

    const removeDocument = (index: number) => {
        const newDocs = [...documents];
        newDocs.splice(index, 1);
        setDocuments(newDocs);
    };

    const updateDocumentTitle = (index: number, title: string) => {
        const newDocs = [...documents];
        newDocs[index].title = title;
        setDocuments(newDocs);
    };

    // Helper to add a spec
    const addSpec = (category: string) => {
        setSpecs([...specs, { category, label: '', value: '' }]);
    };

    // Helper to remove a spec
    const removeSpec = (index: number) => {
        const newSpecs = [...specs];
        newSpecs.splice(index, 1);
        setSpecs(newSpecs);
    };

    // Helper to update a spec field
    const updateSpec = (index: number, field: keyof SpecItem, newValue: string) => {
        const newSpecs = [...specs];
        newSpecs[index][field] = newValue;
        setSpecs(newSpecs);
    };

    const router = useRouter();

    async function action(formData: FormData) {
        let serverActionResult;
        if (isEditing && instrumentId) {
            serverActionResult = await updateInstrument(instrumentId, formData);
        } else {
            serverActionResult = await createInstrument(formData);
        }

        if (serverActionResult.error) {
            toast.error('Error: ' + serverActionResult.error);
        } else {
            toast.success(isEditing ? 'Instrumento actualizado correctamente' : 'Instrumento creado correctamente');
            router.push(isEditing ? `/instruments/${instrumentId}` : '/instruments');
            router.refresh(); // Ensure data is fresh
        }
    }

    return (
        <form action={action} className="space-y-6 max-w-7xl mx-auto apple-card p-8 md:p-12 shadow-2xl">

            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-4">
                    {/* Admin Status Selector */}
                    {/* We need to know if user is admin. Since this is a client component, we rely on passed props or assume ability if status was passed. 
                        Ideally, pass `isAdmin` prop. 
                        For now, let's keep the select but disable it if not privileged? 
                        Actually, typical users shouldn't see this form for 'new' often unless we enable the 'Contribute' button.
                        Let's assume if they can see the 'status' prop it is because they are editing. 
                    */}
                    <select
                        name="status"
                        defaultValue={initialData?.status || 'published'}
                        className="apple-select w-40 font-bold text-sm"
                    >
                        <option value="draft">Draft (Borrador)</option>
                        <option value="pending">Pendiente Rev.</option>
                        <option value="published">Publicado</option>
                        <option value="archived">Archivado</option>
                        <option value="rejected">Rechazado</option>
                    </select>
                </div>

                <MagicImporter
                    isAdmin={isAdmin}
                    isPrivileged={isPrivileged}
                    existingDescription={description}
                    existingSpecs={specs}
                    initialSearch={isEditing ? `${initialData?.brand || ''} ${initialData?.model || ''}`.trim() : undefined}
                    contextUrls={[
                        ...websites.map(w => w.url),
                        ...documents.map(d => d.url)
                    ].filter(url => url.startsWith('http'))}
                    onImport={(data) => {
                        // Auto-fill logic using STATE instead of DOM
                        if (data.brand && !brand) setBrand(data.brand);
                        if (data.model && !model) setModel(data.model);
                        if (data.type && !type) setType(data.type);
                        if (data.subtype && !subtype) setSubtype(data.subtype);

                        // Handle Description: Append instead of overwrite
                        if (data.description) {
                            if (description && description.length > 0) {
                                // Add a separator if appending
                                setDescription(prev => `${prev}\n\n---\n✨ EXTRACTED INFO:\n${data.description}`);
                                toast.info('Nueva descripción añadida al final de la actual.');
                            } else {
                                setDescription(data.description);
                            }
                        }

                        const yearVal = data.year || data.productionYears;
                        if (yearVal && !years) setYears(Array.isArray(yearVal) ? yearVal.join(', ') : yearVal);

                        // Images
                        if (data.images && Array.isArray(data.images)) {
                            data.images.forEach((url: string) => {
                                if (!images.includes(url)) addImage(url);
                            });
                        } else if (data.imageUrl && !images.includes(data.imageUrl)) {
                            addImage(data.imageUrl);
                        }

                        // Prices & Value - Only update if not set
                        if (data.originalPrice && !marketValue.original?.price) {
                            setMarketValue((prev: any) => ({
                                ...prev,
                                original: {
                                    price: data.originalPrice.price,
                                    currency: data.originalPrice.currency,
                                    year: data.originalPrice.year
                                }
                            }));
                        }

                        if (data.marketValue && !marketValue.current?.value) {
                            setMarketValue((prev: any) => ({
                                ...prev,
                                current: {
                                    value: data.marketValue.estimatedPrice,
                                    currency: data.marketValue.currency,
                                    min: data.marketValue.priceRange?.min,
                                    max: data.marketValue.priceRange?.max,
                                    lastUpdated: new Date(),
                                    source: 'AI (Gemini)'
                                }
                            }));
                        }

                        if (data.reverbUrl) {
                            setReverbUrl(data.reverbUrl);
                        }

                        // Add websites from data if they don't exist
                        if (data.websites && Array.isArray(data.websites)) {
                            setWebsites(prev => {
                                const newWebsites = data.websites.map((w: any) => ({
                                    url: typeof w === 'string' ? w : w.url,
                                    isPrimary: typeof w === 'string' ? false : !!w.isPrimary
                                }));

                                const combined = [...prev, ...newWebsites];
                                // Deduplicate by URL
                                const unique = Array.from(new Map(combined.map(item => [item.url, item])).values());
                                return unique;
                            });
                        }

                        if (data.specs && Array.isArray(data.specs)) {
                            setSpecs(prev => {
                                // Basic deduplication by label within the same category
                                // The MagicImporter already filtered based on user preference
                                const existingLabels = new Set(prev.map(s => `${s.category}:${s.label}`.toLowerCase()));
                                const newSpecs = data.specs.filter((s: any) => !existingLabels.has(`${s.category}:${s.label}`.toLowerCase()));

                                // For conflicting labels that WERE selected in the modal, we overwrite
                                const labelsToReplace = new Set(data.specs.map((s: any) => `${s.category}:${s.label}`.toLowerCase()));
                                const preservedSpecs = prev.filter(s => !labelsToReplace.has(`${s.category}:${s.label}`.toLowerCase()));

                                return [...preservedSpecs, ...data.specs];
                            });
                        }

                        // Capture musical context for enrichment
                        if (data.artists && Array.isArray(data.artists)) {
                            const normalized = data.artists.map((a: any) => {
                                if (typeof a === 'string') return { name: a, _id: null, key: a };
                                return a;
                            });
                            setArtists(prev => {
                                const existingNames = new Set(prev.map(p => p.name.toLowerCase()));
                                const filtered = normalized.filter(n => !existingNames.has(n.name.toLowerCase()));
                                return [...prev, ...filtered];
                            });
                        }
                        if (data.albums && Array.isArray(data.albums)) {
                            setAlbums(prev => {
                                const existingTitles = new Set(prev.map(p => p.title.toLowerCase()));
                                const filtered = data.albums.filter((n: any) => !existingTitles.has(n.title.toLowerCase()));
                                return [...prev, ...filtered];
                            });
                        }
                    }} />
            </div>

            <Tabs>
                <Tab label="Información General">
                    <div className="space-y-6 pt-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="apple-label">Marca *</label>
                                <input name="brand" required value={brand || ''} onChange={e => setBrand(e.target.value)} className="apple-input" placeholder="Ej. Roland" />
                            </div>
                            <div>
                                <label className="apple-label">Modelo *</label>
                                <input name="model" required value={model || ''} onChange={e => setModel(e.target.value)} className="apple-input" placeholder="Ej. Juno-106" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="apple-label">Tipo *</label>
                                <select name="type" required value={type || 'Synthesizer'} onChange={e => setType(e.target.value)} className="apple-select">
                                    <option value="Synthesizer">Sintetizador</option>
                                    <option value="Drum Machine">Caja de Ritmos</option>
                                    <option value="Guitar">Guitarra</option>
                                    <option value="Modular">Modular</option>
                                    <option value="Software">Software</option>
                                    <option value="Eurorack Module">Módulo Eurorack</option>
                                    <option value="Groovebox">Groovebox</option>
                                    <option value="Workstation">Workstation</option>
                                    <option value="Effect">Efecto / Pedal</option>
                                    <option value="Mixer">Mezclador</option>
                                    <option value="Controller">Controlador</option>
                                    <option value="Utility">Utilidad</option>
                                    <option value="Accessory">Accesorio</option>
                                    <option value="Gear">Equipo Periférico</option>
                                </select>
                            </div>
                            <div>
                                <label className="apple-label">Subtipo</label>
                                <input name="subtype" value={subtype || ''} onChange={e => setSubtype(e.target.value)} className="apple-input" placeholder="Ej. Analógico, Wavetable" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="apple-label">Versión</label>
                                <input name="version" value={version || ''} onChange={e => setVersion(e.target.value)} className="apple-input" placeholder="Ej. MkII, Rev 3" />
                            </div>
                            <div>
                                <label className="apple-label">Etiqueta de Variante</label>
                                <input name="variantLabel" value={variantLabel || ''} onChange={e => setVariantLabel(e.target.value)} className="apple-input" placeholder="Ej. Black Edition" />
                            </div>
                        </div>

                        <div>
                            <label className="apple-label font-bold flex items-center gap-2">
                                Heredar de (Equipo Principal)
                                <span className="px-2 py-0.5 text-[9px] bg-ios-blue text-white rounded-full uppercase">Nuevo</span>
                            </label>
                            <select
                                name="parentId"
                                value={parentId || ''}
                                onChange={(e) => setParentId(e.target.value)}
                                className="apple-select border-ios-blue"
                            >
                                <option value="">-- Ninguno (Equipo Independiente) --</option>
                                {allInstruments.filter(inst => inst._id !== initialData?._id).map(inst => (
                                    <option key={inst._id} value={inst._id}>
                                        {inst.brand} {inst.model} {inst.variantLabel ? `(${inst.variantLabel})` : ''}
                                    </option>
                                ))}
                            </select>
                            <p className="text-[10px] text-gray-400 mt-1 px-1">
                                Si seleccionas un equipo, este heredará automáticamente sus especificaciones, descripción y archivos.
                            </p>
                        </div>

                        <div>
                            <label className="apple-label">Equipos Relacionados (Accesorios, expansiones...)</label>
                            <div className="space-y-3">
                                <div className="flex flex-wrap gap-2">
                                    {relatedGearIds.map(id => {
                                        const item = allInstruments.find(i => i._id === id);
                                        return (
                                            <div key={id} className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/30 text-ios-blue px-3 py-1.5 rounded-full text-xs font-bold border border-blue-100 dark:border-blue-800 animate-in fade-in zoom-in duration-200">
                                                {item ? `${item.brand} ${item.model}` : 'Instrumento'}
                                                <button type="button" onClick={() => removeRelatedGear(id)} className="hover:text-red-500 transition-colors">
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                                <select
                                    className="apple-select"
                                    onChange={(e) => {
                                        if (e.target.value) {
                                            addRelatedGear(e.target.value);
                                            e.target.value = "";
                                        }
                                    }}
                                    value=""
                                >
                                    <option value="">+ Añadir equipo relacionado...</option>
                                    {allInstruments
                                        .filter(inst => inst._id !== (initialData?._id || instrumentId) && !relatedGearIds.includes(inst._id))
                                        .map(inst => (
                                            <option key={inst._id} value={inst._id}>
                                                {inst.brand} {inst.model} {inst.variantLabel ? `(${inst.variantLabel})` : ''}
                                            </option>
                                        ))
                                    }
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="apple-label">Años de Fabricación</label>
                            <input name="years" value={years || ''} onChange={e => setYears(e.target.value)} className="apple-input" placeholder="1984, 1985" />
                        </div>

                        {/* Original Price Section moved here */}
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="apple-label mb-0">Sitios Web Oficiales</label>
                                <button
                                    type="button"
                                    onClick={addWebsite}
                                    className="text-xs text-blue-600 hover:underline font-medium"
                                >
                                    + Añadir otro sitio
                                </button>
                            </div>
                            <div className="space-y-3">
                                {websites.map((ws, idx) => (
                                    <div key={idx} className="flex gap-2 group items-center">
                                        <div className="relative flex-1">
                                            <input
                                                type="url"
                                                value={ws.url}
                                                onChange={(e) => updateWebsite(idx, e.target.value)}
                                                className={`apple-input pr-10 ${ws.isPrimary ? 'border-blue-500 ring-1 ring-blue-500/20' : ''}`}
                                                placeholder="https://www.fabricante.com/producto"
                                            />
                                            <Globe className={`absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 ${ws.isPrimary ? 'text-blue-500' : 'text-gray-400'}`} />
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => togglePrimaryWebsite(idx)}
                                            className={`p-2 rounded-lg transition-colors ${ws.isPrimary ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' : 'text-gray-400 hover:text-blue-400'}`}
                                            title={ws.isPrimary ? 'Sitio Oficial (Principal)' : 'Marcar como Oficial'}
                                        >
                                            {ws.isPrimary ? <Star className="w-5 h-5 fill-current" /> : <StarOff className="w-5 h-5" />}
                                        </button>

                                        {websites.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeWebsite(idx)}
                                                className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                                title="Eliminar este sitio"
                                            >
                                                <X size={18} />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="md:col-span-2">
                            <label className="apple-label">Descripción General</label>
                            <textarea name="description" rows={12} value={description || ''} onChange={e => setDescription(e.target.value)} className="apple-input min-h-[350px]" placeholder="Breve historia, características sonoras, detalles técnicos..."></textarea>
                        </div>

                        {/* Original Price Section moved here */}
                        <div className="md:col-span-2 p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50/50 dark:bg-gray-800/50">
                            <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-3 text-sm uppercase tracking-wide">Precio Original</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="apple-label">Precio Lanzamiento</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={marketValue.original?.price || ''}
                                            onChange={(e) => setMarketValue({ ...marketValue, original: { ...marketValue.original, price: parseFloat(e.target.value) } })}
                                            className="apple-input flex-1"
                                            placeholder="999.00"
                                        />
                                        <select
                                            value={marketValue.original?.currency || 'USD'}
                                            onChange={(e) => setMarketValue({ ...marketValue, original: { ...marketValue.original, currency: e.target.value } })}
                                            className="apple-select w-24"
                                        >
                                            <option value="USD">USD</option>
                                            <option value="EUR">EUR</option>
                                            <option value="GBP">GBP</option>
                                            <option value="JPY">JPY</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="apple-label">Año</label>
                                    <input
                                        type="number"
                                        min="1900"
                                        max={new Date().getFullYear()}
                                        value={marketValue.original?.year || ''}
                                        onChange={(e) => setMarketValue({ ...marketValue, original: { ...marketValue.original, year: parseInt(e.target.value) } })}
                                        className="apple-input"
                                        placeholder="1984"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </Tab>

                <Tab label="Multimedia y Documentos">
                    <div className="space-y-6 pt-4">
                        {/* Image Upload */}
                        <div>
                            <label className="apple-label">Imágenes</label>
                            <div className="mb-4 space-y-2">
                                {images.map((img, idx) => (
                                    <div key={`${img}-${idx}`} className="flex items-center gap-4 bg-gray-50 dark:bg-gray-700 p-2 rounded">
                                        <img src={img} alt={`Preview ${idx}`} className="w-16 h-16 object-cover rounded" />
                                        <div className="flex-1">
                                            {idx === 0 && <span className="text-[10px] font-bold text-white uppercase bg-green-500 px-2 py-0.5 rounded-full tracking-wide">Principal</span>}
                                        </div>
                                        <div className="flex gap-2">
                                            {idx > 0 && (
                                                <button
                                                    type="button"
                                                    onClick={() => makeMainImage(idx)}
                                                    className="text-xs text-blue-500 hover:underline"
                                                >
                                                    Hacer Principal
                                                </button>
                                            )}
                                            <button
                                                type="button"
                                                onClick={() => removeImage(idx)}
                                                className="text-xs text-red-500 hover:text-red-700 px-2 py-1"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mb-2 flex flex-col md:flex-row gap-4 items-start">
                                <FileUpload
                                    onUpload={(urls) => urls.forEach(url => addImage(url))}
                                    multiple={true}
                                    accept="image/*"
                                    label="Subir Imágenes"
                                    context="catalog"
                                />
                                <div className="mt-8">
                                    <MediaLibrary onSelect={(url) => addImage(url)} />
                                </div>

                                {/* Inherited Images Section */}
                                {parentImages.length > 0 && (
                                    <div className="mt-6 p-4 bg-blue-50/30 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-900/30">
                                        <h4 className="flex items-center gap-2 font-bold text-ios-blue text-sm mb-3">
                                            <Save size={14} /> Imágenes Heredadas del Principal
                                        </h4>
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                            {parentImages.map((img, idx) => {
                                                const isExcluded = excludedImages.includes(img);
                                                return (
                                                    <div key={idx} className={`relative group cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${isExcluded ? 'border-gray-200 opacity-50 grayscale' : 'border-ios-blue shadow-md'}`}
                                                        onClick={() => toggleImageExclusion(img)}>
                                                        <img src={img} alt="Inherited" className="w-full aspect-square object-cover" />
                                                        <div className={`absolute inset-0 flex items-center justify-center bg-black/40 transition-opacity ${isExcluded ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                                                            <span className="text-[10px] font-bold text-white uppercase px-2 py-1 rounded-full border border-white">
                                                                {isExcluded ? 'Restaurar' : 'No usar'}
                                                            </span>
                                                        </div>
                                                        {!isExcluded && (
                                                            <div className="absolute top-1 right-1">
                                                                <Star size={14} className="text-ios-blue fill-current" />
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        <p className="text-[10px] text-gray-500 mt-3 italic">
                                            Pulsa sobre una imagen para excluirla de esta versión específica.
                                        </p>
                                    </div>
                                )}

                                {/* Manual Image URL Input */}
                                <div className="flex gap-2 items-center flex-1 w-full md:w-auto">
                                    <input
                                        type="text"
                                        id="img-url-input"
                                        placeholder="O pegar URL de imagen..."
                                        className="apple-input flex-1"
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                const val = e.currentTarget.value;
                                                if (val) { addImage(val); e.currentTarget.value = ''; }
                                            }
                                        }}
                                    />
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            const input = document.getElementById('img-url-input') as HTMLInputElement;
                                            if (input && input.value) { addImage(input.value); input.value = ''; }
                                        }}
                                        className="apple-button-secondary py-2.5 px-4 h-full"
                                    >
                                        Añadir URL
                                    </button>
                                </div>
                            </div>


                        </div>

                        <hr className="border-gray-200 dark:border-gray-700" />

                        {/* Documents Section */}
                        <div>
                            <label className="apple-label">Documentación / Archivos</label>
                            <div className="mb-4 space-y-2">
                                {documents.map((doc, idx) => (
                                    <div key={idx} className="flex items-center gap-4 bg-gray-50 dark:bg-gray-700 p-2 rounded">
                                        <div className="w-8 h-8 flex items-center justify-center bg-gray-200 dark:bg-gray-600 rounded text-xs font-bold uppercase text-gray-600 dark:text-gray-300">
                                            {doc.type}
                                        </div>
                                        <div className="flex-1">
                                            <input
                                                type="text"
                                                value={doc.title}
                                                onChange={(e) => updateDocumentTitle(idx, e.target.value)}
                                                placeholder="Título del documento"
                                                className="w-full text-sm p-1 border-b bg-transparent border-gray-200 dark:border-gray-700 focus:outline-none focus:border-ios-blue transition-colors placeholder:text-gray-400"
                                            />
                                            <a href={doc.url} target="_blank" className="text-xs text-blue-500 hover:underline truncate block max-w-xs">{doc.url}</a>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => removeDocument(idx)}
                                            className="text-xs text-red-500 hover:underline"
                                        >
                                            Eliminar
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <div className="mb-2 space-y-3">
                                <FileUpload
                                    onUpload={addDocument}
                                    multiple={true}
                                    accept=".pdf,.doc,.docx,.txt,.md,.json,.zip" // Flexible types
                                    label="Subir Documentos"
                                />

                                {/* Manual Document URL Input */}
                                <div className="flex flex-col md:flex-row gap-3 items-center apple-card p-4 bg-gray-50/50 dark:bg-white/5">
                                    <div className="relative w-full md:w-1/3">
                                        <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input
                                            type="text"
                                            id="doc-title-input"
                                            placeholder="Título del Enlace"
                                            className="apple-input w-full pl-10"
                                        />
                                    </div>
                                    <div className="relative flex-1 w-full">
                                        <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input
                                            type="text"
                                            id="doc-url-input"
                                            placeholder="https://..."
                                            className="apple-input w-full pl-10"
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const titleInput = document.getElementById('doc-title-input') as HTMLInputElement;
                                            const urlInput = document.getElementById('doc-url-input') as HTMLInputElement;
                                            if (urlInput && urlInput.value) {
                                                const title = titleInput.value || 'Enlace Externo';
                                                // Manually construct the document object
                                                const newDoc = {
                                                    title: title,
                                                    url: urlInput.value,
                                                    type: 'link' // Custom type for links
                                                };
                                                setDocuments([...documents, newDoc]);
                                                titleInput.value = '';
                                                urlInput.value = '';
                                            } else {
                                                toast.warning('Por favor introduce al menos una URL');
                                            }
                                        }}
                                        className="apple-button-secondary py-2 px-4 whitespace-nowrap h-[42px]"
                                    >
                                        + Añadir Link
                                    </button>
                                </div>
                            </div>


                        </div>

                        <hr className="border-gray-200 dark:border-gray-700" />

                        {/* Resource Section for Patches, Manuals, Videos */}
                        <div className="pt-4">
                            {instrumentId ? (
                                <ResourceSection
                                    instrumentId={instrumentId}
                                    resources={resources}
                                    canEdit={true}
                                    defaultVisibility="public"
                                />
                            ) : (
                                <div className="p-6 text-center border border-dashed border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                                    <p className="text-gray-500">
                                        Para subir archivos (Manuales, Patches, Videos), primero debes
                                        <span className="font-bold"> guardar el instrumento</span>.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </Tab>

                <Tab label="Contexto Musical">
                    <div className="pt-4">
                        {instrumentId ? (
                            <MusicalContextSection
                                artists={artists}
                                albums={albums}
                                availableArtists={[]} // Not used by unified manager but required by types
                                canEdit={true}
                                forceEditMode={true}
                                instrumentId={instrumentId}
                            />
                        ) : artists.length > 0 || albums.length > 0 ? (
                            <div className="space-y-6">
                                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/30 rounded-2xl">
                                    <h4 className="font-bold text-ios-blue text-sm mb-2 flex items-center gap-2">
                                        <Sparkles size={16} /> Contexto Musical Detectado
                                    </h4>
                                    <p className="text-xs text-blue-600 dark:text-blue-400 mb-4">
                                        Estos artistas y álbumes se vincularán y enriquecerán automáticamente mediante Discogs al guardar el instrumento.
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {artists.map((a, i) => (
                                            <div key={i} className="bg-white dark:bg-gray-800 px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-700 text-xs font-medium flex items-center gap-2">
                                                <Users size={12} className="text-ios-blue" />
                                                {a.name}
                                            </div>
                                        ))}
                                        {albums.map((a, i) => (
                                            <div key={i} className="bg-white dark:bg-gray-800 px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-700 text-xs font-medium flex items-center gap-2">
                                                <Disc3 size={12} className="text-ios-blue" />
                                                {a.title}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="p-6 text-center border border-dashed border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                                    <p className="text-gray-500 text-xs">
                                        Podrás añadir más artistas manualmente una vez hayas guardado la ficha.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="p-6 text-center border border-dashed border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                                <p className="text-gray-500">
                                    Para asociar Artistas y Álbumes, primero debes
                                    <span className="font-bold"> guardar el instrumento</span> o usar el Magic Import.
                                </p>
                            </div>
                        )}
                    </div>
                </Tab>


                <Tab label="Especificaciones Técnicas">
                    <div className="pt-4">
                        <div className="flex justify-between items-center mb-4">
                            <p className="text-sm text-gray-500">Añade datos técnicos detallados organizados por categoría.</p>
                        </div>

                        {Object.values(SPEC_CATEGORIES).map(category => {
                            // Filter specs that belong to this category
                            const categorySpecs = specs.map((spec, index) => ({ ...spec, index })).filter(s => s.category === category);

                            return (
                                <div key={category} className="mb-6 apple-card p-5 bg-white/50 dark:bg-white/5">
                                    <div className="flex justify-between items-center mb-3">
                                        <h4 className="font-semibold text-blue-600 dark:text-blue-400">{category}</h4>
                                        <button
                                            type="button"
                                            onClick={() => addSpec(category)}
                                            className="text-xs bg-blue-50 dark:bg-blue-900/30 text-ios-blue font-medium px-2.5 py-1.5 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-800 transition"
                                        >
                                            + Añadir Dato
                                        </button>
                                    </div>

                                    <div className="space-y-3">
                                        {categorySpecs.map((spec) => (
                                            <div key={spec.index} className="flex gap-2 items-start">
                                                <div className="w-1/3">
                                                    <input
                                                        list={`suggestions-${category.replace(/\s/g, '-')}`}
                                                        placeholder="Propiedad"
                                                        value={spec.label}
                                                        onChange={(e) => updateSpec(spec.index, 'label', e.target.value)}
                                                        className="apple-input"
                                                    />
                                                    <datalist id={`suggestions-${category.replace(/\s/g, '-')}`}>
                                                        {PREDEFINED_SPECS[category]?.map(opt => (
                                                            <option key={opt} value={opt} />
                                                        ))}
                                                    </datalist>
                                                </div>
                                                <div className="w-2/3">
                                                    <input
                                                        placeholder="Valor"
                                                        value={spec.value}
                                                        onChange={(e) => updateSpec(spec.index, 'value', e.target.value)}
                                                        className="w-full text-sm p-2 border rounded bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                                                    />
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => removeSpec(spec.index)}
                                                    className="text-red-500 hover:text-red-700 p-2"
                                                    title="Eliminar"
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        ))}
                                        {categorySpecs.length === 0 && (
                                            <p className="text-xs text-gray-400 italic">No hay datos en esta sección.</p>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </Tab>

                <Tab label="Mercado">
                    <div className="space-y-8 pt-4">
                        {/* Live Insights */}
                        <div className="bg-gray-50 dark:bg-white/5 p-6 rounded-[2.5rem] border border-black/5">
                            <MarketInsights
                                query={isEditing ? `${initialData?.brand} ${initialData?.model}` : (initialData?.brand && initialData?.model ? `${initialData.brand} ${initialData.model}` : '')}
                                instrumentId={instrumentId}
                            />
                        </div>

                        {/* Manual Market Value (Snapshot) */}
                        <div className="apple-card p-8 space-y-6">
                            <h3 className="apple-label text-ios-blue">Valor de Mercado Actual (Snapshot)</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label className="apple-label">Valor Estimado</label>
                                    <input
                                        type="number"
                                        value={marketValue.current?.value || ''}
                                        onChange={(e) => setMarketValue({ ...marketValue, current: { ...marketValue.current, value: parseFloat(e.target.value) } })}
                                        className="apple-input"
                                        placeholder="0.00"
                                    />
                                    <p className="text-[10px] text-gray-400 mt-1">Precio representativo o medio.</p>
                                </div>
                                <div>
                                    <label className="apple-label">Rango Mínimo</label>
                                    <input
                                        type="number"
                                        value={marketValue.current?.min || ''}
                                        onChange={(e) => setMarketValue({ ...marketValue, current: { ...marketValue.current, min: parseFloat(e.target.value) } })}
                                        className="apple-input"
                                        placeholder="Min"
                                    />
                                </div>
                                <div>
                                    <label className="apple-label">Rango Máximo</label>
                                    <input
                                        type="number"
                                        value={marketValue.current?.max || ''}
                                        onChange={(e) => setMarketValue({ ...marketValue, current: { ...marketValue.current, max: parseFloat(e.target.value) } })}
                                        className="apple-input"
                                        placeholder="Max"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </Tab>
            </Tabs>

            <div className="flex flex-col sm:flex-row items-center justify-end gap-3 mt-12 pt-8 border-t border-gray-100 dark:border-gray-800">
                <Button
                    type="button"
                    variant="secondary"
                    onClick={() => router.back()}
                    icon={X}
                >
                    Cancelar
                </Button>

                <SubmitButton isEditing={isEditing} />
            </div>

            {/* Hidden Inputs moved outside Tabs to persist data on submit */}
            {/* Hidden Inputs moved outside Tabs to persist data on submit */}
            <input type="hidden" name="specs" value={JSON.stringify(specs)} />
            <input type="hidden" name="websites" value={JSON.stringify(websites.filter(w => w.url.trim()))} />
            <input type="hidden" name="genericImages" value={JSON.stringify(images)} />
            <input type="hidden" name="documents" value={JSON.stringify(documents)} />
            <input type="hidden" name="excludedImages" value={JSON.stringify(excludedImages)} />
            <input type="hidden" name="relatedTo" value={JSON.stringify(relatedGearIds)} />

            {/* Musical Context for Enrichment */}
            <input type="hidden" name="artists" value={JSON.stringify(artists)} />
            <input type="hidden" name="albums" value={JSON.stringify(albums)} />

            {/* Unified Market Value Object from STATE */}
            <input type="hidden" name="marketValue" value={JSON.stringify(marketValue)} />
            <input type="hidden" name="reverbUrl" value={reverbUrl} />
        </form >
    );
}



function SubmitButton({ isEditing }: { isEditing: boolean }) {
    const { pending } = useFormStatus();
    return (
        <Button
            type="submit"
            isLoading={pending}
            icon={Save}
            className="min-w-[170px]"
        >
            {isEditing ? 'Guardar Cambios' : 'Crear Instrumento'}
        </Button>
    );
}
