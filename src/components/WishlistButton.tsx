'use client';

import { useState, useTransition } from 'react';
import { Heart } from 'lucide-react';
import { toast } from 'sonner';
import { toggleWishlist } from '@/actions/wishlist';
import { useRouter } from 'next/navigation';

interface WishlistButtonProps {
    instrumentId: string;
    initialInWishlist?: boolean;
    minimal?: boolean; // If true, shows only icon without text (for cards)
}

export default function WishlistButton({ instrumentId, initialInWishlist = false, minimal = false }: WishlistButtonProps) {
    const [inWishlist, setInWishlist] = useState(initialInWishlist);
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const handleToggle = (e: React.MouseEvent) => {
        e.preventDefault(); // Prevent navigating to instrument detail if inside a link
        e.stopPropagation();

        startTransition(async () => {
            // Optimistic update
            setInWishlist((prev) => !prev);

            const result = await toggleWishlist(instrumentId);

            if (!result.success) {
                // Revert on error
                setInWishlist((prev) => !prev);
                toast.error(result.error || 'Error al actualizar wishlist');
            } else {
                toast.success(result.action === 'added' ? 'Añadido a tu wishlist' : 'Eliminado de tu wishlist');
                router.refresh();
            }
        });
    };

    if (minimal) {
        return (
            <button
                onClick={handleToggle}
                disabled={isPending}
                className={`p-2 rounded-full transition-all ${inWishlist
                    ? 'text-red-500 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30'
                    : 'text-gray-400 hover:text-red-500 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                title={inWishlist ? "Quitar de wishlist" : "Añadir a wishlist"}
            >
                <Heart className={`w-5 h-5 ${inWishlist ? 'fill-current' : ''}`} />
            </button>
        );
    }

    return (
        <button
            onClick={handleToggle}
            disabled={isPending}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all shadow-sm ${inWishlist
                ? 'bg-pink-50 text-pink-600 border border-pink-100 hover:bg-pink-100 dark:bg-pink-900/20 dark:text-pink-400 dark:border-pink-900/30'
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:text-gray-900 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700 dark:hover:bg-gray-700'
                }`}
        >
            <Heart className={`w-5 h-5 ${inWishlist ? 'fill-current' : ''}`} />
            {inWishlist ? 'En Wishlist' : 'Añadir a Wishlist'}
        </button>
    );
}
