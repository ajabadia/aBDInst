// src/components/CollectionStats.tsx
import { Wallet, ShieldCheck, Gauge } from 'lucide-react';

export default function CollectionStats({ collection }: { collection: any[] }) {
    const totalInvestment = collection.reduce((acc, item) => acc + (item.acquisition?.price || 0), 0);
    const itemsInRepair = collection.filter(item => item.status === 'repair').length;

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {/* CARD: Inversión Total */}
            <div className="p-8 rounded-[2.5rem] bg-white dark:bg-white/5 border border-gray-200/50 dark:border-white/10 shadow-sm backdrop-blur-md">
                <div className="flex items-center gap-4 mb-4">
                    <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600">
                        <Wallet size={20} />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Inversión Total</span>
                </div>
                <p className="text-4xl font-semibold tracking-tighter text-gray-900 dark:text-white">
                    {totalInvestment.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                </p>
            </div>

            {/* CARD: Salud de la Colección */}
            <div className="p-8 rounded-[2.5rem] bg-white dark:bg-white/5 border border-gray-200/50 dark:border-white/10 shadow-sm backdrop-blur-md">
                <div className="flex items-center gap-4 mb-4">
                    <div className="w-10 h-10 rounded-full bg-green-50 dark:bg-green-900/30 flex items-center justify-center text-green-600">
                        <ShieldCheck size={20} />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Estado Global</span>
                </div>
                <p className="text-4xl font-semibold tracking-tighter text-gray-900 dark:text-white">
                    {itemsInRepair > 0 ? `${itemsInRepair} en reparación` : 'Perfecto'}
                </p>
            </div>

            {/* CARD: Total Unidades */}
            <div className="p-8 rounded-[2.5rem] bg-white dark:bg-white/5 border border-gray-200/50 dark:border-white/10 shadow-sm backdrop-blur-md">
                <div className="flex items-center gap-4 mb-4">
                    <div className="w-10 h-10 rounded-full bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center text-purple-600">
                        <Gauge size={20} />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Unidades</span>
                </div>
                <p className="text-4xl font-semibold tracking-tighter text-gray-900 dark:text-white">
                    {collection.length} <span className="text-lg text-gray-400 font-normal">items</span>
                </p>
            </div>
        </div>
    );
}
