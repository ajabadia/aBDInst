import InstrumentFinanceSection from '@/components/finance/InstrumentFinanceSection';
import ValuationSection from '@/components/valuation/ValuationSection';
import PersonalGallerySection from '@/components/gallery/PersonalGallerySection';
import { Badge } from '@/components/ui/Badge';
import { History, Info, ShieldCheck } from 'lucide-react';
import { format } from 'date-fns';

interface UserUnitDetailsProps {
    unit: any;
    instrument: any;
    canEdit: boolean;
}

export default function UserUnitDetails({ unit, instrument, canEdit }: UserUnitDetailsProps) {
    if (!unit) return null;

    return (
        <div className="space-y-12 animate-in fade-in duration-500">
            {/* UNIT HEADER INFO */}
            <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
                <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <Badge variant={unit.status === 'active' ? 'success' : 'secondary'}>
                                {unit.status === 'active' ? 'En Colección' : unit.status}
                            </Badge>
                            {unit.condition && (
                                <Badge variant="outline" className="border-blue-200 text-blue-700 bg-blue-50 dark:bg-blue-900/10 dark:text-blue-300 dark:border-blue-800">
                                    {unit.condition}
                                </Badge>
                            )}
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            {unit.inventorySerial ? (
                                <span className="font-mono text-gray-500">#{unit.inventorySerial}</span>
                            ) : (
                                <span className="text-gray-400 italic text-base font-normal">Sin N/S Inventario</span>
                            )}
                        </h3>
                        <div className="text-sm text-gray-500 flex items-center gap-4">
                            {unit.acquisition?.date && (
                                <span className="flex items-center gap-1">
                                    <History size={14} />
                                    Adquirido: {format(new Date(unit.acquisition.date), 'dd/MM/yyyy')}
                                </span>
                            )}
                            {unit.acquisition?.isOriginalOwner && (
                                <span className="flex items-center gap-1 text-green-600 dark:text-green-400 font-medium">
                                    <ShieldCheck size={14} />
                                    Dueño Original
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* PROVENANCE */}
                {unit.acquisition?.provenance && (
                    <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-800">
                        <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2 flex items-center gap-2">
                            <Info size={14} />
                            Procedencia / Historia
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300 italic">
                            "{unit.acquisition.provenance}"
                        </p>
                    </div>
                )}
            </div>

            {/* SECTIONS */}

            {/* 1. Valuation / ROI (Client Component) */}
            <div className="border-t border-gray-100 dark:border-gray-800 pt-8">
                <ValuationSection
                    instrument={instrument}
                    purchasePrice={unit.acquisition?.price}
                    canEdit={canEdit} // Global edit permission for market data
                />
            </div>

            {/* 2. Finance / Insurance (Server Component) */}
            <div className="border-t border-gray-100 dark:border-gray-800 pt-8">
                <InstrumentFinanceSection collectionItemId={unit._id} />
            </div>

            {/* 3. Personal Gallery (Client Component) */}
            <div className="border-t border-gray-100 dark:border-gray-800 pt-8">
                <PersonalGallerySection
                    collectionId={unit._id}
                    images={unit.images || []} // Assuming userImages are populated here? 
                // Wait, `ownedItems` fetch in page.tsx selects 'acquisition inventorySerial condition status'.
                // It DOES NOT select 'images'. I need to update page.tsx fetch!
                />
            </div>
        </div>
    );
}
