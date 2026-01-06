'use server';

import dbConnect from '@/lib/db';
import Comment from '@/models/Comment';
import Notification from '@/models/Notification';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';

/* --- COMMENTS --- */

export async function getComments(instrumentId: string) {
    try {
        await dbConnect();
        const comments = await Comment.find({ instrumentId, isDeleted: false })
            .populate('userId', 'name image role')
            .sort({ createdAt: -1 })
            .lean();
        return { success: true, data: JSON.parse(JSON.stringify(comments)) };
    } catch (error) {
        return { success: false, data: [] };
    }
}

/* --- NOTIFICATIONS --- */

export async function getNotifications(limit = 10) {
    try {
        const session = await auth();
        if (!session?.user?.id) return { success: false, data: [] };
        await dbConnect();

        const notifications = await Notification.find({ userId: session.user.id })
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
        if (!session?.user?.id) return { success: false };
        await dbConnect();

        await Notification.findOneAndUpdate(
            { _id: notificationId, userId: session.user.id },
            { read: true }
        );

        revalidatePath('/dashboard');
        return { success: true };
    } catch (error) {
        return { success: false };
    }
}

/* --- CONTACT REQUESTS --- */

export async function getUserContactRequests() {
    try {
        const session = await auth();
        if (!session?.user?.id) return [];
        await dbConnect();
        
        // Dynamic import to avoid cycles if necessary
        const ContactRequest = (await import('@/models/ContactRequest')).default;
        
        const requests = await ContactRequest.find({ 'sender.userId': session.user.id })
            .sort({ updatedAt: -1 })
            .lean();
            
        return JSON.parse(JSON.stringify(requests));
    } catch (error) {
        return [];
    }
}
