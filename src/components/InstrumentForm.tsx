'use client';

import { createInstrument } from '@/actions/instrument';
import { useFormStatus } from 'react-dom';
import ImageUpload from './ImageUpload';

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <button
            type="submit"
            disabled={pending}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition disabled:opacity-50"
        >
            {pending ? 'Guardando...' : 'Crear Instrumento'}
        </button>
    );
}

export default function InstrumentForm() {
    async function action(formData: FormData) {
        const res = await createInstrument(formData);
        if (res.error) {
            alert('Error: ' + res.error);
        } else {
            // Redirect handled by server action revalidatePath/redirect? 
            // Ideally we should redirect here or the server action should redirect
            // But for now let's just assume a redirect or successful message
            window.location.href = '/instruments';
        }
    }

    return (
        <form action={action} className="space-y-6 max-w-2xl mx-auto p-6 bg-white dark:bg-gray-800 rounded shadow">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium mb-1">Marca *</label>
                    <input name="brand" required className="w-full text-black p-2 border rounded" placeholder="Ej. Roland" />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Modelo *</label>
                    <input name="model" required className="w-full text-black p-2 border rounded" placeholder="Ej. Juno-106" />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium mb-1">Tipo *</label>
                    <select name="type" required className="w-full text-black p-2 border rounded">
                        <option value="synthesizer">Sintetizador</option>
                        <option value="drum_machine">Caja de Ritmos</option>
                        <option value="guitar">Guitarra</option>
                        <option value="modular">Modular</option>
                        <option value="software">Software</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Subtipo</label>
                    <input name="subtype" className="w-full  text-black p-2 border rounded" placeholder="Ej. Analógico" />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium mb-1">Versión</label>
                <input name="version" className="w-full text-black p-2 border rounded" placeholder="Ej. MkII" />
            </div>

            <div>
                <label className="block text-sm font-medium mb-1">Años de Fabricación (separados por coma)</label>
                <input name="years" className="w-full text-black p-2 border rounded" placeholder="1984, 1985" />
            </div>

            <div>
                <label className="block text-sm font-medium mb-1">Imagen Principal</label>
                <ImageUpload onUpload={(url) => {
                    const input = document.getElementById('genericImages-input') as HTMLInputElement;
                    if (input) input.value = url;
                }} />
                <input type="hidden" name="genericImages" id="genericImages-input" />
            </div>

            <div className="border-t pt-4 mt-4">
                <h3 className="font-semibold mb-3">Especificaciones Técnicas</h3>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Polifonía (voces)</label>
                        <input name="specs.polyphony" type="number" className="w-full text-black p-2 border rounded" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Osciladores</label>
                        <input name="specs.oscillators" type="number" className="w-full text-black p-2 border rounded" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Peso (kg)</label>
                        <input name="specs.weight" type="number" step="0.1" className="w-full text-black p-2 border rounded" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Dimensiones</label>
                        <input name="specs.dimensions" className="w-full text-black p-2 border rounded" />
                    </div>
                </div>
                <div className="flex gap-4 mt-4">
                    <label className="flex items-center gap-2">
                        <input name="specs.sequencer" type="checkbox" /> Secuenciador
                    </label>
                    <label className="flex items-center gap-2">
                        <input name="specs.midi" type="checkbox" /> MIDI
                    </label>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium mb-1">Descripción</label>
                <textarea name="description" rows={4} className="w-full text-black p-2 border rounded"></textarea>
            </div>

            <SubmitButton />
        </form>
    );
}
