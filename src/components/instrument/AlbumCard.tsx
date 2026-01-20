
import { motion } from 'framer-motion';
import { Disc3, X } from 'lucide-react';

export interface AlbumCardProps {
    album: {
        _id: string;
        title: string;
        artist: string;
        year?: number;
        coverImage?: string;
        format?: string;
        isMaster?: boolean;
        masterId?: string;
        notes?: string;
    };
    isEditing?: boolean;
    onRemove?: () => void;
}

export default function AlbumCard({
    album,
    isEditing = false,
    onRemove
}: AlbumCardProps) {
    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="group relative"
        >
            <div className="apple-card p-3 bg-white dark:bg-gray-800 hover:shadow-xl transition-all h-full flex flex-col items-center text-center border-purple-50 dark:border-purple-900/10">
                {isEditing && onRemove && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onRemove();
                        }}
                        className="absolute -top-1 -right-1 z-20 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg border-2 border-white dark:border-gray-800"
                    >
                        <X className="w-3.5 h-3.5" />
                    </button>
                )}

                <div className="w-full aspect-square bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-xl mb-3 overflow-hidden shadow-inner group-hover:scale-[1.02] transition-transform duration-300">
                    {album.coverImage ? (
                        <img
                            src={album.coverImage}
                            alt={album.title}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center grayscale opacity-30">
                            <Disc3 className="w-10 h-10 text-gray-400" />
                        </div>
                    )}
                </div>

                <div className="w-full">
                    <h5 className="font-bold text-sm text-gray-900 dark:text-white truncate mb-0.5" title={album.title}>
                        {album.title}
                    </h5>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate font-semibold">
                        {album.artist}
                    </p>
                    <div className="flex items-center gap-1.5 justify-center mt-1.5">
                        {album.isMaster ? (
                            <span className="text-[9px] font-black bg-ios-blue/10 text-ios-blue px-1.5 py-0.5 rounded uppercase tracking-wider border border-ios-blue/10">
                                Master
                            </span>
                        ) : album.format && (
                            <span className="text-[9px] font-bold bg-black/5 dark:bg-white/5 text-gray-400 px-1.5 py-0.5 rounded uppercase tracking-tight">
                                {album.format}
                            </span>
                        )}
                        {album.year && (
                            <span className="text-[9px] text-gray-400 dark:text-gray-500 font-medium">
                                {album.year}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
