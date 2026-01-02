'use server';

import dbConnect from "@/lib/db";
import User from "@/models/User";
import UserCollection from "@/models/UserCollection";
import { getFollowStatus } from "./social";

export async function getPublicProfile(userId: string) {
    try {
        await dbConnect();

        const user = await User.findById(userId).select('name image bio location website createdAt followers following isBanned').lean();

        if (!user) return { success: false, error: "Usuario no encontrado" };
        if (user.isBanned) return { success: false, error: "Este perfil no está disponible." };

        // Get stats
        const collectionsCount = await UserCollection.countDocuments({ userId, deletedAt: null });
        const wishlistCount = await UserCollection.countDocuments({ userId, status: 'wishlist' });

        // Get public collection (limit 6 for now)
        const collection = await UserCollection.find({
            userId,
            deletedAt: null,
            status: { $ne: 'wishlist' }, // Exclude wishlist from this list
            // visibility: 'public' // If we had visibility field
        })
            .populate('instrumentId', 'brand model images type')
            .sort({ createdAt: -1 })
            .limit(6)
            .lean();

        // Get follow status
        const { isFollowing } = await getFollowStatus(userId);

        return {
            success: true,
            data: {
                user: JSON.parse(JSON.stringify(user)),
                stats: { collectionsCount, wishlistCount },
                collection: JSON.parse(JSON.stringify(collection)),
                isFollowing
            }
        };

    } catch (error) {
        console.error("Error fetching profile:", error);
        return { success: false, error: "Error de servidor" };
    }
}
