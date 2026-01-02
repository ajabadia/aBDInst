'use client';

import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import Link from 'next/link';
import { UserPlus, MessageSquare, Reply, AlertCircle, Heart } from 'lucide-react';
import { markAsRead } from '@/actions/notifications';
import { useRouter } from 'next/navigation';

interface NotificationItemProps {
    notification: any;
    onClose?: () => void;
}

export default function NotificationItem({ notification, onClose }: NotificationItemProps) {
    const router = useRouter();
    const { type, data, createdAt, read, _id } = notification;

    const handleClick = async () => {
        if (!read) {
            await markAsRead(_id);
            router.refresh();
        }
        if (onClose) onClose();
    };

    let Icon = AlertCircle;
    let colorClass = 'text-gray-500 bg-gray-100 dark:bg-gray-800';
    let content = null;
    let href = '#';

    switch (type) {
        case 'follow':
            Icon = UserPlus;
            colorClass = 'text-purple-600 bg-purple-100 dark:bg-purple-900/30 dark:text-purple-400';
            href = `/profile/${data.actorId}`;
            content = (
                <span>
                    <span className="font-bold">{data.actorName}</span> te ha empezado a seguir.
                </span>
            );
            break;
        case 'comment':
            Icon = MessageSquare;
            colorClass = 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400';
            href = `/instruments/${data.instrumentId}#comments`;
            content = (
                <span>
                    <span className="font-bold">{data.actorName}</span> comentó en <span className="font-bold">{data.instrumentName}</span>.
                </span>
            );
            break;
        case 'reply':
            Icon = Reply;
            colorClass = 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400';
            href = `/instruments/${data.instrumentId}#comments`;
            content = (
                <span>
                    <span className="font-bold">{data.actorName}</span> respondió a tu comentario en <span className="font-bold">{data.instrumentName}</span>.
                </span>
            );
            break;
        case 'wishlist_match':
            Icon = Heart;
            colorClass = 'text-pink-600 bg-pink-100 dark:bg-pink-900/30 dark:text-pink-400';
            href = `/instruments/${data.instrumentId}`;
            content = (
                <span>
                    ¡Un instrumento de tu wishlist (<span className="font-bold">{data.instrumentName}</span>) ha aparecido en el mercado!
                </span>
            );
            break;
        default:
            content = "Tienes una nueva notificación.";
    }

    return (
        <Link
            href={href}
            onClick={handleClick}
            className={`flex gap-3 p-3 rounded-xl transition-all hover:bg-gray-50 dark:hover:bg-gray-800 ${!read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}
        >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                <Icon size={18} />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900 dark:text-gray-200 leading-snug">
                    {content}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                    {formatDistanceToNow(new Date(createdAt), { addSuffix: true, locale: es })}
                </p>
            </div>
            {!read && (
                <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
            )}
        </Link>
    );
}
