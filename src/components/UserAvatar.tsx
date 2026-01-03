'use client';

import { useState } from 'react';
import Image from 'next/image';
import { User } from 'lucide-react';

interface UserAvatarProps {
    user: {
        name?: string | null;
        image?: string | null;
        email?: string | null;
    };
    size?: number; // pixel size (e.g., 40)
    className?: string; // Additional classes
}

export default function UserAvatar({ user, size = 40, className = '' }: UserAvatarProps) {
    const [imageError, setImageError] = useState(false);

    // Determines the size class for the container if needed, 
    // but usually size is handled by the parent or inline style for specific pixel needs.
    // We'll use the size prop to determine layout dimensions.

    const fallbackUrl = `https://source.boringavatars.com/beam/${size}/${encodeURIComponent(user?.name || user?.email || 'User')}?colors=264653,2a9d8f,e9c46a,f4a261,e76f51`;

    const imageSrc = (user?.image && !imageError) ? user.image : fallbackUrl;

    // Check if it's the specific "default google" or similar generic that we want to override? 
    // For now we trust user.image unless it fails.

    return (
        <div
            className={`relative rounded-full overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-gray-800 border border-white dark:border-gray-800 shadow-sm ${className}`}
            style={{ width: size, height: size }}
        >
            <Image
                src={imageSrc}
                alt={user?.name || 'User Avatar'}
                fill
                className="object-cover"
                onError={() => setImageError(true)}
                unoptimized={true} // Bypass Next.js optimization to ensure external images load reliably inside the app
            />
        </div>
    );
}
