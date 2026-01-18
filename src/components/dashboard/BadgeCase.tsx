import { BADGES } from '@/lib/gamification';
import { cn } from '@/lib/utils';
import { Lock } from 'lucide-react';

export default function BadgeCase({ badges }: { badges?: any[] }) {
    // Flatten acquired IDs
    const acquiredIds = new Set(badges?.map(b => b.id) || []);

    return (
        <div className="bg-white dark:bg-white/5 rounded-2xl p-6 border border-gray-100 dark:border-white/5 space-y-4">
            <h3 className="text-lg font-bold flex items-center gap-2">
                Logros
                <span className="text-xs bg-black/5 dark:bg-white/10 px-2 py-0.5 rounded-full text-gray-500">
                    {acquiredIds.size} / {Object.keys(BADGES).length}
                </span>
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.values(BADGES).map((badge) => {
                    const isUnlocked = acquiredIds.has(badge.id);
                    const Icon = badge.icon;

                    return (
                        <div key={badge.id}
                            className={cn(
                                "flex flex-col items-center text-center p-4 rounded-xl border transition-all relative overflow-hidden",
                                isUnlocked
                                    ? "bg-gradient-to-br from-white to-gray-50 dark:from-white/5 dark:to-transparent border-black/5 dark:border-white/10 shadow-sm"
                                    : "bg-gray-50 dark:bg-black/20 border-transparent opacity-60 grayscale"
                            )}
                        >
                            <div className="relative w-16 h-16 mb-2 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                {/* Base Image (Custom or Placeholder) */}
                                <img
                                    src={badge.imageUrl || '/images/badges/badge-placeholder.png'}
                                    alt={badge.name}
                                    className={cn(
                                        "w-full h-full object-contain drop-shadow-md",
                                        !isUnlocked && "grayscale opacity-50 contrast-125" // Gray look for locked
                                    )}
                                />

                                {/* Overlay Icon (Only if using placeholder, to differentiate badges) */}
                                {!badge.imageUrl && (
                                    <div className={cn(
                                        "absolute inset-0 flex items-center justify-center",
                                        isUnlocked ? "text-gray-600 dark:text-gray-300" : "text-gray-400 opacity-50"
                                    )}>
                                        <Icon size={20} />
                                    </div>
                                )}
                            </div>

                            {!isUnlocked && <Lock size={12} className="absolute top-3 right-3 text-gray-300" />}

                            <span className="text-xs font-bold leading-tight mb-1">{badge.label}</span>
                            <span className="text-[10px] text-gray-400 hidden group-hover:block transition-all">{badge.description}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
