'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { createPortal } from 'react-dom';
import { X, Check, Guitar } from 'lucide-react';
import { submitToExhibition } from '@/actions/showroom';
import { getUserCollection } from '@/actions/inventory';
import { toast } from 'sonner';
import Image from 'next/image';

export default function SubmissionModal({ exhibitionId, isOpen, onClose }: any) {
    const [step, setStep] = useState(1); // 1: Select, 2: Notes
    const [instruments, setInstruments] = useState<any[]>([]);
    const [selectedId, setSelectedId] = useState('');
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            // Load user instruments
            getUserCollection().then(res => {
                // Filter? Maybe only active ones
                setInstruments(res.map((item: any) => ({
                    id: item.instrumentId._id,
                    name: `${item.instrumentId.brand} ${item.instrumentId.model}`,
                    image: item.instrumentId.genericImages?.[0]
                })));
            });
        }
    }, [isOpen]);

    const handleSubmit = async () => {
        setLoading(true);
        const res = await submitToExhibition({
            exhibitionId,
            instrumentId: selectedId,
            notes
        });

        if (res.success) {
            toast.success("¡Participación enviada!");
            onClose();
        } else {
            toast.error(res.error || "Error al enviar");
        }
        setLoading(false);
    };

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-zinc-900 w-full max-w-2xl rounded-3xl shadow-2xl border border-white/10 overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="p-6 border-b border-gray-100 dark:border-white/5 flex justify-between items-center">
                    <h2 className="text-xl font-bold">Participar en la Exposición</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {step === 1 && (
                        <div className="space-y-4">
                            <p className="text-gray-500 font-medium">Selecciona un instrumento de tu colección:</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {instruments.map(inst => (
                                    <div
                                        key={inst.id}
                                        onClick={() => setSelectedId(inst.id)}
                                        className={`p-3 rounded-xl border-2 cursor-pointer transition-all flex items-center gap-4
                                            ${selectedId === inst.id ? 'border-ios-blue bg-ios-blue/5' : 'border-transparent bg-gray-50 dark:bg-white/5 hover:bg-gray-100'}
                                        `}
                                    >
                                        <div className="w-12 h-12 rounded-lg bg-gray-200 overflow-hidden relative shrink-0">
                                            {inst.image ? <Image src={inst.image} fill alt="i" className="object-cover" /> : <Guitar size={24} className="m-auto text-gray-400" />}
                                        </div>
                                        <span className="font-bold text-sm">{inst.name}</span>
                                        {selectedId === inst.id && <Check size={16} className="ml-auto text-ios-blue" />}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-4">
                            <p className="text-gray-500 font-medium">Añade una nota para los curadores (Opcional):</p>
                            <textarea
                                className="w-full h-32 p-4 rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 resize-none focus:ring-2 ring-ios-blue outline-none"
                                placeholder="Cuéntanos la historia de este instrumento..."
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                            />
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-black/20 flex justify-between">
                    {step === 2 ? (
                        <Button variant="ghost" onClick={() => setStep(1)}>Atrás</Button>
                    ) : (
                        <div />
                    )}

                    {step === 1 ? (
                        <Button disabled={!selectedId} onClick={() => setStep(2)}>Siguiente</Button>
                    ) : (
                        <Button disabled={loading} onClick={handleSubmit}>
                            {loading ? 'Enviando...' : 'Confirmar Participación'}
                        </Button>
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
}
