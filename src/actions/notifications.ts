'use server';

import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import Notification from "@/models/Notification";
import Reminder from "@/models/Reminder";
import { revalidatePath } from "next/cache";

// --- INTERNAL HELPERS (Called by other actions) ---

async function checkDueReminders(userId: string) {
    try {
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        // Find due reminders
        const dueReminders = await Reminder.find({
            userId,
            isCompleted: false,
            dueDate: { $lte: now }
        });

        for (const reminder of dueReminders) {
            // Check if we already notified about this specific reminder recently (e.g., today)
            // Or simple logic: check if there is a 'maintenance' notification for this instrument/reminder that is unread?
            // Better: Checks if we have created a notification for this reminder ID ever.

            const alreadyNotified = await Notification.exists({
                userId,
                type: 'maintenance',
                'data.reminderId': reminder._id
            });

            if (!alreadyNotified) {
                await Notification.create({
                    userId,
                    type: 'maintenance',
                    data: {
                        reminderId: reminder._id,
                        instrumentId: reminder.instrumentId,
                        title: reminder.title,
                        description: reminder.description
                    },
                    read: false
                });
            }
        }
    } catch (error) {
        console.error("Error checking reminders:", error);
    }
}

export async function createNotification(userId: string, type: string, data: any) {
    try {
        await dbConnect();
        await Notification.create({
            userId,
            type,
            data,
            read: false
        });
        // We can't revalidatePath specific user sessions easily from here without Websockets/Vapid
        // But the next time they fetch/navigate, it will show.
    } catch (error) {
        console.error("Error creating notification:", error);
    }
}

// --- PUBLIC ACTIONS ---

export async function getUnreadNotificationsCount() {
    try {
        const session = await auth();
        if (!session?.user) return 0;

        await dbConnect();

        // Lazy check: process reminders whenever the user checks notifications
        await checkDueReminders((session.user as any).id);

        const count = await Notification.countDocuments({
            userId: (session.user as any).id,
            read: false
        });

        return count;
    } catch (error) {
        return 0;
    }
}

export async function getNotifications(limit = 10) {
    try {
        const session = await auth();
        if (!session?.user) return { success: false, data: [] };

        await dbConnect();
        const notifications = await Notification.find({ userId: (session.user as any).id })
            .sort({ createdAt: -1 })
            .limit(limit)
            .lean();

        return { success: true, data: JSON.parse(JSON.stringify(notifications)) };
    } catch (error) {
        return { success: false, error: "Error fetching notifications" };
    }
}

export async function markAsRead(notificationId: string) {
    try {
        const session = await auth();
        if (!session?.user) return { success: false };

        await dbConnect();
        await Notification.findOneAndUpdate(
            { _id: notificationId, userId: (session.user as any).id }, // Ensure ownership
            { read: true }
        );

        revalidatePath('/dashboard');
        return { success: true };
    } catch (error) {
        return { success: false };
    }
}

export async function markAllAsRead() {
    try {
        const session = await auth();
        if (!session?.user) return { success: false };

        await dbConnect();
        await Notification.updateMany(
            { userId: (session.user as any).id, read: false },
            { read: true }
        );

        revalidatePath('/dashboard');
        return { success: true };
    } catch (error) {
        return { success: false };
    }
}
