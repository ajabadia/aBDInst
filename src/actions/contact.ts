'use server';

import dbConnect from '@/lib/db';
import ContactRequest, { IContactRequest } from '@/models/ContactRequest';
import Notification from '@/models/Notification';
import User from '@/models/User';
import { auth } from '@/auth';
import { sendEmail } from '@/lib/email';
import { revalidatePath } from 'next/cache';
import mongoose from 'mongoose';

// Helper to sanitize
function sanitize(doc: any) {
    const { _id, ...rest } = doc.toObject ? doc.toObject() : doc;
    return { id: _id.toString(), ...rest };
}

export async function submitContactRequest(data: {
    name?: string;
    email?: string;
    subject: string;
    message: string;
}) {
    try {
        await dbConnect();
        const session = await auth();
        let senderData: any = {};

        if (session?.user) {
            // Authenticated user
            senderData = {
                name: session.user.name || 'Usuario',
                email: session.user.email,
                userId: session.user.id
            };
        } else {
            // Guest
            if (!data.name || !data.email) {
                return { success: false, error: 'Nombre y email requeridos para invitados' };
            }
            senderData = {
                name: data.name,
                email: data.email
            };
        }

        const newRequest = await ContactRequest.create({
            subject: data.subject,
            status: 'open',
            sender: senderData,
            thread: [{
                content: data.message,
                senderType: 'user', // Initiator is always the user side
                senderId: senderData.userId || null
            }]
        });

        // Notify Admins
        const admins = await User.find({ role: 'admin' });
        const notifications = admins.map(admin => ({
            userId: admin._id,
            type: 'contact_request',
            data: {
                requestId: newRequest._id,
                subject: newRequest.subject,
                senderName: senderData.name
            }
        }));

        // Send Email to System Contact/Admins
        // If config has 'support' sender, we could use that as destination or source.
        // Usually contact forms send TO the admin.
        const adminEmails = admins.map(a => a.email).filter(Boolean);
        if (adminEmails.length > 0) {
            const { getAndRenderEmail } = await import('@/lib/email-templates');
            const emailContent = await getAndRenderEmail('CONTACT_FORM_ADMIN', {
                name: senderData.name,
                email: senderData.email,
                subject: data.subject,
                message: data.message,
                link: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/admin/contacts/${newRequest._id}`
            });

            await sendEmail({
                to: adminEmails[0],
                ...emailContent,
                channel: 'support'
            });
        }

        if (notifications.length > 0) {
            await Notification.insertMany(notifications);
        }

        return { success: true, id: newRequest._id.toString() };

    } catch (error: any) {
        console.error('Submit Contact Error:', error);
        return { success: false, error: error.message };
    }
}

export async function replyToContact(requestId: string, content: string) {
    try {
        await dbConnect();
        const session = await auth();
        if (!session?.user?.email) throw new Error("No autorizado");

        const currentUser = await User.findOne({ email: session.user.email });
        if (!currentUser) throw new Error("Usuario no encontrado");

        const request = await ContactRequest.findById(requestId);
        if (!request) return { success: false, error: 'Solicitud no encontrada' };

        if (request.status === 'closed') return { success: false, error: 'La conversación está cerrada' };

        const isAdmin = currentUser.role === 'admin';
        const isOwner = request.sender.userId?.toString() === currentUser._id.toString();

        if (!isAdmin && !isOwner) {
            return { success: false, error: "No tienes permiso para responder" };
        }

        const senderType = isAdmin ? 'admin' : 'user';

        // Add reply to thread
        request.thread.push({
            content,
            senderType,
            senderId: currentUser._id
        });

        // Update status logic
        if (isAdmin) {
            request.status = 'replied';
        } else {
            // If user replies, we ensure it's "open" so admin sees it as pending
            request.status = 'open';
        }

        await request.save();

        // Notifications
        if (isAdmin) {
            // Admin replied -> Notify User
            const { getAndRenderEmail } = await import('@/lib/email-templates');
            const emailContent = await getAndRenderEmail('CONTACT_REPLY_USER', {
                name: request.sender.name,
                subject: request.subject,
                content: content,
                originalMessage: request.thread[0].content
            });

            await sendEmail({
                to: request.sender.email,
                ...emailContent
            });

            if (request.sender.userId) {
                await Notification.create({
                    userId: request.sender.userId,
                    type: 'contact_reply',
                    data: {
                        requestId: request._id,
                        subject: request.subject
                    }
                });
            }
        } else {
            // User replied -> Notify Admins
            const admins = await User.find({ role: 'admin' });
            const notifications = admins.map(admin => ({
                userId: admin._id,
                type: 'contact_request', // Re-use contact_request type or a new 'contact_update'
                data: {
                    requestId: request._id,
                    subject: `[Actualizado] ${request.subject}`,
                    senderName: request.sender.name
                }
            }));

            if (notifications.length > 0) {
                await Notification.insertMany(notifications);
            }
        }

        revalidatePath(`/dashboard/admin/contacts/${requestId}`);
        revalidatePath(`/dashboard/requests/${requestId}`);
        return { success: true };

    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function closeContactRequest(requestId: string) {
    try {
        await dbConnect();
        const session = await auth();
        if (!session?.user) throw new Error("No autorizado");

        const currentUser = await User.findById(session.user.id);

        const request = await ContactRequest.findById(requestId);
        if (!request) return { success: false, error: 'Solicitud no encontrada' };

        const isAdmin = currentUser.role === 'admin';
        const isOwner = request.sender.userId?.toString() === currentUser._id.toString();

        if (!isAdmin && !isOwner) return { success: false, error: 'Sin permiso' };

        request.status = 'closed';
        request.closedAt = new Date();
        request.closedBy = {
            userId: currentUser._id,
            name: currentUser.name,
            role: currentUser.role
        };

        await request.save();

        revalidatePath(`/dashboard/admin/contacts/${requestId}`);
        revalidatePath(`/dashboard/requests/${requestId}`);
        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

export async function checkExpiredRequests() {
    try {
        await dbConnect();
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        // Find open/replied requests older than 7 days
        const expiredRequests = await ContactRequest.find({
            status: { $ne: 'closed' },
            updatedAt: { $lt: sevenDaysAgo }
        });

        if (expiredRequests.length === 0) return { success: true, count: 0 };

        for (const req of expiredRequests) {
            req.status = 'closed';
            req.closedAt = new Date();
            req.closedBy = {
                role: 'system',
                name: 'System Auto-Close',
                userId: null
            } as any;
            await req.save();
        }

        return { success: true, count: expiredRequests.length };
    } catch (e) {
        return { success: false, error: 'Error checking expired' };
    }
}

export async function getAdminContactRequests(filter: 'all' | 'open' | 'closed' = 'all', page = 1) {
    try {
        await dbConnect();
        const session = await auth();
        // Basic check, assume middleware/page blocks unauthorized, but double check
        const user = await User.findById(session?.user?.id);
        if (user?.role !== 'admin') throw new Error('Unauthorized');

        const query: any = {};
        if (filter !== 'all') query.status = filter === 'open' ? { $ne: 'closed' } : 'closed'; // Simplified logic

        const limit = 20;
        const skip = (page - 1) * limit;

        const requests = await ContactRequest.find(query)
            .sort({ updatedAt: -1 })
            .skip(skip)
            .limit(limit);

        return JSON.parse(JSON.stringify(requests));
    } catch (error) {
        console.error('Get Admin Contacts Error:', error);
        return [];
    }
}

export async function getUserContactRequests() {
    try {
        await dbConnect();
        const session = await auth();
        if (!session?.user?.id) throw new Error('Unauthorized');

        const requests = await ContactRequest.find({ 'sender.userId': session.user.id })
            .sort({ createdAt: -1 });

        return JSON.parse(JSON.stringify(requests));
    } catch (error) {
        return [];
    }
}

export async function getContactRequest(id: string) {
    try {
        await dbConnect();
        const session = await auth();
        if (!session?.user) return null;

        const request = await ContactRequest.findById(id);
        if (!request) return null;

        const userId = session.user.id;
        const userRole = (session.user as any).role;

        // Security: Allow if Admin OR if it's the sender
        const isSender = request.sender.userId?.toString() === userId;
        const isAdmin = userRole === 'admin';

        if (!isSender && !isAdmin) {
            console.error(`Access denied for user ${userId} to request ${id}`);
            return null;
        }

        return JSON.parse(JSON.stringify(request));
    } catch (error) {
        console.error('Get Contact Request Error:', error);
        return null; // Return null on error/not found
    }
}
