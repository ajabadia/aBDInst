'use client';

import { updateCollectionItem, deleteCollectionItem, restoreCollectionItem, toggleLoan } from '@/actions/collection';
import { updateCollectionTags, getAllUserTags } from '@/actions/tags';
import { useFormStatus } from 'react-dom';
import ImageUpload from '@/components/ImageUpload';
import ActivityTimeline from '@/components/ActivityTimeline';
import TagInput from '@/components/ui/TagInput';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Trash2, UserMinus, UserPlus, Handshake } from 'lucide-react';

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <button
            type="submit"
            disabled={pending}
            className="w-full apple-button-primary justify-center py-3"
        >
            {pending ? 'Guardando...' : 'Guardar Cambios'}
        </button>
    );
}

export default function EditCollectionItemForm({ item }: { item: any }) {
    // Initial state setup if needed, but for server actions we can rely on defaultValues in inputs
    // For images, we might want state to show added images immediately? 
    // Simplify for now: Just standard form inputs + image upload

    const router = useRouter();
    const [tags, setTags] = useState<string[]>(item.tags || []);
    const [allUserTags, setAllUserTags] = useState<string[]>([]);

    useEffect(() => {
        getAllUserTags().then(setAllUserTags);
    }, []);

    const handleTagsChange = async (newTags: string[]) => {
        setTags(newTags);
        const result = await updateCollectionTags(item._id, newTags);
        if (result.success) {
            toast.success('Etiquetas actualizadas');
        } else {
            toast.error('Error al actualizar etiquetas');
        }
    };

    async function action(formData: FormData) {
        const res = await updateCollectionItem(item._id, formData);
        if (res.success) {
            toast.success('Datos actualizados correctamente');
        } else {
            toast.error('Error: ' + res.error);
        }
    }

    const handleDelete = async () => {
        // No confirm modal. Just do it. Apple Style.
        const promise = deleteCollectionItem(item._id);

        toast.promise(promise, {
            loading: 'Eliminando...',
            success: () => {
                router.push('/dashboard');
                return 'Instrumento eliminado de tu colección';
            },
            error: 'Error al eliminar',
            action: {
                label: 'Deshacer',
                onClick: async () => {
                    await restoreCollectionItem(item._id);
                    toast.success('Instrumento recuperado');
                    router.refresh();
                },
            },
        });
    };

    return (
        <form action={action} className="space-y-6 apple-card p-6">

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="apple-label">Estado</label>
                    <select name="status" defaultValue={item.status} className="apple-select">
                        <option value="active">Activo (En mi estudio)</option>
                        <option value="sold">Vendido</option>
                        <option value="wishlist">Lista de Deseos</option>
                        <option value="repair">En Reparación</option>
                    </select>
                </div>
                <div>
                    <label className="apple-label">Condición</label>
                    <select name="condition" defaultValue={item.condition} className="apple-select">
                        <option value="new">Nuevo</option>
                        <option value="excellent">Excelente</option>
                        <option value="good">Bueno</option>
                        <option value="fair">Aceptable</option>
                        <option value="poor">Pobre</option>
                        <option value="for_parts">Para piezas</option>
                    </select>
                </div>
            </div>

            <div>
                <label className="block text-sm font-bold mb-1 text-blue-600 dark:text-blue-400">
                    Valor de Mercado Estimado (Seguimiento)
                </label>
                <div className="flex gap-2">
                    <input
                        name="marketValue.current"
                        type="number"
                        defaultValue={item.marketValue?.current}
                        className="apple-input border-ios-blue/30 focus:border-ios-blue"
                        placeholder="Valor de mercado actual..."
                    />
                    <div className="flex items-center text-sm text-gray-500 px-3 bg-gray-50 dark:bg-gray-600 dark:text-gray-300 rounded border dark:border-gray-500">
                        EUR
                    </div>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                    Cada vez que actualices este valor, se guardará un punto en el historial para generar tu gráfica de inversión.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="apple-label">Número de Serie (Fabricante)</label>
                    <input name="serialNumber" defaultValue={item.serialNumber} className="apple-input" />
                </div>
                <div>
                    <label className="apple-label">N/S Inventario (Interno)</label>
                    <input name="inventorySerial" defaultValue={item.inventorySerial} className="apple-input" placeholder="Ej. KEY-001" />
                </div>
                <div className="md:col-span-2">
                    <label className="apple-label">Ubicación / Estudio</label>
                    <input name="location" defaultValue={item.location} className="apple-input" placeholder="Ej. Home Studio, Rack B..." />
                </div>
            </div>

            <div className="border-t pt-4 dark:border-gray-700">
                <h3 className="font-semibold mb-3">Datos de Adquisición</h3>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="apple-label">Fecha de Compra</label>
                        <input name="acquisition.date" type="date" defaultValue={item.acquisition?.date} className="apple-input" />
                    </div>
                    <div>
                        <label className="apple-label">Precio</label>
                        <div className="flex gap-2">
                            <input name="acquisition.price" type="number" defaultValue={item.acquisition?.price} className="apple-input" placeholder="0.00" />
                            <select name="acquisition.currency" defaultValue={item.acquisition?.currency || 'EUR'} className="apple-select w-24">
                                <option value="EUR">EUR</option>
                                <option value="USD">USD</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="apple-label">Vendedor</label>
                        <input name="acquisition.seller" defaultValue={item.acquisition?.seller} className="apple-input" />
                    </div>
                    <div>
                        <label className="apple-label">Fuente (Reverb, Wallapop...)</label>
                        <input name="acquisition.source" defaultValue={item.acquisition?.source} className="apple-input" />
                    </div>
                    <div className="flex items-center gap-2 mt-4">
                        <input
                            type="checkbox"
                            name="acquisition.isOriginalOwner"
                            value="true"
                            defaultChecked={item.acquisition?.isOriginalOwner}
                            className="w-4 h-4 text-blue-600 rounded"
                        />
                        <label className="text-sm font-medium">Soy el primer dueño (Original Owner)</label>
                    </div>
                    <div></div> {/* Spacer */}

                    <div className="col-span-2">
                        <label className="apple-label">Procedencia / Historia (Provenance)</label>
                        <textarea
                            name="acquisition.provenance"
                            defaultValue={item.acquisition?.provenance}
                            rows={2}
                            className="apple-input"
                            placeholder="Historia del instrumento, propietarios anteriores importantes, giras..."
                        ></textarea>
                    </div>
                </div>
            </div>

            <div className="border-t pt-4 dark:border-gray-700">
                <label className="apple-label">Notas Privadas</label>
                <textarea name="customNotes" defaultValue={item.customNotes} rows={3} className="apple-input"></textarea>
            </div>

            {/* TAGS SECTION */}
            <div className="border-t pt-4 dark:border-gray-700">
                <h3 className="font-semibold text-lg mb-4 text-gray-900 dark:text-white">Etiquetas Personalizadas</h3>
                <TagInput
                    tags={tags}
                    onChange={handleTagsChange}
                    suggestions={allUserTags}
                    placeholder="Añadir etiqueta (ej: vintage, favorito, estudio-a)..."
                />
                <p className="text-xs text-gray-500 mt-2">
                    Usa etiquetas para organizar tu colección de forma flexible. Presiona Enter para añadir.
                </p>
            </div>

            {/* LOAN TRACKER SECTION */}
            <div className="border-t pt-8 dark:border-gray-700">
                <h3 className="font-semibold text-lg mb-4 text-gray-900 dark:text-white flex items-center gap-2">
                    <Handshake className="text-blue-500" size={20} /> Préstamos y Cesiones
                </h3>

                {item.loan?.active ? (
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm text-blue-600 dark:text-blue-400 font-semibold uppercase tracking-wider mb-1">Estado: Prestado</p>
                                <h4 className="text-xl font-bold text-gray-900 dark:text-white">{item.loan.loanee}</h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                                    Prestado el {item.loan.date ? new Date(item.loan.date).toLocaleDateString() : 'N/A'}
                                </p>
                            </div>
                            <UserMinus size={32} className="text-blue-300" />
                        </div>
                        <div className="mt-6">
                            <button
                                type="button"
                                onClick={async () => {
                                    const fd = new FormData();
                                    fd.append('action', 'return');
                                    const res = await toggleLoan(item._id, fd);
                                    if (res.success) toast.success('Instrumento devuelto');
                                    else toast.error('Error');
                                }}
                                className="w-full bg-white dark:bg-gray-800 border border-blue-200 dark:border-blue-700 text-blue-600 dark:text-blue-400 py-2 rounded-lg font-medium hover:bg-blue-50 transition"
                            >
                                Registrar Devolución
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6 border border-dashed border-gray-200 dark:border-gray-700">
                        <details className="group">
                            <summary className="flex items-center justify-between cursor-pointer list-none">
                                <div className="flex items-center gap-3">
                                    <div className="bg-white dark:bg-gray-700 p-2 rounded-full shadow-sm">
                                        <UserPlus size={20} className="text-gray-400" />
                                    </div>
                                    <span className="font-medium text-gray-600 dark:text-gray-300">Prestar este instrumento...</span>
                                </div>
                                <span className="text-blue-600 text-sm group-open:hidden">Desplegar</span>
                            </summary>

                            <div className="mt-6 pt-6 border-t dark:border-gray-700">
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Persona / Entidad</label>
                                        <input id="loanee-input" className="w-full text-black p-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600" placeholder="Ej. Juan Pérez" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Notas</label>
                                        <input id="loan-notes" className="w-full text-black p-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600" placeholder="Condiciones, fecha prevista..." />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={async () => {
                                            const name = (document.getElementById('loanee-input') as HTMLInputElement).value;
                                            const notes = (document.getElementById('loan-notes') as HTMLInputElement).value;
                                            if (!name) return toast.error('Indica quién se lo lleva');

                                            const fd = new FormData();
                                            fd.append('action', 'loan');
                                            fd.append('loanee', name);
                                            fd.append('notes', notes);

                                            const res = await toggleLoan(item._id, fd);
                                            if (res.success) toast.success('Préstamo registrado');
                                            else toast.error(res.error || 'Error');
                                        }}
                                        className="w-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 py-2 rounded-lg font-medium"
                                    >
                                        Confirmar Préstamo
                                    </button>
                                </div>
                            </div>
                        </details>
                    </div>
                )}
            </div>

            <div className="border-t pt-8 dark:border-gray-700">
                <h3 className="font-semibold text-lg mb-4 text-gray-900 dark:text-white flex items-center gap-2">
                    Cronología de Vida
                </h3>
                <ActivityTimeline events={item.events} acquisition={item.acquisition} />
            </div>

            <div className="pt-4 sticky bottom-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur pb-2 border-t dark:border-gray-700 -mx-6 px-6">
                <SubmitButton />
            </div>
        </form>
    );
}
