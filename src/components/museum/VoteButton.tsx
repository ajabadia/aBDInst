'use client';

import { useState } from 'react';
import { Heart } from 'lucide-react';
import { voteForSubmission } from '@/actions/showroom';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function VoteButton({ submissionId, initialVotes, initialHasVoted }: any) {
    const [votes, setVotes] = useState(initialVotes || 0);
    const [hasVoted, setHasVoted] = useState(initialHasVoted);
    const [loading, setLoading] = useState(false);

    const handleVote = async (e: any) => {
        e.preventDefault(); // Prevent link navigation if inside a Link
        e.stopPropagation();

        if (hasVoted || loading) return;

        setLoading(true);
        // Optimistic
        setVotes((prev: number) => prev + 1);
        setHasVoted(true);

        const res = await voteForSubmission(submissionId);

        if (!res.success) {
            // Revert
            setVotes((prev: number) => prev - 1);
            setHasVoted(false);
            if (res.error !== 'Already voted') toast.error("Error al votar");
        }
        setLoading(false);
    };

    return (
        <button
            onClick={handleVote}
            className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all backdrop-blur-md",
                hasVoted
                    ? "bg-red-500 text-white shadow-lg shadow-red-500/30"
                    : "bg-white/10 text-white hover:bg-white/20 hover:scale-105"
            )}
            disabled={hasVoted}
        >
            <Heart size={14} className={cn(hasVoted ? "fill-current" : "")} />
            {votes}
        </button>
    );
}
