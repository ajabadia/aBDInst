'use client';

import { createInstrument, updateInstrument } from '@/actions/instrument';
import { useFormStatus } from 'react-dom';
import FileUpload from './FileUpload';
import { SPEC_CATEGORIES, PREDEFINED_SPECS } from '@/lib/spec-constants';
import { useState } from 'react';

function SubmitButton({ isEditing }: { isEditing: boolean }) {
    const { pending } = useFormStatus();
    return (
        <button
            type="submit"
            disabled={pending}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center"
        >
            {pending && (
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            )}
            {pending ? 'Guardando...' : (isEditing ? 'Actualizar Instrumento' : 'Crear Instrumento')}
        </button>
    );
}

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
        setImages([...images, url]);
    };

    const removeImage = (index: number) => {
        const newImages = [...images];
        newImages.splice(index, 1);
        setImages(newImages);
    };

    const makeMainImage = (index: number) => {
        const newImages = [...images];
        const [selected] = newImages.splice(index, 1);
        newImages.unshift(selected); // Move to start
        setImages(newImages);
    };

    // Document Helpers
    const addDocument = (urls: string[]) => {
        const newDocs = urls.map(url => ({
            title: url.split('/').pop() || 'Documento',
            url: url,
            type: url.split('.').pop() || 'file'
        }));
        setDocuments([...documents, ...newDocs]);
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
            alert('Error: ' + res.error);
        } else {
            window.location.href = isEditing ? `/instruments/${instrumentId}` : '/instruments';
        }
    }

    return (
        <form action={action} className="space-y-6 max-w-4xl mx-auto p-6 bg-white dark:bg-gray-800 rounded shadow">
            {/* Basic Fields (Brand, Model, Type...) */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium mb-1">Marca *</label>
                    <input name="brand" required defaultValue={initialData?.brand} className="w-full p-2 border rounded bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400" placeholder="Ej. Roland" />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Modelo *</label>
                    <input name="model" required defaultValue={initialData?.model} className="w-full p-2 border rounded bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400" placeholder="Ej. Juno-106" />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium mb-1">Tipo *</label>
                    <select name="type" required defaultValue={initialData?.type} className="w-full p-2 border rounded bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white">
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
                    <label className="block text-sm font-medium mb-1">Subtipo</label>
                    <input name="subtype" defaultValue={initialData?.subtype} className="w-full p-2 border rounded bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400" placeholder="Ej. Analógico, Wavetable" />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium mb-1">Versión</label>
                <input name="version" defaultValue={initialData?.version} className="w-full p-2 border rounded bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400" placeholder="Ej. MkII, Rev 3" />
            </div>

            <div>
                <label className="block text-sm font-medium mb-1">Años de Fabricación</label>
                <input name="years" defaultValue={initialData?.years?.join(', ')} className="w-full p-2 border rounded bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400" placeholder="1984, 1985" />
            </div>

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

                <input type="hidden" name="genericImages" value={JSON.stringify(images)} />
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
                                    alert('Por favor introduce al menos una URL');
                                }
                            }}
                            className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-4 py-2 rounded text-sm hover:bg-blue-200 whitespace-nowrap"
                        >
                            + Añadir Link
                        </button>
                    </div>
                </div>

                <input type="hidden" name="documents" value={JSON.stringify(documents)} />
            </div>

            <hr className="border-gray-200 dark:border-gray-700" />

            {/* Dynamic Specs Section */}
            <div>
                <h3 className="text-lg font-bold mb-4 dark:text-white">Especificaciones Técnicas</h3>

                {Object.values(SPEC_CATEGORIES).map(category => {
                    // Filter specs that belong to this category
                    // We map to maintain the original index for updating
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

            <div className="border-t pt-4 mt-4">
                <label className="block text-sm font-medium mb-1">Descripción General</label>
                <textarea name="description" rows={4} defaultValue={initialData?.description} className="w-full p-2 border rounded bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"></textarea>
            </div>

            <SubmitButton isEditing={isEditing} />
        </form>
    );
}
