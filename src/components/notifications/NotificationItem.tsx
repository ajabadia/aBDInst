'use client';

import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import Link from 'next/link';
import { UserPlus, MessageSquare, Reply, AlertCircle, Heart, Mail, Bell, ShieldCheck } from 'lucide-react';
import { markAsRead } from '@/actions/notifications';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

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

    // Mapping notification types to Apple-style visuals
    const configs: Record<string, { icon: any, color: string, bg: string, href: string }> = {
        follow: {
            icon: UserPlus,
            color: 'text-ios-indigo',
            bg: 'bg-ios-indigo/10',
            href: `/profile/${data.actorId}`
        },
        comment: {
            icon: MessageSquare,
            color: 'text-ios-blue',
            bg: 'bg-ios-blue/10',
            href: `/instruments/${data.instrumentId}#comments`
        },
        reply: {
            icon: Reply,
            color: 'text-ios-green',
            bg: 'bg-ios-green/10',
            href: `/instruments/${data.instrumentId}#comments`
        },
        wishlist_match: {
            icon: Heart,
            color: 'text-ios-pink',
            bg: 'bg-ios-pink/10',
            href: `/instruments/${data.instrumentId}`
        },
        contact_request: {
            icon: Mail,
            color: 'text-ios-orange',
            bg: 'bg-ios-orange/10',
            href: `/dashboard/admin/contacts/${data.requestId}`
        },
        contact_reply: {
            icon: Reply,
            color: 'text-ios-green',
            bg: 'bg-ios-green/10',
            href: `/dashboard/requests/${data.requestId}`
        },
        maintenance: {
            icon: ShieldCheck,
            color: 'text-ios-orange',
            bg: 'bg-ios-orange/10',
            href: `/dashboard/collection/${data.instrumentId}`
        }
    };

    const config = configs[type] || {
        icon: Bell,
        color: 'text-gray-500',
        bg: 'bg-gray-100',
        href: '#'
    };

    const Icon = config.icon;

    return (
        <Link
            href={config.href}
            onClick={handleClick}
            className={cn(
                "flex gap-5 p-5 rounded-[1.5rem] transition-all duration-300 group",
                !read
                    ? "bg-ios-blue/[0.03] dark:bg-white/[0.02] border-l-4 border-ios-blue shadow-sm"
                    : "hover:bg-black/[0.02] dark:hover:bg-white/[0.02]"
            )}
        >
            <div className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110",
                config.bg,
                config.color
            )}>
                <Icon size={22} className="stroke-[2.2]" />
            </div>

            <div className="flex-1 min-w-0 space-y-1">
                <p className="text-[15px] text-gray-900 dark:text-gray-200 leading-snug font-medium">
                    {type === 'follow' && (<span><span className="font-bold">{data.actorName}</span> te ha empezado a seguir.</span>)}
                    {type === 'comment' && (<span><span className="font-bold">{data.actorName}</span> comentó en <span className="font-bold">{data.instrumentName}</span>.</span>)}
                    {type === 'reply' && (<span><span className="font-bold">{data.actorName}</span> respondió a tu comentario.</span>)}
                    {type === 'wishlist_match' && (<span>¡Oportunidad! <span className="font-bold">{data.instrumentName}</span> está disponible.</span>)}
                    {type === 'contact_request' && (<span>Consulta de <span className="font-bold">{data.senderName}</span>: {data.subject}</span>)}
                    {type === 'contact_reply' && (<span>Nueva respuesta a tu consulta: <span className="font-bold">{data.subject}</span></span>)}
                    {type === 'maintenance' && (<span>Revisión técnica pendiente para <span className="font-bold">{data.title}</span>.</span>)}
                    {!configs[type] && "Tienes una nueva actualización en tu sistema."}
                </p>
                <div className="flex items-center gap-3">
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                        {formatDistanceToNow(new Date(createdAt), { addSuffix: true, locale: es })}
                    </p>
                    {!read && (
                        <span className="px-1.5 py-0.5 bg-ios-blue text-white text-[9px] font-black rounded uppercase tracking-tighter shadow-sm">Nuevo</span>
                    )}
                </div>
            </div>
        </Link>
    );
}
