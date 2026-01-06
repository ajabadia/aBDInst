'use server';

import dbConnect from '@/lib/db';
import Comment from '@/models/Comment';
import Notification from '@/models/Notification';
import User from '@/models/User';
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
    } catch (error) { return { success: false, data: [] }; }
}

export async function postComment(instrumentId: string, content: string) {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: 'Unauthorized' };
    await dbConnect();
    const comment = await Comment.create({ instrumentId, userId: session.user.id, content });
    revalidatePath(`/instruments/${instrumentId}`);
    return { success: true, data: JSON.parse(JSON.stringify(comment)) };
}

export async function deleteOwnComment(commentId: string) {
    const session = await auth();
    await dbConnect();
    await Comment.findOneAndUpdate({ _id: commentId, userId: session?.user?.id }, { isDeleted: true });
    return { success: true };
}

/* --- SOCIAL & FEED --- */

export async function logActivity(type: string, data: any) {
    const session = await auth();
    if (!session?.user?.id) return;
    await dbConnect();
    // Logic to create Activity model entry (assuming model exists)
    const Activity = (await import('@/models/Activity')).default;
    await Activity.create({ userId: session.user.id, type, data });
}

export async function getUserFeed() {
    const session = await auth();
    if (!session?.user?.id) return { success: false, data: [] };
    await dbConnect();
    const Activity = (await import('@/models/Activity')).default;
    const activities = await Activity.find({}).sort({ createdAt: -1 }).limit(20).populate('userId', 'name image').lean();
    return { success: true, data: JSON.parse(JSON.stringify(activities)) };
}

export async function followUser(targetUserId: string) {
    const session = await auth();
    await dbConnect();
    await User.findByIdAndUpdate(session?.user?.id, { $addToSet: { following: targetUserId } });
    await User.findByIdAndUpdate(targetUserId, { $addToSet: { followers: session?.user?.id } });
    return { success: true };
}

export async function unfollowUser(targetUserId: string) {
    const session = await auth();
    await dbConnect();
    await User.findByIdAndUpdate(session?.user?.id, { $pull: { following: targetUserId } });
    await User.findByIdAndUpdate(targetUserId, { $pull: { followers: session?.user?.id } });
    return { success: true };
}

/* --- PUBLIC PROFILE --- */

export async function getPublicProfile(userId: string) {
    try {
        await dbConnect();
        const user = await User.findById(userId).select('name image bio location website followers following createdAt').lean();
        if (!user) return { success: false, error: "Perfil no encontrado" };
        
        const UserCollection = (await import('@/models/UserCollection')).default;
        const collection = await UserCollection.find({ userId, status: { $ne: 'wishlist' }, deletedAt: null })
            .populate('instrumentId', 'brand model type genericImages')
            .limit(12).lean();
            
        return { success: true, data: { user: JSON.parse(JSON.stringify(user)), collection: JSON.parse(JSON.stringify(collection)), stats: { collectionsCount: collection.length } } };
    } catch (e) { return { success: false }; }
}

/* --- NOTIFICATIONS --- */

export async function getNotifications(limit = 10) {
    const session = await auth();
    if (!session?.user?.id) return { success: false, data: [] };
    await dbConnect();
    const notifications = await Notification.find({ userId: session.user.id }).sort({ createdAt: -1 }).limit(limit).lean();
    return { success: true, data: JSON.parse(JSON.stringify(notifications)) };
}

export async function markAsRead(notificationId: string) {
    const session = await auth();
    await dbConnect();
    await Notification.findOneAndUpdate({ _id: notificationId, userId: session?.user?.id }, { read: true });
    revalidatePath('/dashboard');
    return { success: true };
}

export async function markAllAsRead() {
    const session = await auth();
    await dbConnect();
    await Notification.updateMany({ userId: session?.user?.id, read: false }, { read: true });
    revalidatePath('/dashboard');
    return { success: true };
}

/* --- CONTACT REQUESTS --- */

export async function getUserContactRequests() {
    const session = await auth();
    if (!session?.user?.id) return [];
    await dbConnect();
    const ContactRequest = (await import('@/models/ContactRequest')).default;
    const requests = await ContactRequest.find({ 'sender.userId': session.user.id }).sort({ updatedAt: -1 }).lean();
    return JSON.parse(JSON.stringify(requests));
}

export async function getContactRequest(id: string) {
    await dbConnect();
    const ContactRequest = (await import('@/models/ContactRequest')).default;
    const request = await ContactRequest.findById(id).lean();
    return request ? JSON.parse(JSON.stringify(request)) : null;
}

export async function submitContactRequest(data: any) {
    const session = await auth();
    await dbConnect();
    const ContactRequest = (await import('@/models/ContactRequest')).default;
    const request = await ContactRequest.create({ 
        sender: { name: data.name, email: data.email, userId: session?.user?.id },
        subject: data.subject,
        thread: [{ content: data.message, senderType: 'user' }]
    });
    return { success: true, id: request._id };
}

export async function replyToContact(requestId: string, content: string) {
    const session = await auth();
    await dbConnect();
    const ContactRequest = (await import('@/models/ContactRequest')).default;
    await ContactRequest.findByIdAndUpdate(requestId, {
        $push: { thread: { content, senderType: (session?.user as any)?.role === 'admin' ? 'admin' : 'user' } },
        status: (session?.user as any)?.role === 'admin' ? 'replied' : 'open'
    });
    revalidatePath(`/dashboard/admin/contacts/${requestId}`);
    return { success: true };
}
