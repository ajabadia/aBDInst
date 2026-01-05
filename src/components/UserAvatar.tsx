'use client';

import { useState } from 'react';
import Image from 'next/image';

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

    // Generate initials for fallback
    const initials = (user?.name || user?.email || 'U').substring(0, 2).toUpperCase();

    // If we have a valid image and no error, show it.
    const showImage = user?.image && !imageError;

    return (
        <div
            className={`relative rounded-full overflow-hidden flex-shrink-0 bg-gradient-to-br from-blue-500 to-purple-600 border border-white dark:border-gray-800 shadow-sm flex items-center justify-center ${className}`}
            style={{ width: size, height: size }}
        >
            {showImage ? (
                <Image
                    src={user.image!}
                    alt={user?.name || 'User Avatar'}
                    fill
                    className="object-cover"
                    onError={() => setImageError(true)}
                    unoptimized={true}
                />
            ) : (
                <span className="font-bold text-white leading-none overflow-hidden" style={{ fontSize: size * 0.4 }}>
                    {initials}
                </span>
            )}
        </div>
    );
}
