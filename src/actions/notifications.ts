'use server';

import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import Notification from "@/models/Notification";
import { revalidatePath } from "next/cache";

// --- INTERNAL HELPERS (Called by other actions) ---

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
