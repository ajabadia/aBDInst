'use client';

import { useState, useTransition } from 'react';
import { UserPlus, UserCheck, Loader2 } from 'lucide-react';
import { followUser, unfollowUser } from '@/actions/social';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface FollowButtonProps {
    targetUserId: string;
    targetUserName: string;
    isFollowing: boolean;
}

export default function FollowButton({ targetUserId, targetUserName, isFollowing }: FollowButtonProps) {
    const router = useRouter();
    const [following, setFollowing] = useState(isFollowing);
    const [isPending, startTransition] = useTransition();

    const handleToggle = () => {
        startTransition(async () => {
            const previousState = following;
            setFollowing(!following); // Optimistic UI

            const action = !previousState ? followUser : unfollowUser;
            const result = await action(targetUserId);

            if (!result.success) {
                setFollowing(previousState); // Revert
                toast.error(result.error);
            } else {
                toast.success(!previousState ? `Siguiendo a ${targetUserName}` : `Dejaste de seguir a ${targetUserName}`);
                router.refresh();
            }
        });
    };

    return (
        <button
            onClick={handleToggle}
            disabled={isPending}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all ${following
                    ? 'bg-gray-100 text-gray-700 hover:bg-red-50 hover:text-red-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-red-900/20 dark:hover:text-red-400'
                    : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/20'
                }`}
        >
            {isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
            ) : following ? (
                <UserCheck className="w-4 h-4" />
            ) : (
                <UserPlus className="w-4 h-4" />
            )}
            {following ? 'Siguiendo' : 'Seguir'}
        </button>
    );
}
