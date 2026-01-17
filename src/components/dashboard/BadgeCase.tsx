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
                            <div className={cn(
                                "w-12 h-12 rounded-full flex items-center justify-center mb-3 text-white shadow-md relative z-10",
                                isUnlocked ? badge.color.replace('text-', 'bg-').replace('bg-', 'placeholder:') + " shadow-" + badge.color.split(' ')[0] : "bg-gray-200 dark:bg-white/10"
                            )}>
                                {/* Just using raw color logic or hardcoded classes for simplicity in this MVP */}
                                <div className={cn(
                                    "w-12 h-12 rounded-full flex items-center justify-center text-xl",
                                    isUnlocked ? badge.color : "text-gray-400"
                                )}>
                                    <Icon size={24} />
                                </div>
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
