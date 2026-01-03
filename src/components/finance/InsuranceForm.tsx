'use client';

import { useState } from 'react';
import { saveInsurancePolicy } from '@/actions/finance';
import { Button } from '@/components/ui/Button';
import { toast } from 'sonner';
import { Save, X } from 'lucide-react';

export default function InsuranceForm({ instrumentId, policy, onClose, onSuccess }: any) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        instrumentId,
        _id: policy?._id,
        provider: policy?.provider || '',
        policyNumber: policy?.policyNumber || '',
        coverageAmount: policy?.coverageAmount || 0,
        premium: policy?.premium || 0,
        startDate: policy?.startDate ? new Date(policy.startDate).toISOString().split('T')[0] : '',
        endDate: policy?.endDate ? new Date(policy.endDate).toISOString().split('T')[0] : '',
        type: policy?.type || 'All-Risk',
        notes: policy?.notes || ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await saveInsurancePolicy(formData);
            if (res.success) {
                toast.success('Póliza guardada');
                onSuccess();
            } else {
                toast.error(res.error || 'Error al guardar');
            }
        } catch (e) {
            toast.error('Error de conexión');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Aseguradora</label>
                    <input
                        required
                        type="text"
                        value={formData.provider}
                        onChange={e => setFormData({ ...formData, provider: e.target.value })}
                        className="apple-input w-full"
                        placeholder="Ej: Mapfre"
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Nº Póliza</label>
                    <input
                        required
                        type="text"
                        value={formData.policyNumber}
                        onChange={e => setFormData({ ...formData, policyNumber: e.target.value })}
                        className="apple-input w-full"
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Cobertura (€)</label>
                    <input
                        type="number"
                        value={formData.coverageAmount}
                        onChange={e => setFormData({ ...formData, coverageAmount: parseFloat(e.target.value) })}
                        className="apple-input w-full"
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Prima Anual (€)</label>
                    <input
                        type="number"
                        value={formData.premium}
                        onChange={e => setFormData({ ...formData, premium: parseFloat(e.target.value) })}
                        className="apple-input w-full"
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Inicio</label>
                    <input
                        required
                        type="date"
                        value={formData.startDate}
                        onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                        className="apple-input w-full"
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Vencimiento</label>
                    <input
                        required
                        type="date"
                        value={formData.endDate}
                        onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                        className="apple-input w-full"
                    />
                </div>
            </div>

            <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Tipo</label>
                <select
                    value={formData.type}
                    onChange={e => setFormData({ ...formData, type: e.target.value })}
                    className="apple-input w-full"
                >
                    <option value="All-Risk">Todo Riesgo</option>
                    <option value="Theft">Robo</option>
                    <option value="Damage">Daños</option>
                    <option value="Other">Otro</option>
                </select>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>Cancelar</Button>
                <Button type="submit" className="bg-blue-600 text-white" disabled={loading} icon={Save}>
                    {loading ? 'Guardando...' : 'Guardar Póliza'}
                </Button>
            </div>
        </form>
    );
}
