'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Trophy, X, Search, CheckCircle2 } from 'lucide-react';
import { submitToExhibition } from '@/actions/showroom';
import { toast } from 'sonner';
import Image from 'next/image';

interface ParticipationModalProps {
    exhibitionId: string;
    exhibitionTitle: string;
    userCollection: any[];
}

export default function ParticipationModal({ exhibitionId, exhibitionTitle, userCollection }: ParticipationModalProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [notes, setNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const filteredItems = userCollection.filter(item => {
        const inst = item.instrumentId;
        const searchStr = `${inst.brand} ${inst.model}`.toLowerCase();
        return searchStr.includes(searchTerm.toLowerCase());
    });

    const handleSubmit = async () => {
        if (!selectedId) return;
        setIsSubmitting(true);
        const res = await submitToExhibition({
            exhibitionId,
            instrumentId: selectedId,
            notes
        });

        if (res.success) {
            toast.success('¡Participación registrada con éxito!');
            setIsOpen(false);
            // Reset
            setSelectedId(null);
            setNotes('');
        } else {
            toast.error(res.error || 'Error al registrar participación');
        }
        setIsSubmitting(false);
    };

    if (!isOpen) {
        return (
            <Button
                size="lg"
                onClick={() => setIsOpen(true)}
                className="rounded-full px-8 bg-ios-blue hover:scale-105 transition-transform"
                icon={Trophy}
            >
                Participar
            </Button>
        );
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md animate-in fade-in" onClick={() => setIsOpen(false)} />

            <div className="relative bg-white dark:bg-zinc-900 rounded-[2.5rem] p-8 w-full max-w-2xl shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
                <button
                    onClick={() => setIsOpen(false)}
                    className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                    <X size={24} />
                </button>

                <div className="mb-8">
                    <h2 className="text-3xl font-bold mb-2">Unirse a la Exhibición</h2>
                    <p className="text-gray-500 uppercase tracking-widest text-xs font-bold">{exhibitionTitle}</p>
                </div>

                {/* Step 1: Select Instrument */}
                <div className="flex-1 overflow-hidden flex flex-col">
                    <div className="relative mb-4">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Buscar en tu colección..."
                            className="w-full pl-10 pr-4 py-3 bg-gray-100 dark:bg-white/5 rounded-2xl border-transparent focus:ring-2 ring-ios-blue/20 outline-none"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="flex-1 overflow-y-auto pr-2 space-y-2 mb-6 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-white/10">
                        {filteredItems.map(item => (
                            <div
                                key={item._id}
                                onClick={() => setSelectedId(item.instrumentId._id)}
                                className={`flex items-center gap-4 p-4 rounded-3xl border-2 transition-all cursor-pointer ${selectedId === item.instrumentId._id
                                        ? 'border-ios-blue bg-ios-blue/5'
                                        : 'border-transparent bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10'
                                    }`}
                            >
                                <div className="w-16 h-16 bg-white rounded-2xl overflow-hidden relative shadow-sm shrink-0">
                                    {(item.images?.[0]?.url || item.instrumentId.genericImages?.[0]) && (
                                        <Image
                                            src={item.images?.[0]?.url || item.instrumentId.genericImages[0]}
                                            fill
                                            alt="inst"
                                            className="object-cover"
                                        />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-lg leading-tight truncate">{item.instrumentId.brand} {item.instrumentId.model}</p>
                                    <p className="text-xs text-gray-400 font-mono uppercase mt-1">{item.instrumentId.type}</p>
                                </div>
                                {selectedId === item.instrumentId._id && (
                                    <CheckCircle2 className="text-ios-blue" size={24} />
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-bold uppercase tracking-wider text-gray-500 px-1">Nota de Participación</label>
                            <textarea
                                className="w-full p-4 bg-gray-100 dark:bg-white/5 rounded-2xl border-transparent focus:ring-2 ring-ios-blue/20 outline-none min-h-[100px]"
                                placeholder="Cuéntanos por qué esta pieza es especial para esta exhibición..."
                                value={notes}
                                onChange={e => setNotes(e.target.value)}
                            />
                        </div>

                        <Button
                            className="w-full py-6 rounded-3xl text-lg font-bold shadow-xl shadow-ios-blue/20"
                            disabled={!selectedId || isSubmitting}
                            onClick={handleSubmit}
                        >
                            {isSubmitting ? 'Registrando...' : 'Confirmar Participación'}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
