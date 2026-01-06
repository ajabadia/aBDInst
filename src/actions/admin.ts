'use server';

import { auth } from '@/auth';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { revalidatePath } from 'next/cache';
import SystemConfig from '@/models/SystemConfig';
import { escapeRegExp } from '@/lib/utils';

// Helper to check if current user is admin
async function checkAdmin() {
    const session = await auth();
    if (!session?.user?.id) throw new Error("No autorizado");

    await dbConnect();
    const currentUser = await User.findById(session.user.id);

    if (!currentUser || currentUser.role !== 'admin') {
        throw new Error("Acceso denegado: Requiere rol de Administrador");
    }
    return currentUser;
}

export async function getUsers(page = 1, limit = 20, search = '') {
    try {
        await checkAdmin();

        const query: any = {};
        if (search) {
            const safeSearch = escapeRegExp(search);
            query.$or = [
                { name: { $regex: safeSearch, $options: 'i' } },
                { email: { $regex: safeSearch, $options: 'i' } }
            ];
        }

        const skip = (page - 1) * limit;

        const users = await User.find(query)
            .select('name email image role isBanned createdAt lastLogin')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        const total = await User.countDocuments(query);

        return {
            success: true,
            users: JSON.parse(JSON.stringify(users)),
            total,
            pages: Math.ceil(total / limit)
        };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function updateUserRole(userId: string, newRole: 'admin' | 'editor' | 'normal') {
    try {
        const admin = await checkAdmin();

        // Prevent self-demotion to lock out admin
        if (userId === admin._id.toString() && newRole !== 'admin') {
            throw new Error("No te puedes quitar el rol de admin a ti mismo");
        }

        await User.findByIdAndUpdate(userId, { role: newRole });
        revalidatePath('/dashboard/admin');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function toggleUserBan(userId: string) {
    try {
        const admin = await checkAdmin();

        if (userId === admin._id.toString()) {
            throw new Error("No te puedes banear a ti mismo");
        }

        const user = await User.findById(userId);
        if (!user) throw new Error("Usuario no encontrado");

        user.isBanned = !user.isBanned;
        await user.save();

        revalidatePath('/dashboard/admin');
        return { success: true, isBanned: user.isBanned };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function getSystemConfig(key: string) {
    try {
        await dbConnect();
        const config = await SystemConfig.findOne({ key });
        return config ? config.value : null;
    } catch (error) {
        console.error(`Error getting config ${key}:`, error);
        return null;
    }
}

export async function updateSystemConfig(key: string, value: any, description?: string) {
    try {
        const admin = await checkAdmin();

        // Find existing config to track history
        const existing = await SystemConfig.findOne({ key });
        console.log(`[updateSystemConfig] Key: ${key}, Existing found: ${!!existing}`);

        let historyEntry = null;
        if (existing) {
            historyEntry = {
                value: existing.value,
                updatedAt: new Date(),
                updatedBy: admin._id.toString()
            };
            console.log(`[updateSystemConfig] History entry created:`, historyEntry);
        }

        const update: any = {
            value,
            $push: historyEntry ? { history: historyEntry } : {}
        };

        if (description) update.description = description;

        // Clean up empty $push if no history
        if (!historyEntry) delete update.$push;

        console.log(`[updateSystemConfig] Update object:`, JSON.stringify(update, null, 2));

        await SystemConfig.findOneAndUpdate(
            { key },
            update,
            { upsert: true, new: true }
        );

        revalidatePath('/dashboard/admin/ai');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function getAdminStats() {
    try {
        await checkAdmin();
        const Comment = (await import('@/models/Comment')).default;

        const [userCount, instrumentCount, reports, banned] = await Promise.all([
            User.countDocuments({}),
            (await import('@/models/Instrument')).default.countDocuments({}),
            Comment.countDocuments({ reportCount: { $gt: 0 }, isDeleted: false }),
            User.countDocuments({ isBanned: true })
        ]);

        return {
            users: userCount,
            instruments: instrumentCount,
            reports: reports,
            banned
        };
    } catch (error) {
        console.error('Error getting admin stats:', error);
        return { users: 0, instruments: 0, reports: 0, banned: 0 };
    }
}

export async function getModerationQueue() {
    try {
        await checkAdmin();
        const Comment = (await import('@/models/Comment')).default;

        const reported = await Comment.find({ reportCount: { $gt: 0 }, isDeleted: false })
            .populate('userId', 'name email role isBanned')
            .sort({ reportCount: -1, createdAt: -1 })
            .lean();

        return JSON.parse(JSON.stringify(reported));
    } catch (error) {
        console.error('Error fetching moderation queue:', error);
        return [];
    }
}

export async function getAllSystemConfigs() {
    try {
        await checkAdmin();
        const configs = await SystemConfig.find({});
        return JSON.parse(JSON.stringify(configs));
    } catch (error) {
        return [];
    }
}

// --- MODERATION ACTIONS ---

export async function manageReport(commentId: string, action: 'dismiss' | 'delete') {
    try {
        await checkAdmin();
        const Comment = (await import('@/models/Comment')).default;

        if (action === 'delete') {
            await Comment.findByIdAndUpdate(commentId, {
                isDeleted: true,
                status: 'hidden',
                content: '[Comentario eliminado por moderación]'
            });
        } else if (action === 'dismiss') {
            await Comment.findByIdAndUpdate(commentId, { reports: [], reportCount: 0 });
        }

        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function punishUser(userId: string, action: 'strike' | 'ban') {
    try {
        const admin = await checkAdmin();
        if (userId === admin._id.toString()) throw new Error("No puedes sancionarte a ti mismo");

        if (action === 'ban') {
            await User.findByIdAndUpdate(userId, { isBanned: true });
        } else if (action === 'strike') {
            await User.findByIdAndUpdate(userId, { $inc: { strikes: 1 } });
        }

        revalidatePath('/dashboard/admin');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function getDefaultConfig() {
    return {
        prompt: "Analyze this instrument...",
        model: "gemini-1.5-flash"
    };
}
