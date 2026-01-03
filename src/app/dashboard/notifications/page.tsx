import { getNotifications } from "@/actions/notifications";
import NotificationList from "@/components/notifications/NotificationList";
import { Bell } from "lucide-react";

export default async function NotificationsPage() {
    const { success, data } = await getNotifications(50); // Fetch more (50) for history page
    const notifications = success ? data : [];

    return (
        <div className="container mx-auto px-6 py-12 max-w-4xl">
            <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/20 text-blue-600 rounded-xl">
                    <Bell size={24} />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Notificaciones</h1>
                    <p className="text-gray-500">Historial de alertas y actividad</p>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
                {/* Reusing existing list, client component handles interactivity */}
                <NotificationList notifications={notifications} />
            </div>
        </div>
    );
}
