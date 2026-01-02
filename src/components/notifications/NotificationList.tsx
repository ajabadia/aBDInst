'use client';

import NotificationItem from './NotificationItem';
import { BellOff } from 'lucide-react';

interface NotificationListProps {
    notifications: any[];
    onClose?: () => void;
}

export default function NotificationList({ notifications, onClose }: NotificationListProps) {
    if (!notifications || notifications.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-8 text-center text-gray-400">
                <BellOff size={24} className="mb-2 opacity-50" />
                <p className="text-sm">No tienes notificaciones</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-1">
            {notifications.map((notif) => (
                <NotificationItem key={notif._id} notification={notif} onClose={onClose} />
            ))}
        </div>
    );
}
