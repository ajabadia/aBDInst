'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { createPortal } from 'react-dom';
import { X, DollarSign, Tag, FileText } from 'lucide-react';
import { createListing } from '@/actions/market';
import { toast } from 'sonner';

export default function SellModal({ collectionItem, isOpen, onClose }: any) {
    const [price, setPrice] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!price || !description) return toast.error("Rellena precio y descripción");

        setLoading(true);
        const res = await createListing({
            collectionId: collectionItem._id,
            price: parseFloat(price),
            description,
            condition: collectionItem.condition // Use existing condition or allow override
        });

        if (res.success) {
            toast.success("¡Artículo puesto a la venta!");
            onClose();
        } else {
            toast.error(res.error || "Error al publicar");
        }
        setLoading(false);
    };

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-3xl shadow-2xl border border-white/10 overflow-hidden flex flex-col">

                <div className="p-6 border-b border-gray-100 dark:border-white/5 flex justify-between items-center">
                    <h2 className="text-xl font-bold">Vender Instrumento</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-xl flex items-center gap-3">
                        <Tag className="text-ios-blue" />
                        <div>
                            <p className="font-bold text-sm">{collectionItem.instrumentId?.brand} {collectionItem.instrumentId?.model}</p>
                            <p className="text-xs text-gray-400 capitalize">Estado: {collectionItem.condition}</p>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-500">Precio (EUR)</label>
                        <div className="relative">
                            <DollarSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="number"
                                className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 focus:ring-2 ring-ios-blue outline-none"
                                placeholder="0.00"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-500">Descripción Pública</label>
                        <textarea
                            className="w-full h-32 p-4 rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 resize-none focus:ring-2 ring-ios-blue outline-none"
                            placeholder="Describe detalles, modificaciones, historia..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>
                </div>

                <div className="p-6 border-t border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-black/20 flex justify-end gap-2">
                    <Button variant="ghost" onClick={onClose}>Cancelar</Button>
                    <Button disabled={loading} onClick={handleSubmit} className="bg-green-600 hover:bg-green-700 text-white">
                        {loading ? 'Publicando...' : 'Publicar Anuncio'}
                    </Button>
                </div>
            </div>
        </div>,
        document.body
    );
}
