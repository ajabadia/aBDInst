'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { addValuation } from '@/actions/valuation';
import { Euro, Calendar, Link as LinkIcon, FileText } from 'lucide-react';

interface ValuationModalProps {
    isOpen: boolean;
    onClose: () => void;
    instrumentId: string;
    instrumentName: string;
}

export default function ValuationModal({ isOpen, onClose, instrumentId, instrumentName }: ValuationModalProps) {
    const [isLoading, setIsLoading] = useState(false);

    // Form States
    const [value, setValue] = useState('');
    const [minValue, setMinValue] = useState('');
    const [maxValue, setMaxValue] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [source, setSource] = useState('');
    const [notes, setNotes] = useState('');
    const [context, setContext] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const numericValue = parseFloat(value);
        if (isNaN(numericValue) || numericValue <= 0) {
            toast.error("Por favor introduce un valor válido");
            setIsLoading(false);
            return;
        }

        const range = (minValue && maxValue) ? {
            min: parseFloat(minValue),
            max: parseFloat(maxValue)
        } : undefined;

        // Combine context into notes or source for now
        const finalNotes = context ? `[${context}] ${notes}` : notes;

        try {
            const result = await addValuation(instrumentId, numericValue, new Date(date), source, finalNotes, range);
            if (result.success) {
                toast.success("Valor registrado correctamente");
                onClose();
            } else {
                toast.error(result.error || "Error al registrar valor");
            }
        } catch (error) {
            toast.error("Error desconocido");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Registrar Valor de Mercado</DialogTitle>
                    <p className="text-sm text-gray-500">
                        Añade un punto de datos para {instrumentName}. Esto actualizará el valor global estimado.
                    </p>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                    <div className="grid gap-2">
                        <Label htmlFor="value">Valor Estimado (EUR)</Label>
                        <div className="relative">
                            <Euro className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                            <Input
                                id="value"
                                type="number"
                                placeholder="0.00"
                                className="pl-9"
                                value={value}
                                onChange={(e) => setValue(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="minValue" className="text-xs">Mínimo (Opcional)</Label>
                            <Input
                                id="minValue"
                                type="number"
                                placeholder="Min"
                                value={minValue}
                                onChange={(e) => setMinValue(e.target.value)}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="maxValue" className="text-xs">Máximo (Opcional)</Label>
                            <Input
                                id="maxValue"
                                type="number"
                                placeholder="Max"
                                value={maxValue}
                                onChange={(e) => setMaxValue(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="context">Contexto / Tipo</Label>
                        <select
                            id="context"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            value={context}
                            onChange={(e) => setContext(e.target.value)}
                        >
                            <option value="">-- Seleccionar Contexto --</option>
                            <option value="Second Hand (Mint)">Segunda Mano (Mint/Perfecto)</option>
                            <option value="Second Hand (Good)">Segunda Mano (Bueno)</option>
                            <option value="Second Hand (Poor)">Segunda Mano (Para reparar)</option>
                            <option value="Dealer / Shop">Precio Tienda / Dealer</option>
                            <option value="Auction Result">Resultado Subasta</option>
                            <option value="Private Offer">Oferta Privada</option>
                            <option value="Original MSRP">Precio Original (MSRP)</option>
                        </select>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="date">Fecha de Observación</Label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                            <Input
                                id="date"
                                type="date"
                                className="pl-9"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="source">Fuente</Label>
                        <div className="relative">
                            <LinkIcon className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                            <Input
                                id="source"
                                placeholder="ej. Reverb, eBay, Wallapop"
                                className="pl-9"
                                value={source}
                                onChange={(e) => setSource(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="notes">Notas</Label>
                        <div className="relative">
                            <FileText className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                            <Input
                                id="notes"
                                placeholder="Detalles adicionales..."
                                className="pl-9"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <Button type="button" variant="ghost" onClick={onClose} disabled={isLoading}>
                            Cancelar
                        </Button>
                        <Button type="submit" isLoading={isLoading}>
                            Guardar Valor
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
