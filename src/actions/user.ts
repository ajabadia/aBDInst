'use server';

import { auth, signOut } from '@/auth';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import UserCollection from '@/models/UserCollection';
import bcrypt from 'bcryptjs';
import { UserProfileSchema, ChangePasswordSchema } from '@/lib/schemas';
import { revalidatePath } from 'next/cache';

export async function deleteAccount() {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            throw new Error("No autorizado: ID no encontrado");
        }

        await dbConnect();

        // 1. Delete User Collection
        await UserCollection.deleteMany({ userId: session.user.id });

        // 2. Delete User
        await User.findByIdAndDelete(session.user.id);

        return { success: true };
    } catch (error: any) {
        console.error("Error deleting account:", error);
        return { success: false, error: error.message || "No se pudo eliminar la cuenta" };
    }
}

export async function updateUserProfile(data: any) {
    try {
        const session = await auth();
        if (!session?.user?.id) throw new Error("No autorizado");

        const validated = UserProfileSchema.safeParse(data);
        if (!validated.success) {
            return { success: false, error: validated.error.issues.map(i => i.message).join(", ") };
        }

        await dbConnect();
        const updatedUser = await User.findByIdAndUpdate(
            session.user.id,
            { $set: validated.data },
            { new: true, runValidators: true }
        );

        if (!updatedUser) {
            console.error("User not found for update:", session.user.id);
            return { success: false, error: "Usuario no encontrado" };
        }

        console.log("Profile updated successfully for:", session.user.id, validated.data);

        revalidatePath('/dashboard/settings');
        return { success: true };
    } catch (error: any) {
        console.error("Error updating profile:", error);
        return { success: false, error: error.message };
    }
}

export async function changePassword(formData: FormData) {
    try {
        const session = await auth();
        if (!session?.user?.id) throw new Error("No autorizado");

        const rawData = {
            currentPassword: formData.get('currentPassword') as string,
            newPassword: formData.get('newPassword') as string,
        };

        const validated = ChangePasswordSchema.safeParse(rawData);
        if (!validated.success) {
            return { success: false, error: validated.error.issues.map(i => i.message).join(", ") };
        }

        await dbConnect();
        const user = await User.findById(session.user.id).select('+password');
        if (!user) throw new Error("Usuario no encontrado");

        const isMatch = await bcrypt.compare(validated.data.currentPassword, user.password);
        if (!isMatch) {
            return { success: false, error: "La contraseña actual es incorrecta" };
        }

        user.password = await bcrypt.hash(validated.data.newPassword, 10);
        await user.save();

        return { success: true };
    } catch (error: any) {
        console.error("Error changing password:", error);
        return { success: false, error: error.message };
    }
}
