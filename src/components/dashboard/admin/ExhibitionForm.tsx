'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';
import { createExhibition, updateExhibition } from '@/actions/exhibition';
import { toast } from 'sonner';

export default function ExhibitionForm({ initialData }: { initialData?: any }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: initialData?.title || '',
        description: initialData?.description || '',
        startDate: initialData?.startDate ? new Date(initialData.startDate).toISOString().split('T')[0] : '',
        endDate: initialData?.endDate ? new Date(initialData.endDate).toISOString().split('T')[0] : '',
        type: initialData?.type || 'showcase', // showcase | contest
        status: initialData?.status || 'draft',
        participationType: initialData?.participationType || 'open'
    });

    const handleChange = (e: any) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const payload = {
            ...formData,
            startDate: new Date(formData.startDate),
            endDate: formData.endDate ? new Date(formData.endDate) : null
        };

        let res;
        if (initialData?._id) {
            res = await updateExhibition(initialData._id, payload);
        } else {
            res = await createExhibition(payload);
        }

        if (res.success) {
            toast.success(initialData ? "Exposición actualizada" : "Exposición creada");
            router.push('/dashboard/admin/scheduler');
            router.refresh();
        } else {
            toast.error(res.error || "Error");
        }
        setLoading(false);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl bg-white dark:bg-white/5 p-8 rounded-2xl border border-gray-200 dark:border-white/10">
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-bold mb-1">Título del Evento</label>
                    <input
                        name="title"
                        required
                        value={formData.title}
                        onChange={handleChange}
                        className="w-full p-2 rounded-lg bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10"
                        placeholder="Ej: La Era Dorada de Fender"
                    />
                </div>

                <div>
                    <label className="block text-sm font-bold mb-1">Descripción</label>
                    <textarea
                        name="description"
                        rows={4}
                        value={formData.description}
                        onChange={handleChange}
                        className="w-full p-2 rounded-lg bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10"
                        placeholder="¿De qué trata esta exposición?"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-bold mb-1">Fecha Inicio</label>
                        <input
                            type="date"
                            name="startDate"
                            required
                            value={formData.startDate}
                            onChange={handleChange}
                            className="w-full p-2 rounded-lg bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold mb-1">Fecha Fin (Opcional)</label>
                        <input
                            type="date"
                            name="endDate"
                            value={formData.endDate}
                            onChange={handleChange}
                            className="w-full p-2 rounded-lg bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-bold mb-1">Tipo</label>
                        <select
                            name="type"
                            value={formData.type}
                            onChange={handleChange}
                            className="w-full p-2 rounded-lg bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10"
                        >
                            <option value="showcase">Exposición (Showcase)</option>
                            <option value="contest">Concurso (Contest)</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-bold mb-1">Estado</label>
                        <select
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            className="w-full p-2 rounded-lg bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10"
                        >
                            <option value="draft">Borrador</option>
                            <option value="active">Activo</option>
                            <option value="upcoming">Próximamente</option>
                            <option value="ended">Finalizado</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="pt-4 flex justify-end gap-4">
                <Button type="button" variant="ghost" onClick={() => router.back()}>Cancelar</Button>
                <Button type="submit" disabled={loading}>
                    {loading ? 'Guardando...' : (initialData ? 'Actualizar Evento' : 'Crear Evento')}
                </Button>
            </div>
        </form>
    );
}
