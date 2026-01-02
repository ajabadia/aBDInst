'use client';

import { useState, useRef, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { getUnreadNotificationsCount, getNotifications, markAllAsRead } from '@/actions/notifications';
import NotificationList from './NotificationList';
import { usePathname } from 'next/navigation';

export default function NotificationBell() {
    const [isOpen, setIsOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [notifications, setNotifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const pathname = usePathname();

    // Fetch count on mount and periodically? 
    // For now, just on mount and pathname change (revalidation)
    useEffect(() => {
        const fetchCount = async () => {
            const count = await getUnreadNotificationsCount();
            setUnreadCount(count);
        };
        fetchCount();

        // Polling every 60s
        const interval = setInterval(fetchCount, 60000);
        return () => clearInterval(interval);
    }, [pathname]);

    // Close on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleToggle = async () => {
        if (!isOpen) {
            setIsOpen(true);
            setLoading(true);
            const { success, data } = await getNotifications();
            if (success) {
                setNotifications(data);
            }
            setLoading(false);
        } else {
            setIsOpen(false);
        }
    };

    const handleMarkAllRead = async () => {
        await markAllAsRead();
        setUnreadCount(0);
        // Optimistically update list
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    return (
        <div className="relative" ref={wrapperRef}>
            <button
                onClick={handleToggle}
                className="relative p-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-black" />
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white dark:bg-gray-900 rounded-2xl shadow-xl ring-1 ring-black ring-opacity-5 z-50 overflow-hidden animate-in fade-in zoom-in-95">
                    <div className="p-3 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-900">
                        <h3 className="font-semibold text-gray-900 dark:text-white pl-1">Notificaciones</h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={handleMarkAllRead}
                                className="text-xs font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400"
                            >
                                Marcar leídas
                            </button>
                        )}
                    </div>

                    <div className="max-h-[70vh] overflow-y-auto p-2">
                        {loading ? (
                            <div className="p-4 text-center text-gray-400 text-sm">Cargando...</div>
                        ) : (
                            <NotificationList notifications={notifications} onClose={() => setIsOpen(false)} />
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
