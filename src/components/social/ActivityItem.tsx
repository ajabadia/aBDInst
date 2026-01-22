'use client';

import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import Link from 'next/link';
import Image from 'next/image';
import {
    Radio, Heart, MessageSquare,
    UserPlus, Star, ThumbsUp,
    MessageCircle, MoreHorizontal
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface ActivityItemProps {
    activity: any;
    compact?: boolean;
}

/**
 * Enhanced Activity Item with community micro-interactions.
 */
export default function ActivityItem({ activity, compact = false }: ActivityItemProps) {
    const { userId: actor, type, data, createdAt } = activity;
    const [isLiked, setIsLiked] = useState(false);

    const TimeAgo = () => (
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            {formatDistanceToNow(new Date(createdAt), { addSuffix: true, locale: es })}
        </span>
    );

    const Avatar = () => (
        <div className="relative group">
            <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-white/5 overflow-hidden flex-shrink-0 border border-black/5 dark:border-white/10 shadow-sm group-hover:shadow-md transition-all">
                {actor.image ? (
                    <Image src={actor.image} alt={actor.name} width={48} height={48} className="object-cover" />
                ) : (
                    <div className="flex items-center justify-center w-full h-full font-bold text-ios-blue bg-ios-blue/10">{actor.name?.[0]}</div>
                )}
            </div>
        </div>
    );

    let Icon = Star;
    let colorClass = "bg-gray-100 text-gray-400";
    let content = null;

    switch (type) {
        case 'add_collection':
            Icon = Radio;
            colorClass = "bg-ios-blue/10 text-ios-blue";
            content = (
                <>
                    añadió <Link href={`/instruments/${data.instrumentId}`} className="font-bold text-gray-900 dark:text-white hover:text-ios-blue transition-colors">{data.instrumentName}</Link> a su colección principal.
                </>
            );
            break;
        case 'add_wishlist':
            Icon = Heart;
            colorClass = "bg-ios-red/10 text-ios-red";
            content = (
                <>
                    añadió <Link href={`/instruments/${data.instrumentId}`} className="font-bold text-gray-900 dark:text-white hover:text-ios-red transition-colors">{data.instrumentName}</Link> a su lista de deseos.
                </>
            );
            break;
        case 'comment':
            Icon = MessageSquare;
            colorClass = "bg-ios-green/10 text-ios-green";
            content = (
                <>
                    escribió una reseña sobre <Link href={`/instruments/${data.instrumentId}#comments`} className="font-bold text-gray-900 dark:text-white hover:text-ios-green transition-colors">{data.instrumentName}</Link>.
                </>
            );
            break;
        case 'follow':
            Icon = UserPlus;
            colorClass = "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400";
            content = (
                <>
                    ha comenzado a seguir a un nuevo coleccionista.
                </>
            );
            break;
        default:
            content = "ha actualizado su actividad.";
    }

    return (
        <div className="group relative flex gap-5 p-5 bg-white dark:bg-zinc-900/40 border border-black/5 dark:border-white/5 rounded-3xl shadow-sm hover:shadow-apple-md transition-all">
            <Avatar />

            <div className="flex-1 space-y-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Link href={`/profile/${actor._id}`} className="font-bold text-[15px] text-gray-900 dark:text-white hover:underline decoration-ios-blue decoration-2 underline-offset-4">
                            {actor.name}
                        </Link>
                        <TimeAgo />
                    </div>
                    <button className="text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
                        <MoreHorizontal size={18} />
                    </button>
                </div>

                <div className="text-[14px] text-gray-600 dark:text-gray-300 leading-relaxed">
                    {content}
                </div>

                {/* Micro-Interactions */}
                {!compact && (
                    <div className="flex items-center gap-6 pt-1">
                        <button
                            onClick={() => setIsLiked(!isLiked)}
                            className={cn(
                                "flex items-center gap-1.5 text-xs font-bold transition-all hover:scale-105",
                                isLiked ? "text-ios-red" : "text-gray-400 hover:text-ios-red"
                            )}
                        >
                            <ThumbsUp size={14} className={isLiked ? "fill-current" : ""} />
                            {isLiked ? 'Me gusta' : 'Inspirador'}
                        </button>

                        <button className="flex items-center gap-1.5 text-xs font-bold text-gray-400 hover:text-ios-blue transition-all hover:scale-105">
                            <MessageCircle size={14} />
                            Comentar
                        </button>
                    </div>
                )}
            </div>

            <div className={cn(
                "p-2.5 rounded-2xl h-fit flex-shrink-0 shadow-sm border border-black/5",
                colorClass
            )}>
                <Icon size={18} />
            </div>
        </div>
    );
}
