'use server';

import dbConnect from "@/lib/db";
import User from "@/models/User";
import UserCollection from "@/models/UserCollection";
import "@/models/Instrument"; // Ensure Instrument schema is registered for populate
import Exhibition from "@/models/Exhibition";
import { getFollowStatus } from "./social";

export async function getPublicProfile(userId: string) {
    try {
        await dbConnect();

        const user = await User.findById(userId).select('name image bio location website createdAt followers following isBanned').lean();

        if (!user) return { success: false, error: "Usuario no encontrado" };
        if ((user as any).isBanned) return { success: false, error: "Este perfil no está disponible." };

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
            .populate('instrumentId', 'brand model images genericImages type')
            .sort({ createdAt: -1 })
            .limit(6)
            .lean();

        // Get public showrooms (Exhibitions/Contests)
        const exhibitions = await Exhibition.find({
            createdBy: userId,
            status: { $in: ['active', 'upcoming', 'ended'] }
        })
            .select('title slug bannerImage status startDate type')
            .sort({ startDate: -1 })
            .lean();

        // Get User Created Showrooms
        const { default: Showroom } = await import('@/models/Showroom');
        const userShowrooms = await Showroom.find({
            userId,
            isPublic: true
        })
            .select('name slug coverImage createdAt theme')
            .sort({ createdAt: -1 })
            .lean();

        // Normalize and combine
        const normalizedExhibitions = exhibitions.map((e: any) => ({
            _id: e._id,
            title: e.title,
            slug: e.slug,
            coverImage: e.bannerImage, // Map banner to cover for consistency
            type: e.type || 'contest',
            status: e.status,
            date: e.startDate
        }));

        const normalizedShowrooms = userShowrooms.map((s: any) => ({
            _id: s._id,
            title: s.name,
            slug: s.slug,
            coverImage: s.coverImage,
            type: 'showroom',
            status: 'active',
            date: s.createdAt
        }));

        const combinedShowrooms = [...normalizedShowrooms, ...normalizedExhibitions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        // Get follow status
        const { isFollowing } = await getFollowStatus(userId);

        return {
            success: true,
            data: {
                user: JSON.parse(JSON.stringify(user)),
                stats: { collectionsCount, wishlistCount },
                collection: JSON.parse(JSON.stringify(collection)),
                showrooms: JSON.parse(JSON.stringify(combinedShowrooms)),
                isFollowing
            }
        };

    } catch (error) {
        console.error("Error fetching profile:", error);
        return { success: false, error: "Error de servidor" };
    }
}
