'use server';

import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import Notification from "@/models/Notification";
import Reminder from "@/models/Reminder";
import { revalidatePath } from "next/cache";

/**
 * Optimized check for due reminders.
 * Instead of checking one by one in a loop, it uses bulk operations.
 */
async function checkDueReminders(userId: string) {
    try {
        const now = new Date();

        // 1. Find all due reminders that aren't completed
        const dueReminders = await Reminder.find({
            userId,
            isCompleted: false,
            dueDate: { $lte: now }
        }).lean();

        if (dueReminders.length === 0) return;

        // 2. Find which of these already have a notification to avoid duplicates
        // We only care about 'maintenance' type notifications for these reminder IDs
        const reminderIds = dueReminders.map(r => r._id);
        const existingNotifications = await Notification.find({
            userId,
            type: 'maintenance',
            'data.reminderId': { $in: reminderIds }
        }).select('data.reminderId').lean();

        const alreadyNotifiedIds = new Set(existingNotifications.map(n => n.data.reminderId.toString()));

        // 3. Filter reminders that haven't been notified yet
        const toNotify = dueReminders.filter(r => !alreadyNotifiedIds.has(r._id.toString()));

        if (toNotify.length > 0) {
            const newNotifications = toNotify.map(reminder => ({
                userId,
                type: 'maintenance',
                data: {
                    reminderId: reminder._id,
                    instrumentId: reminder.instrumentId,
                    title: reminder.title,
                    description: reminder.description
                },
                read: false
            }));

            await Notification.insertMany(newNotifications);
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
    } catch (error) {
        console.error("Error creating notification:", error);
    }
}

// --- PUBLIC ACTIONS ---

export async function getUnreadNotificationsCount() {
    try {
        const session = await auth();
        const userId = session?.user?.id;
        if (!userId) return 0;

        await dbConnect();
        
        // Lazy processing of maintenance reminders
        await checkDueReminders(userId);

        const count = await Notification.countDocuments({
            userId,
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
        const userId = session?.user?.id;
        if (!userId) return { success: false, data: [] };

        await dbConnect();
        const notifications = await Notification.find({ userId })
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
        const userId = session?.user?.id;
        if (!userId) return { success: false };

        await dbConnect();
        await Notification.findOneAndUpdate(
            { _id: notificationId, userId }, 
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
        const userId = session?.user?.id;
        if (!userId) return { success: false };

        await dbConnect();
        await Notification.updateMany(
            { userId, read: false },
            { read: true }
        );

        revalidatePath('/dashboard');
        return { success: true };
    } catch (error) {
        return { success: false };
    }
}
