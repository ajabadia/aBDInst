
'use client';

import { useState, useEffect } from 'react';
import { approveInstrument, rejectInstrument, getPendingInstruments } from '@/actions/instrument';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { Check, X, Loader2, Eye, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export default function ApprovalQueue() {
    const [pendingInstruments, setPendingInstruments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const loadQueue = async () => {
        setLoading(true);
        const data = await getPendingInstruments();
        setPendingInstruments(data);
        setLoading(false);
    };

    useEffect(() => {
        loadQueue();
    }, []);

    const handleApprove = async (id: string) => {
        if (!confirm('¿Aprobar para el catálogo público?')) return;
        const res = await approveInstrument(id);
        if (res.success) {
            toast.success('Aprobado');
            loadQueue();
        } else {
            toast.error(res.error);
        }
    };

    const handleReject = async (id: string) => {
        const reason = prompt('Motivo del rechazo:');
        if (!reason) return;

        const res = await rejectInstrument(id, reason);
        if (res.success) {
            toast.info('Rechazado');
            loadQueue();
        } else {
            toast.error(res.error);
        }
    };

    if (loading) return <div className="p-12 text-center"><Loader2 className="animate-spin inline" /> Cargando solicitudes...</div>;

    if (pendingInstruments.length === 0) {
        return (
            <div className="p-12 text-center text-gray-500 bg-gray-50 dark:bg-gray-800 rounded-3xl border border-dashed border-gray-200 dark:border-gray-700">
                <Check className="mx-auto mb-4 text-green-500 bg-green-100 p-2 rounded-full box-content" size={24} />
                <h3 className="text-xl font-bold mb-2">Todo en orden</h3>
                <p>No hay instrumentos pendientes de revisión.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {pendingInstruments.map((inst) => (
                <div key={inst._id} className="apple-card p-6 flex flex-col md:flex-row items-center gap-6 group">
                    <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden flex-shrink-0">
                        {inst.genericImages?.[0] ? (
                            <img src={inst.genericImages[0]} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">Sin Foto</div>
                        )}
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="bg-orange-100 text-orange-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Pendiente</span>
                            <span className="text-xs text-gray-400">enviado por {inst.createdBy?.name || 'Usuario'}</span>
                        </div>
                        <h4 className="text-lg font-bold truncate">{inst.brand} {inst.model}</h4>
                        <p className="text-sm text-gray-500 truncate">{inst.type} • {inst.years?.join(', ')}</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link href={`/instruments/${inst._id}/edit`} target="_blank">
                            <Button variant="secondary" className="h-10 w-10 p-0 rounded-full" title="Revisar/Editar">
                                <ExternalLink size={16} />
                            </Button>
                        </Link>

                        <Button
                            onClick={() => handleReject(inst._id)}
                            className="bg-red-50 hover:bg-red-100 text-red-600 h-10 w-10 p-0 rounded-full"
                            title="Rechazar"
                        >
                            <X size={18} />
                        </Button>

                        <Button
                            onClick={() => handleApprove(inst._id)}
                            className="bg-green-600 hover:bg-green-700 text-white h-10 px-4 rounded-full shadow-lg shadow-green-600/20"
                        >
                            <Check size={18} className="mr-2" /> Aprobar
                        </Button>
                    </div>
                </div>
            ))}
        </div>
    );
}
