'use server';

import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import Comment from "@/models/Comment";
import User from "@/models/User";
import { revalidatePath } from "next/cache";
import { createNotification } from './notifications';
import { logActivity } from './social';
import Instrument from '@/models/Instrument';

// --- PUBLIC ACTIONS (Authenticated) ---

export async function postComment(instrumentId: string, content: string, parentId?: string) {
    try {
        const session = await auth();
        const userId = (session?.user as any)?.id;
        if (!userId) return { success: false, error: "Debes iniciar sesión" };

        await dbConnect();

        // Check user status
        const user = await User.findById(userId).select('isBanned');
        if (!user || user.isBanned) {
            return { success: false, error: "Tu cuenta está restringida y no puedes publicar comentarios." };
        }

        if (!content || content.trim().length === 0) {
            return { success: false, error: "El comentario no puede estar vacío." };
        }

        const newComment = await Comment.create({
            instrumentId,
            userId,
            content: content.trim(),
            parentId: parentId || null,
        });

        revalidatePath(`/instruments/${instrumentId}`);

        // Log activity
        const instrument = await Instrument.findById(instrumentId).select('brand model userId'); // Fetched userId of owner
        if (instrument) {
            await logActivity('comment', {
                instrumentId,
                instrumentName: `${instrument.brand} ${instrument.model}`,
                commentId: newComment._id
            });

            // Notify Application Owner (Instrument Owner)
            const instrumentOwnerId = (instrument.userId as any)?.toString();
            if (instrumentOwnerId && instrumentOwnerId !== userId) {
                await createNotification(instrumentOwnerId, 'comment', {
                    actorId: userId,
                    actorName: (session?.user as any)?.name || 'Usuario',
                    instrumentId,
                    instrumentName: `${instrument.brand} ${instrument.model}`,
                    commentId: newComment._id
                });
            }

            // Notify Parent Comment Author (if reply)
            if (parentId) {
                const parentComment = await Comment.findById(parentId).lean();
                const parentUserId = (parentComment as any)?.userId?.toString();
                if (parentUserId && parentUserId !== userId) {
                    await createNotification(parentUserId, 'reply', {
                        actorId: userId,
                        actorName: (session?.user as any)?.name || 'Usuario',
                        instrumentId,
                        instrumentName: `${instrument.brand} ${instrument.model}`,
                        commentId: newComment._id
                    });
                }
            }
        }

        return { success: true, data: JSON.parse(JSON.stringify(newComment)) };

    } catch (error) {
        console.error("Error posting comment:", error);
        return { success: false, error: "Error al publicar el comentario." };
    }
}

export async function getComments(instrumentId: string) {
    try {
        const session = await auth();
        const isAdmin = (session?.user as any)?.role === 'admin';

        await dbConnect();

        // If admin, show everything. If not, only show visible.
        const query: any = { instrumentId, isDeleted: false };
        if (!isAdmin) {
            query.status = 'visible';
        }

        const comments = await Comment.find(query)
            .populate('userId', 'name image isBanned role') // Populate user info
            .sort({ createdAt: 1 }) // Chronological order
            .lean();

        // Serialize IDs
        return { success: true, data: JSON.parse(JSON.stringify(comments)) };

    } catch (error) {
        console.error("Error fetching comments:", error);
        return { success: false, data: [] };
    }
}

export async function reportComment(commentId: string, reason: string) {
    try {
        const session = await auth();
        const userId = (session?.user as any)?.id;
        if (!userId) return { success: false, error: "Debes iniciar sesión para reportar." };

        await dbConnect();

        // Prevent duplicate reports from same user
        const alreadyReported = await Comment.findOne({
            _id: commentId,
            'reports.userId': userId
        });

        if (alreadyReported) {
            return { success: false, error: "Ya has reportado este comentario." };
        }

        await Comment.findByIdAndUpdate(commentId, {
            $push: { reports: { userId: userId, reason, date: new Date() } },
            $inc: { reportCount: 1 }
        });

        return { success: true };

    } catch (error) {
        console.error("Error reporting comment:", error);
        return { success: false, error: "Error al enviar el reporte." };
    }
}

export async function deleteOwnComment(commentId: string) {
    try {
        const session = await auth();
        const userId = (session?.user as any)?.id;
        if (!userId) return { success: false, error: "No autorizado" };

        await dbConnect();
        const comment = await Comment.findById(commentId);

        if (!comment) return { success: false, error: "Comentario no encontrado" };

        if (comment.userId.toString() !== userId) {
            return { success: false, error: "No puedes borrar este comentario" };
        }

        const hasChildren = await Comment.exists({ parentId: commentId });

        if (hasChildren) {
            comment.content = "[Comentario eliminado por el usuario]";
            comment.status = 'hidden';
            comment.isDeleted = true;
            await comment.save();
        } else {
            await Comment.findByIdAndDelete(commentId);
        }

        revalidatePath(`/instruments/${comment.instrumentId}`);
        return { success: true };

    } catch (error) {
        return { success: false, error: "Error al borrar" };
    }
}

// --- ADMIN ACTIONS ---

async function checkAdmin(session: any) {
    if (!session || (session.user as any)?.role !== 'admin') {
        throw new Error("No autorizado");
    }
}

export async function moderateComment(commentId: string, action: 'hide' | 'visible' | 'delete') {
    try {
        const session = await auth();
        await checkAdmin(session);
        await dbConnect();

        if (action === 'delete') {
            await Comment.findByIdAndUpdate(commentId, {
                isDeleted: true,
                status: 'hidden',
                content: '[Comentario eliminado por administración]'
            });
        } else {
            await Comment.findByIdAndUpdate(commentId, { status: action });
        }

        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function banUser(userId: string) {
    try {
        const session = await auth();
        await checkAdmin(session);
        await dbConnect();

        // Ban user
        await User.findByIdAndUpdate(userId, { isBanned: true });

        // Hide all their comments
        await Comment.updateMany({ userId }, { status: 'hidden' });

        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function getModerationQueue() {
    try {
        const session = await auth();
        await checkAdmin(session);
        await dbConnect();

        const reported = await Comment.find({ reportCount: { $gt: 0 }, isDeleted: false })
            .populate('userId', 'name email role isBanned')
            .sort({ reportCount: -1, createdAt: -1 })
            .lean();

        return { success: true, data: JSON.parse(JSON.stringify(reported)) };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function dismissReports(commentId: string) {
    try {
        const session = await auth();
        await checkAdmin(session);
        await dbConnect();
        await Comment.findByIdAndUpdate(commentId, { reports: [], reportCount: 0 }); // Clear reports

        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
