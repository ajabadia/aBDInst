'use client';

import { useState } from 'react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { X, Wrench, Calendar, Euro, User as TechIcon } from 'lucide-react';
import { addMaintenanceRecord } from '@/actions/collection';
import { toast } from 'sonner';
// import { useRouter } from 'next/navigation'; // Not used in this snippet as we handle close internally or via props, but good for refresh.
// Actually updating to use router.refresh() is good practice after mutation
import { useRouter } from 'next/navigation';

export default function MaintenanceModal({ collectionId, onClose }: { collectionId: string, onClose: () => void }) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    async function handleAction(formData: FormData) {
        setLoading(true);
        const res = await addMaintenanceRecord(collectionId, formData);
        if (res.success) {
            toast.success('Mantenimiento registrado');
            router.refresh();
            onClose();
        } else {
            toast.error('Error al guardar');
            setLoading(false);
        }
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-transparent">
            {/* Backdrop: Desenfoque de fondo Apple */}
            <div className="absolute inset-0 bg-gray-900/40 dark:bg-black/60 backdrop-blur-md transition-all" onClick={onClose} />

            {/* Card del Modal */}
            <div className="relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-[2.5rem] p-8 md:p-10 shadow-2xl border border-gray-200 dark:border-white/10 animate-in zoom-in-95 duration-300">

                <button onClick={onClose} className="absolute top-6 right-6 p-2 rounded-full bg-gray-100 dark:bg-white/5 hover:bg-gray-200 transition-colors">
                    <X size={20} className="text-gray-500" />
                </button>

                <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600">
                        <Wrench size={24} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-semibold tracking-tight">Nuevo registro</h2>
                        <p className="text-sm text-gray-500">Añade detalles de la intervención.</p>
                    </div>
                </div>

                <form action={handleAction} className="space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                        <Input label="Fecha" name="date" type="date" icon={Calendar} required defaultValue={new Date().toISOString().split('T')[0]} />
                        <div className="w-full">
                            <label className="apple-label">Intervención</label>
                            <select name="type" className="apple-select">
                                <option value="setup">Ajuste / Setup</option>
                                <option value="repair">Reparación</option>
                                <option value="modification">Modificación</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Input label="Técnico / Luthier" name="technician" placeholder="Nombre" icon={TechIcon} />
                        <Input label="Coste (€)" name="cost" type="number" step="0.01" placeholder="0.00" icon={Euro} />
                    </div>

                    <div>
                        <label className="apple-label">Descripción de los trabajos</label>
                        <textarea
                            name="description"
                            required
                            rows={3}
                            placeholder="¿Qué se le ha hecho al instrumento?"
                            className="apple-input resize-none"
                        ></textarea>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>
                            Cancelar
                        </Button>
                        <Button type="submit" isLoading={loading} className="flex-1">
                            Guardar registro
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
