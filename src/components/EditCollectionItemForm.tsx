'use client';

import { updateCollectionItem } from '@/actions/collection';
import { useFormStatus } from 'react-dom';
import ImageUpload from '@/components/ImageUpload';
import { useState } from 'react';

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <button
            type="submit"
            disabled={pending}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition disabled:opacity-50"
        >
            {pending ? 'Guardando...' : 'Guardar Cambios'}
        </button>
    );
}

export default function EditCollectionItemForm({ item }: { item: any }) {
    // Initial state setup if needed, but for server actions we can rely on defaultValues in inputs
    // For images, we might want state to show added images immediately? 
    // Simplify for now: Just standard form inputs + image upload

    async function action(formData: FormData) {
        const res = await updateCollectionItem(item._id, formData);
        if (res.success) {
            alert('Datos actualizados!');
        } else {
            alert('Error: ' + res.error);
        }
    }

    return (
        <form action={action} className="space-y-6 bg-white dark:bg-gray-800 p-6 rounded shadow">

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium mb-1">Estado</label>
                    <select name="status" defaultValue={item.status} className="w-full text-black p-2 border rounded">
                        <option value="active">Activo (En mi estudio)</option>
                        <option value="sold">Vendido</option>
                        <option value="wishlist">Lista de Deseos</option>
                        <option value="repair">En Reparación</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Condición</label>
                    <select name="condition" defaultValue={item.condition} className="w-full text-black p-2 border rounded">
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
                <label className="block text-sm font-medium mb-1">Número de Serie</label>
                <input name="serialNumber" defaultValue={item.serialNumber} className="w-full text-black p-2 border rounded" />
            </div>

            <div className="border-t pt-4 dark:border-gray-700">
                <h3 className="font-semibold mb-3">Datos de Adquisición</h3>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Fecha de Compra</label>
                        <input name="acquisition.date" type="date" defaultValue={item.acquisition?.date} className="w-full text-black p-2 border rounded" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Precio</label>
                        <div className="flex gap-2">
                            <input name="acquisition.price" type="number" defaultValue={item.acquisition?.price} className="w-full text-black p-2 border rounded" placeholder="0.00" />
                            <select name="acquisition.currency" defaultValue={item.acquisition?.currency || 'EUR'} className="text-black p-2 border rounded">
                                <option value="EUR">EUR</option>
                                <option value="USD">USD</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Vendedor</label>
                        <input name="acquisition.seller" defaultValue={item.acquisition?.seller} className="w-full text-black p-2 border rounded" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Fuente (Reverb, Wallapop...)</label>
                        <input name="acquisition.source" defaultValue={item.acquisition?.source} className="w-full text-black p-2 border rounded" />
                    </div>
                </div>
            </div>

            <div className="border-t pt-4 dark:border-gray-700">
                <label className="block text-sm font-medium mb-1">Notas Privadas</label>
                <textarea name="customNotes" defaultValue={item.customNotes} rows={3} className="w-full text-black p-2 border rounded"></textarea>
            </div>

            <SubmitButton />
        </form>
    );
}
