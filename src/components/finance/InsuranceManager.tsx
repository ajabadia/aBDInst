'use client';

import { useState } from 'react';
import { deleteInsurancePolicy } from '@/actions/finance';
import InsuranceForm from './InsuranceForm';
import { Button } from '@/components/ui/Button';
import { Shield, Plus, Trash2, Edit2, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface InsuranceManagerProps {
    collectionItemId: string;
    policies: any[];
}

export default function InsuranceManager({ collectionItemId, policies }: InsuranceManagerProps) {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingPolicy, setEditingPolicy] = useState<any>(null);

    const handleEdit = (policy: any) => {
        setEditingPolicy(policy);
        setIsFormOpen(true);
    };

    const handleNew = () => {
        setSelectedPolicy(null);
        setIsEditing(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('¿Seguro que quieres borrar esta póliza?')) return;
        const res = await deleteInsurancePolicy(id, instrumentId);
        if (res.success) toast.success('Póliza eliminada');
        else toast.error('Error al eliminar');
    };

    const isActive = (endDate: string) => new Date(endDate) > new Date();

    if (isEditing) {
        return (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                <h3 className="text-lg font-bold mb-4">{selectedPolicy ? 'Editar Póliza' : 'Nueva Póliza'}</h3>
                <InsuranceForm
                    instrumentId={instrumentId}
                    policy={selectedPolicy}
                    onClose={() => setIsEditing(false)}
                    onSuccess={() => setIsEditing(false)}
                />
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50">
                <div className="flex items-center gap-2">
                    <Shield className="text-blue-600" size={20} />
                    <h3 className="font-semibold text-gray-900 dark:text-white">Seguros y Pólizas</h3>
                </div>
                <Button size="sm" variant="secondary" icon={Plus} onClick={handleNew}>Añadir</Button>
            </div>

            <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {policies.length === 0 ? (
                    <div className="p-8 text-center text-gray-400 text-sm">
                        No hay pólizas registradas.
                    </div>
                ) : (
                    policies.map((policy: any) => {
                        const active = isActive(policy.endDate);
                        return (
                            <div key={policy._id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold flex items-center gap-1 ${active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                            {active ? <CheckCircle size={10} /> : <AlertCircle size={10} />}
                                            {active ? 'Activa' : 'Vencida'}
                                        </span>
                                        <h4 className="font-medium text-gray-900 dark:text-white">{policy.provider}</h4>
                                        <span className="text-xs text-gray-500 font-mono">#{policy.policyNumber}</span>
                                    </div>
                                    <div className="text-sm text-gray-600 dark:text-gray-300 grid grid-cols-2 gap-x-8 gap-y-1">
                                        <p>Cobertura: <span className="font-semibold">{policy.coverageAmount} {policy.currency}</span></p>
                                        <p>Prima: {policy.premium} {policy.currency}/año</p>
                                        <p className="col-span-2 text-xs text-gray-400 mt-1">
                                            Vence: {format(new Date(policy.endDate), 'PP', { locale: es })}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => handleEdit(policy)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                        <Edit2 size={16} />
                                    </button>
                                    <button onClick={() => handleDelete(policy._id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
