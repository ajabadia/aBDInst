'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import SellModal from './SellModal';
import { ShoppingBag } from 'lucide-react';

export default function SellButton({ collectionItem }: { collectionItem: any }) {
    const [showModal, setShowModal] = useState(false);

    return (
        <>
            <Button
                variant="secondary"
                size="sm"
                className="w-full sm:w-auto"
                onClick={() => setShowModal(true)}
            >
                <ShoppingBag size={14} className="mr-2" /> Vender
            </Button>

            <SellModal
                collectionItem={collectionItem}
                isOpen={showModal}
                onClose={() => setShowModal(false)}
            />
        </>
    );
}
