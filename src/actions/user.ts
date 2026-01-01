'use server';

import { auth, signOut } from '@/auth';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import UserCollection from '@/models/UserCollection';

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
