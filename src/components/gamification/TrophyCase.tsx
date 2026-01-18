'use client';

import { useEffect, useState } from 'react';
import { getUserBadges } from '@/actions/gamification';
import { Loader2, Lock, Trophy } from 'lucide-react';
import Image from 'next/image';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/Dialog'; // Assumption: Dialog exists or will fallback to simple modal

export default function TrophyCase({ userId }: { userId: string }) {
    const [badges, setBadges] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedBadge, setSelectedBadge] = useState<any>(null);

    useEffect(() => {
        getUserBadges(userId).then(data => {
            setBadges(data);
            setLoading(false);
        });
    }, [userId]);

    if (loading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-gray-400" /></div>;

    if (badges.length === 0) {
        return (
            <div className="text-center p-8 bg-gray-50 dark:bg-white/5 rounded-2xl border border-dashed border-gray-200 dark:border-white/10">
                <Trophy className="mx-auto mb-3 text-gray-300 dark:text-gray-600" size={32} />
                <p className="text-gray-500 font-medium">Aún no hay trofeos</p>
                <p className="text-xs text-gray-400 mt-1">Participa en la comunidad para ganar medallas</p>
            </div>
        );
    }

    return (
        <>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                {badges.map((badge) => (
                    <button
                        key={badge._id}
                        onClick={() => setSelectedBadge(badge)}
                        className="group relative aspect-square flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-white/5 dark:to-white/10 rounded-2xl p-4 border border-gray-200 dark:border-white/5 hover:border-blue-400/50 hover:shadow-lg dark:hover:border-blue-500/50 transition-all duration-300"
                    >
                        {badge.definition.imageUrl ? (
                            <div className="relative w-12 h-12 mb-2 transform group-hover:scale-110 transition-transform duration-300">
                                <Image
                                    src={badge.definition.imageUrl}
                                    alt={badge.definition.name}
                                    fill
                                    className="object-contain drop-shadow-md"
                                />
                            </div>
                        ) : (
                            <div className="w-12 h-12 mb-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-500 flex items-center justify-center transform group-hover:scale-110 transition-transform">
                                <Trophy size={20} />
                            </div>
                        )}
                        <span className="text-[10px] font-bold text-center leading-tight line-clamp-2 text-gray-600 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                            {badge.definition.name}
                        </span>

                        {/* Shine effect */}
                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-white/0 via-white/20 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                    </button>
                ))}
            </div>

            {/* Selection Modal */}
            {selectedBadge && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedBadge(null)}>
                    <div className="bg-white dark:bg-gray-900 rounded-3xl max-w-sm w-full p-8 relative overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>

                        {/* Background Glow */}
                        <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-blue-500/20 to-transparent pointer-events-none" />

                        <div className="relative flex flex-col items-center text-center">
                            <div className="w-32 h-32 mb-6 relative">
                                {selectedBadge.definition.imageUrl ? (
                                    <Image
                                        src={selectedBadge.definition.imageUrl}
                                        fill
                                        className="object-contain drop-shadow-2xl"
                                        alt={selectedBadge.definition.name}
                                    />
                                ) : (
                                    <div className="w-full h-full bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-500">
                                        <Trophy size={48} />
                                    </div>
                                )}
                            </div>

                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                {selectedBadge.definition.name}
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">
                                {selectedBadge.definition.description}
                            </p>

                            <div className="bg-gray-50 dark:bg-white/5 rounded-full px-4 py-1.5 text-xs font-mono text-gray-400">
                                Desbloqueado el {new Date(selectedBadge.unlockedAt || selectedBadge.createdAt).toLocaleDateString()}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
