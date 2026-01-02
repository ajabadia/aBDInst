'use client';

import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import Link from 'next/link';
import Image from 'next/image'; // Assuming we put avatars later
import { Radio, Heart, MessageSquare, UserPlus, Star } from 'lucide-react';

interface ActivityItemProps {
    activity: any;
}

export default function ActivityItem({ activity }: ActivityItemProps) {
    const { userId: actor, type, data, createdAt } = activity;

    const TimeAgo = () => (
        <span className="text-xs text-gray-400">
            {formatDistanceToNow(new Date(createdAt), { addSuffix: true, locale: es })}
        </span>
    );

    const Avatar = () => (
        <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden flex-shrink-0 border border-gray-100 dark:border-gray-800">
            {actor.image ? (
                <Image src={actor.image} alt={actor.name} width={40} height={40} className="object-cover" />
            ) : (
                <div className="flex items-center justify-center w-full h-full font-bold text-gray-500">{actor.name?.[0]}</div>
            )}
        </div>
    );

    let Icon = Star;
    let colorClass = "bg-gray-100 text-gray-600";
    let content = null;

    switch (type) {
        case 'add_collection':
            Icon = Radio;
            colorClass = "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400";
            content = (
                <>
                    añadió <Link href={`/instruments/${data.instrumentId}`} className="font-bold hover:underline">{data.instrumentName}</Link> a su colección.
                </>
            );
            break;
        case 'add_wishlist':
            Icon = Heart;
            colorClass = "bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400";
            content = (
                <>
                    desea tener <Link href={`/instruments/${data.instrumentId}`} className="font-bold hover:underline">{data.instrumentName}</Link>.
                </>
            );
            break;
        case 'comment':
            Icon = MessageSquare;
            colorClass = "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400";
            content = (
                <>
                    comentó en <Link href={`/instruments/${data.instrumentId}#comments`} className="font-bold hover:underline">{data.instrumentName}</Link>.
                </>
            );
            break;
        case 'follow':
            Icon = UserPlus;
            colorClass = "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400";
            content = (
                <>
                    empezó a seguir a otro coleccionista.
                </>
            );
            break;
        default:
            content = "hizo algo.";
    }

    return (
        <div className="flex gap-4 p-4 bg-white dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700/50 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
            <Avatar />
            <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                    <Link href={`/profile/${actor._id}`} className="font-bold text-gray-900 dark:text-white hover:underline">
                        {actor.name}
                    </Link>
                    <TimeAgo />
                </div>
                <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                    {content}
                </p>
            </div>
            <div className={`p-2 rounded-full h-fit flex-shrink-0 ${colorClass}`}>
                <Icon size={16} />
            </div>
        </div>
    );
}
