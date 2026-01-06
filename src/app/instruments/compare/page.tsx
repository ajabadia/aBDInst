import { getInstruments } from '@/actions/catalog';
import CatalogCompareClient from '@/components/CatalogCompareClient';
import { cleanData } from '@/lib/utils';
import { GitCompare } from 'lucide-react';

export default async function CatalogComparePage() {
    // CRITICAL FIX: We need to pass 'true' to the 'full' parameter 
    // to fetch the 'specs' and 'description' fields for comparison.
    const rawInstruments = await getInstruments(undefined, null, 'brand', 'asc', undefined, true);
    const instruments = cleanData(rawInstruments);

    return (
        <div className="max-w-7xl mx-auto px-6 py-12 lg:py-20 space-y-12">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-ios-blue/10 text-ios-blue rounded-xl shadow-sm">
                            <GitCompare className="w-6 h-6" />
                        </div>
                        <h1 className="text-4xl font-bold tracking-tight">Comparativa Maestra</h1>
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 font-medium ml-1">
                        Analiza especificaciones técnicas y valores de mercado en paralelo.
                    </p>
                </div>
            </header>

            <CatalogCompareClient instruments={instruments} />
        </div>
    );
}
