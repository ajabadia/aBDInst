'use server';

import { auth, signOut } from '@/auth';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import UserCollection from '@/models/UserCollection';
import bcrypt from 'bcryptjs';
import { UserProfileSchema, ChangePasswordSchema } from '@/lib/schemas';
import { revalidatePath } from 'next/cache';
import { decryptCredentials } from '@/lib/encryption';
import { CloudinaryProvider } from '@/lib/storage-providers/cloudinary';
import { GoogleDriveProvider } from '@/lib/storage-providers/google-drive';
import { DropboxProvider } from '@/lib/storage-providers/dropbox';
import { TeraboxProvider } from '@/lib/storage-providers/terabox';

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

export async function updateProfileImage(formData: FormData) {
    try {
        const session = await auth();
        if (!session?.user?.id) throw new Error("No autorizado");

        const file = formData.get('file') as File;
        if (!file) throw new Error("No se proporcionó ningún archivo");

        if (!file.type.startsWith('image/')) {
            throw new Error("El archivo debe ser una imagen");
        }

        if (file.size > 5 * 1024 * 1024) {
            throw new Error("La imagen no debe superar los 5MB");
        }

        await dbConnect();
        const user = await User.findById(session.user.id).select('+storageProvider.credentials');

        if (!user) throw new Error("Usuario no encontrado");

        if (!user.storageProvider || user.storageProvider.status !== 'configured') {
            throw new Error("Debes configurar un proveedor de almacenamiento (Cloudinary, Drive, etc.) en Ajustes > Almacenamiento para subir tu avatar.");
        }

        const credentials = decryptCredentials(user.storageProvider.credentials, session.user.id);
        let url = '';

        if (user.storageProvider.type === 'cloudinary') {
            const provider = new CloudinaryProvider(credentials);
            url = await provider.upload(file, session.user.id, `avatars/${session.user.id}/${Date.now()}`);
        } else if (user.storageProvider.type === 'google-drive') {
            const provider = new GoogleDriveProvider(credentials);
            url = await provider.upload(file, `avatars/${session.user.id}`);
        } else if (user.storageProvider.type === 'dropbox') {
            const provider = new DropboxProvider(credentials);
            url = await provider.upload(file, `avatars/${session.user.id}`);
        } else if (user.storageProvider.type === 'terabox') {
            const provider = new TeraboxProvider(credentials);
            url = await provider.upload(file, `avatars/${session.user.id}`);
        } else {
            throw new Error("Proveedor de almacenamiento no soportado");
        }

        user.image = url;
        await user.save();

        revalidatePath('/');
        revalidatePath('/dashboard/settings');
        return { success: true, url };
    } catch (error: any) {
        console.error("Error updating profile image:", error);
        return { success: false, error: error.message };
    }
}

export async function deleteProfileImage() {
    try {
        const session = await auth();
        if (!session?.user?.id) throw new Error("No autorizado");

        await dbConnect();
        const user = await User.findById(session.user.id);

        if (!user) throw new Error("Usuario no encontrado");

        user.image = null;
        await user.save();

        revalidatePath('/');
        revalidatePath('/dashboard/settings');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
