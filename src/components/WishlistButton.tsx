'use client';

import { useState, useTransition } from 'react';
import { Heart } from 'lucide-react';
import { toast } from 'sonner';
import { toggleWishlist } from '@/actions/wishlist';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface WishlistButtonProps {
    instrumentId: string;
    initialInWishlist?: boolean;
    minimal?: boolean; 
}

export default function WishlistButton({ instrumentId, initialInWishlist = false, minimal = false }: WishlistButtonProps) {
    const [inWishlist, setInWishlist] = useState(initialInWishlist);
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const handleToggle = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        startTransition(async () => {
            setInWishlist((prev) => !prev);
            const result = await toggleWishlist(instrumentId);

            if (!result.success) {
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
            <Button
                variant="ghost"
                size="icon"
                onClick={handleToggle}
                isLoading={isPending}
                className={cn(
                    "rounded-full transition-colors",
                    inWishlist ? "text-ios-pink bg-ios-pink/10" : "text-gray-400"
                )}
                title={inWishlist ? "Quitar de wishlist" : "Añadir a wishlist"}
            >
                <Heart className={cn("w-5 h-5", inWishlist && "fill-current")} />
            </Button>
        );
    }

    return (
        <Button
            variant="secondary"
            onClick={handleToggle}
            isLoading={isPending}
            icon={Heart}
            className={cn(
                "transition-all duration-300",
                inWishlist && "bg-ios-pink/10 text-ios-pink border-ios-pink/20"
            )}
        >
            {inWishlist ? 'En Wishlist' : 'Wishlist'}
        </Button>
    );
}
