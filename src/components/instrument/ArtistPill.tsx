
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Users, X } from 'lucide-react';

export interface ArtistPillProps {
    artist: {
        _id: string;
        name: string;
        key: string;
        assetUrl?: string;
        yearsUsed?: string;
        notes?: string;
    };
    isEditing?: boolean;
    onRemove?: () => void;
}

export default function ArtistPill({
    artist,
    isEditing = false,
    onRemove
}: ArtistPillProps) {
    const Content = (
        <div className="flex items-center gap-3 px-4 py-2.5 bg-white dark:bg-gray-800 rounded-full border border-purple-100 dark:border-purple-900/30 hover:border-purple-300 dark:hover:border-purple-700 transition-all cursor-pointer shadow-sm hover:shadow-md">
            <div className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center overflow-hidden">
                {artist.assetUrl ? (
                    <img
                        src={artist.assetUrl}
                        alt={artist.name}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <Users className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                )}
            </div>
            <div className="flex flex-col">
                <span className="font-bold text-sm text-gray-900 dark:text-white leading-tight">
                    {artist.name}
                </span>
                {artist.yearsUsed && (
                    <span className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">
                        {artist.yearsUsed}
                    </span>
                )}
            </div>

            {isEditing && onRemove && (
                <button
                    onClick={(e) => {
                        e.preventDefault(); // Prevent navigation when clicking remove
                        e.stopPropagation();
                        onRemove();
                    }}
                    className="ml-1 -mr-1 p-1 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
                >
                    <X className="w-3.5 h-3.5" />
                </button>
            )}
        </div>
    );

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="group relative"
        >
            {isEditing ? (
                Content
            ) : (
                <Link href={`/artists/${artist.key}`}>
                    {Content}
                </Link>
            )}
        </motion.div>
    );
}
