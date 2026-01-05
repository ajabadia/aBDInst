'use client';

import Link from 'next/link';
import { Edit2, FileText } from 'lucide-react';
import WishlistButton from '@/components/WishlistButton';
import AddToCollectionButton from '@/components/AddToCollectionButton';
import { Button } from './ui/Button';

export default function InstrumentHeaderButtons({
    instrumentId,
    canEdit,
    isLoggedIn
}: {
    instrumentId: string,
    canEdit: boolean,
    isLoggedIn: boolean
}) {
    return (
        <div className="flex flex-wrap md:flex-nowrap gap-3 items-center">
            <WishlistButton instrumentId={instrumentId} />

            {canEdit && (
                <Link href={`/instruments/${instrumentId}/edit`}>
                    <Button variant="secondary" icon={Edit2}>
                        Editar
                    </Button>
                </Link>
            )}

            <Button 
                variant="secondary" 
                icon={FileText}
                onClick={() => window.print()}
            >
                Ficha PDF
            </Button>

            {isLoggedIn && (
                <AddToCollectionButton instrumentId={instrumentId} />
            )}
        </div>
    );
}
