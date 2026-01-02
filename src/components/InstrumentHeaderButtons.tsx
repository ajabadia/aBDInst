'use client';

import Link from 'next/link';
import { Edit2, FileText } from 'lucide-react';
import WishlistButton from '@/components/WishlistButton';

import AddToCollectionButton from '@/components/AddToCollectionButton';

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
        <div className="flex gap-3">
            <WishlistButton instrumentId={instrumentId} />

            {canEdit && (
                <Link
                    href={`/instruments/${instrumentId}/edit`}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-medium transition-all bg-[#f5f5f7] hover:bg-[#e8e8ed] text-[#1d1d1f] dark:bg-[#1c1c1e] dark:hover:bg-[#2c2c2e] dark:text-white border border-transparent dark:border-gray-800"
                >
                    <Edit2 className="w-5 h-5" />
                    Editar
                </Link>
            )}

            <button
                onClick={() => window.print()}
                className="flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-medium transition-all bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:text-gray-900 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700 dark:hover:bg-gray-700"
            >
                <FileText className="w-5 h-5" />
                Ficha PDF
            </button>

            {isLoggedIn && (
                <div className="inline-block">
                    <AddToCollectionButton instrumentId={instrumentId} />
                </div>
            )}
        </div>
    );
}
