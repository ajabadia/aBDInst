"use client";

import { Bell, BellOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { usePushNotifications } from "@/hooks/usePushNotifications";

export default function NotificationSettings() {
    const { isSupported, subscription, subscribeToPush, loading } = usePushNotifications();

    if (!isSupported) {
        return (
            <div className="p-4 rounded-xl bg-gray-100 dark:bg-white/5 text-sm text-gray-500 flex items-center gap-3">
                <BellOff size={18} />
                <span>Las notificaciones no son compatibles con este navegador.</span>
            </div>
        );
    }

    if (subscription) {
        return (
            <div className="p-6 rounded-2xl bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/20 text-green-700 dark:text-green-300 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                        <Bell size={20} className="text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                        <h4 className="font-bold">Notificaciones Activadas</h4>
                        <p className="text-xs opacity-80">Recibirás alertas sobre tu colección.</p>
                    </div>
                </div>
                {/* Unsubscribe logic could go here, but usually clearing browser settings is enough for mvp */}
                <span className="text-xs font-mono bg-white/50 px-2 py-1 rounded">Activo</span>
            </div>
        );
    }

    return (
        <div className="p-6 rounded-2xl bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <Bell size={20} className="text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                    <h4 className="font-bold text-gray-900 dark:text-white">Activar Notificaciones</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Mantente al día con novedades y alertas.</p>
                </div>
            </div>
            <Button
                onClick={subscribeToPush}
                className="bg-blue-600 hover:bg-blue-700 text-white"
                disabled={loading}
            >
                {loading ? <Loader2 size={16} className="animate-spin mr-2" /> : <Bell size={16} className="mr-2" />}
                Activar
            </Button>
        </div>
    );
}
