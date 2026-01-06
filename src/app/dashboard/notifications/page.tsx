import { getNotifications, markAllAsRead } from "@/actions/notifications";
import NotificationList from "@/components/notifications/NotificationList";
import { Bell, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { revalidatePath } from "next/cache";

export default async function NotificationsPage() {
    const { success, data } = await getNotifications(50);
    const notifications = success ? data : [];

    async function handleMarkAll() {
        'use server';
        await markAllAsRead();
        revalidatePath('/dashboard/notifications');
    }

    return (
        <div className="max-w-7xl mx-auto px-6 py-12 lg:py-20 space-y-12">
            {/* Header Section */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-ios-blue/10 text-ios-blue rounded-xl shadow-sm">
                            <Bell className="w-6 h-6" />
                        </div>
                        <h1 className="text-4xl font-bold tracking-tight">Notificaciones</h1>
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 font-medium ml-1">
                        Mantente al día con la actividad de tu colección y comunidad.
                    </p>
                </div>

                {notifications.some(n => !n.read) && (
                    <form action={handleMarkAll}>
                        <Button variant="secondary" size="sm" icon={<CheckCircle2 />}>
                            Marcar todo como leído
                        </Button>
                    </form>
                )}
            </header>

            <div className="glass-panel rounded-[2.5rem] overflow-hidden shadow-apple-lg border-black/5 dark:border-white/5">
                <div className="p-2">
                    <NotificationList notifications={notifications} />
                </div>
            </div>
        </div>
    );
}
