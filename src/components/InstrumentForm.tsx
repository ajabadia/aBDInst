'use client';

import { createInstrument, updateInstrument } from '@/actions/instrument';
import { useFormStatus } from 'react-dom';
import FileUpload from './FileUpload';
import { SPEC_CATEGORIES, PREDEFINED_SPECS } from '@/lib/spec-constants';
import { useState } from 'react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Tabs, Tab } from '@/components/Tabs';
import { Button } from './ui/Button';
import { Save, X } from 'lucide-react';



interface InstrumentFormProps {
    initialData?: any;
    instrumentId?: string;
}

// Simplified internal types for the form state
type SpecItem = { category: string; label: string; value: string };

export default function InstrumentForm({ initialData, instrumentId }: InstrumentFormProps) {
    const isEditing = !!instrumentId;
    // Initialize specs from initialData or empty array
    // initialData.specs might be an array (new format) or object (old format - we should probably ignore old format or migrate manually)
    // For now assuming array or empty.
    const [specs, setSpecs] = useState<SpecItem[]>(Array.isArray(initialData?.specs) ? initialData.specs : []);
    const [images, setImages] = useState<string[]>(initialData?.genericImages || []);

    // Documents state
    const [documents, setDocuments] = useState<{ title: string, url: string, type: string }[]>(initialData?.documents || []);

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
        // Serialize specs array to JSON
        formData.append('specs', JSON.stringify(specs));

        let res;
        if (isEditing && instrumentId) {
            res = await updateInstrument(instrumentId, formData);
        } else {
            res = await createInstrument(formData);
        }

        if (res.error) {
            toast.error('Error: ' + res.error);
        } else {
            toast.success(isEditing ? 'Instrumento actualizado correctamente' : 'Instrumento creado correctamente');
            router.push(isEditing ? `/instruments/${instrumentId}` : '/instruments');
            router.refresh(); // Ensure data is fresh
        }
    }

    return (
        <form action={action} className="space-y-6 max-w-4xl mx-auto bg-white/40 dark:bg-black/20 backdrop-blur-md rounded-[2.5rem] border border-gray-200/50 dark:border-white/10 p-10 shadow-2xl">
            <Tabs>
                <Tab label="Información General">
                    <div className="space-y-6 pt-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="apple-label">Marca *</label>
                                <input name="brand" required defaultValue={initialData?.brand} className="apple-input" placeholder="Ej. Roland" />
                            </div>
                            <div>
                                <label className="apple-label">Modelo *</label>
                                <input name="model" required defaultValue={initialData?.model} className="apple-input" placeholder="Ej. Juno-106" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="apple-label">Tipo *</label>
                                <select name="type" required defaultValue={initialData?.type} className="apple-select">
                                    <option value="synthesizer">Sintetizador</option>
                                    <option value="drum_machine">Caja de Ritmos</option>
                                    <option value="guitar">Guitarra</option>
                                    <option value="modular">Modular</option>
                                    <option value="software">Software</option>
                                    <option value="eurorack_module">Módulo Eurorack</option>
                                    <option value="groovebox">Groovebox</option>
                                    <option value="workstation">Workstation</option>
                                </select>
                            </div>
                            <div>
                                <label className="apple-label">Subtipo</label>
                                <input name="subtype" defaultValue={initialData?.subtype} className="apple-input" placeholder="Ej. Analógico, Wavetable" />
                            </div>
                        </div>

                        <div>
                            <label className="apple-label">Versión</label>
                            <input name="version" defaultValue={initialData?.version} className="apple-input" placeholder="Ej. MkII, Rev 3" />
                        </div>

                        <div>
                            <label className="apple-label">Años de Fabricación</label>
                            <input name="years" defaultValue={initialData?.years?.join(', ')} className="apple-input" placeholder="1984, 1985" />
                        </div>

                        <div>
                            <label className="apple-label">Descripción General</label>
                            <textarea name="description" rows={4} defaultValue={initialData?.description} className="apple-input min-h-[120px]" placeholder="Breve historia, características sonoras..."></textarea>
                        </div>
                    </div>
                </Tab>

                <Tab label="Multimedia y Documentos">
                    <div className="space-y-6 pt-4">
                        {/* Image Upload */}
                        <div>
                            <label className="block text-sm font-medium mb-1">Imágenes</label>
                            <div className="mb-4 space-y-2">
                                {images.map((img, idx) => (
                                    <div key={img} className="flex items-center gap-4 bg-gray-50 dark:bg-gray-700 p-2 rounded">
                                        <img src={img} alt={`Preview ${idx}`} className="w-16 h-16 object-cover rounded" />
                                        <div className="flex-1">
                                            {idx === 0 && <span className="text-xs font-bold text-green-600 uppercase bg-green-100 px-2 py-1 rounded">Principal</span>}
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
                                />

                                {/* Manual Image URL Input */}
                                <div className="flex gap-2 items-center flex-1 w-full md:w-auto">
                                    <input
                                        type="text"
                                        id="img-url-input"
                                        placeholder="O pegar URL de imagen..."
                                        className="flex-1 text-sm p-2 border rounded bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
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
                                        className="bg-gray-200 dark:bg-gray-600 px-3 py-2 rounded text-sm hover:bg-gray-300 dark:hover:bg-gray-500"
                                    >
                                        Añadir URL
                                    </button>
                                </div>
                            </div>


                        </div>

                        <hr className="border-gray-200 dark:border-gray-700" />

                        {/* Documents Section */}
                        <div>
                            <label className="block text-sm font-medium mb-1">Documentación / Archivos</label>
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
                                                className="w-full text-sm p-1 border-b bg-transparent border-gray-300 dark:border-gray-500 focus:outline-none focus:border-blue-500"
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
                                <div className="flex flex-col md:flex-row gap-2 items-start md:items-center bg-gray-50 dark:bg-gray-800 p-3 rounded border dark:border-gray-700">
                                    <span className="text-sm font-medium whitespace-nowrap">Añadir enlace externo:</span>
                                    <input
                                        type="text"
                                        id="doc-title-input"
                                        placeholder="Título (ej. Manual PDF)"
                                        className="w-full md:w-1/3 text-sm p-2 border rounded bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                                    />
                                    <input
                                        type="text"
                                        id="doc-url-input"
                                        placeholder="URL (https://...)"
                                        className="flex-1 w-full text-sm p-2 border rounded bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                                    />
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
                                        className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-4 py-2 rounded text-sm hover:bg-blue-200 whitespace-nowrap"
                                    >
                                        + Añadir Link
                                    </button>
                                </div>
                            </div>


                        </div>
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
                                <div key={category} className="mb-6 p-4 border rounded-lg dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                                    <div className="flex justify-between items-center mb-3">
                                        <h4 className="font-semibold text-blue-600 dark:text-blue-400">{category}</h4>
                                        <button
                                            type="button"
                                            onClick={() => addSpec(category)}
                                            className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-1 rounded hover:bg-blue-200 dark:hover:bg-blue-800 transition"
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
                                                        className="w-full text-sm p-2 border rounded bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
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
            <input type="hidden" name="genericImages" value={JSON.stringify(images)} />
            <input type="hidden" name="documents" value={JSON.stringify(documents)} />
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
