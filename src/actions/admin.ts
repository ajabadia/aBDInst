'use server';

import { auth } from '@/auth';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { revalidatePath } from 'next/cache';

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
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
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
