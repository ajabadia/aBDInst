'use client';

import Link from 'next/link';
import { Edit2, FileText } from 'lucide-react';
import WishlistButton from '@/components/WishlistButton';
import AddToCollectionButton from '@/components/AddToCollectionButton';
import { Button } from './ui/Button';
import SocialShare from './SocialShare';

export default function InstrumentHeaderButtons({
    instrumentId,
    brand,
    model,
    imageUrl,
    canEdit,
    isLoggedIn
}: {
    instrumentId: string,
    brand: string,
    model: string,
    imageUrl?: string,
    canEdit: boolean,
    isLoggedIn: boolean
}) {
    const shareText = `¡Mira este espectacular ${brand} ${model} que encontré en @InstrumentCollector! 🎸⚡`;

    return (
        <div className="flex flex-wrap md:flex-nowrap gap-3 items-center">
            <WishlistButton instrumentId={instrumentId} />

            <SocialShare
                title={`${brand} ${model}`}
                text={shareText}
                url={`/instruments/${instrumentId}`}
                imageUrl={imageUrl}
            />

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
