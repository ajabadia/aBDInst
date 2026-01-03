'use server';

import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import Comment from "@/models/Comment";
import Instrument from "@/models/Instrument";
import SystemConfig from "@/models/SystemConfig";
import { revalidatePath } from "next/cache";

// --- MIDDLEWARE ---
async function requireAdmin() {
    const session = await auth();
    if ((session?.user as any)?.role !== 'admin') {
        throw new Error("Acceso denegado: Se requieren permisos de administrador.");
    }
    await dbConnect();
    return session;
}

// --- DASHBOARD DATA ---

export async function getAdminStats() {
    try {
        await requireAdmin();

        const pendingReports = await Comment.countDocuments({ reportCount: { $gt: 0 } });
        const bannedUsers = await User.countDocuments({ isBanned: true });
        const totalUsers = await User.countDocuments();
        const totalInstruments = await Instrument.countDocuments();

        return {
            success: true,
            data: {
                pendingReports,
                bannedUsers,
                totalUsers,
                totalInstruments
            }
        };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// --- MODERATION QUEUE ---

export async function getModerationQueue() {
    try {
        await requireAdmin();

        // Get comments with reports
        const reportedComments = await Comment.find({ reportCount: { $gt: 0 } })
            .populate('userId', 'name email image strikes isBanned')
            .sort({ reportCount: -1, updatedAt: -1 }) // Prioritize most reported
            .lean();

        // Ensure serialization
        return { success: true, data: JSON.parse(JSON.stringify(reportedComments)) };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// --- ACTIONS ---

export async function manageReport(commentId: string, action: 'dismiss' | 'delete' | 'warning') {
    try {
        await requireAdmin();

        const comment = await Comment.findById(commentId);
        if (!comment) throw new Error("Comentario no encontrado");

        if (action === 'dismiss') {
            // Clear reports
            comment.reports = [];
            comment.reportCount = 0;
            await comment.save();
        } else if (action === 'delete') {
            // Delete comment (or soft delete)
            await Comment.findByIdAndDelete(commentId);
            revalidatePath(`/instruments/${comment.instrumentId}`);
        }

        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function punishUser(userId: string, type: 'strike' | 'ban' | 'unban') {
    try {
        await requireAdmin();

        const user = await User.findById(userId);
        if (!user) throw new Error("Usuario no encontrado");

        if (type === 'strike') {
            user.strikes = (user.strikes || 0) + 1;

            // Auto-ban logic: 3 strikes = ban
            if (user.strikes >= 3) {
                user.isBanned = true;
            }
            await user.save();
            return { success: true, message: `Strike añadido. Total: ${user.strikes}` };
        }

        if (type === 'ban') {
            user.isBanned = true;
            await user.save();
            // Optional: Hide all content
            await Comment.updateMany({ userId: user._id }, { status: 'hidden' });
            return { success: true, message: "Usuario baneado permanentemente." };
        }

        if (type === 'unban') {
            user.isBanned = false;
            user.strikes = 0; // Reset strikes?
            await user.save();
            return { success: true, message: "Usuario reactivado." };
        }

        return { success: false, error: "Acción desconocida" };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}


// --- SYSTEM CONFIG ---

export async function getSystemConfig(key: string) {
    try {
        await dbConnect();
        const config = await SystemConfig.findOne({ key });
        return config ? config.value : null;
    } catch (error) {
        console.error(`Error fetching config ${key}:`, error);
        return null;
    }
}

export async function setSystemConfig(key: string, value: any) {
    try {
        await requireAdmin();

        await SystemConfig.findOneAndUpdate(
            { key },
            { key, value },
            { upsert: true, new: true }
        );

        revalidatePath('/admin');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function getAllSystemConfigs() {
    try {
        await requireAdmin();
        const configs = await SystemConfig.find({}).lean();
        return { success: true, data: JSON.parse(JSON.stringify(configs)) };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
