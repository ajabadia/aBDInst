import { getInstruments } from '@/actions/instrument';
import CatalogCompareClient from '@/components/CatalogCompareClient';
import { cleanData } from '@/lib/utils';

export default async function CatalogComparePage() {
    const rawInstruments = await getInstruments();
    const instruments = cleanData(rawInstruments);

    return (
        <div className="container mx-auto px-6 py-12 max-w-7xl">
            <CatalogCompareClient instruments={instruments} />
        </div>
    );
}
