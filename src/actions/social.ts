'use server';

import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import Activity from "@/models/Activity";
import User from "@/models/User";
import { revalidatePath } from "next/cache";
import { createNotification } from './notifications';

// --- HELPERS ---

export async function logActivity(type: string, data: any) {
    try {
        const session = await auth();
        if (!session?.user) return;

        await dbConnect();
        await Activity.create({
            userId: (session.user as any).id,
            type,
            data
        });
    } catch (error) {
        console.error("Error logging activity:", error);
        // Do not crash the main flow if logging fails
    }
}

// --- FOLLOW ACTIONS ---

export async function followUser(targetUserId: string) {
    try {
        const session = await auth();
        if (!session?.user) return { success: false, error: "Debes iniciar sesión" };

        const currentUserId = (session.user as any).id;
        if (currentUserId === targetUserId) return { success: false, error: "No puedes seguirte a ti mismo" };

        await dbConnect();

        // 1. Add to my 'following'
        await User.findByIdAndUpdate(currentUserId, {
            $addToSet: { following: targetUserId }
        });

        // 2. Add to target 'followers'
        await User.findByIdAndUpdate(targetUserId, {
            $addToSet: { followers: currentUserId }
        });



        // ... inside followUser (success block)

        // 3. Log activity
        await logActivity('follow', { targetUserId });

        // 4. Notify user
        await createNotification(targetUserId, 'follow', {
            actorId: currentUserId,
            actorName: (session.user as any).name,
            actorImage: (session.user as any).image
        });

        revalidatePath(`/profile/${targetUserId}`); // Assuming we will have profiles
        return { success: true };

    } catch (error) {
        return { success: false, error: "Error al seguir usuario" };
    }
}

export async function unfollowUser(targetUserId: string) {
    try {
        const session = await auth();
        if (!session?.user) return { success: false, error: "Debes iniciar sesión" };

        const currentUserId = (session.user as any).id;

        await dbConnect();

        // 1. Remove from my 'following'
        await User.findByIdAndUpdate(currentUserId, {
            $pull: { following: targetUserId }
        });

        // 2. Remove from target 'followers'
        await User.findByIdAndUpdate(targetUserId, {
            $pull: { followers: currentUserId }
        });

        revalidatePath(`/profile/${targetUserId}`);
        return { success: true };

    } catch (error) {
        return { success: false, error: "Error al dejar de seguir" };
    }
}

export async function getFollowStatus(targetUserId: string) {
    try {
        const session = await auth();
        if (!session?.user) return { isFollowing: false };

        await dbConnect();
        const user = await User.findById((session.user as any).id).select('following');

        const isFollowing = user?.following?.includes(targetUserId);
        return { isFollowing: !!isFollowing };
    } catch (error) {
        return { isFollowing: false };
    }
}

// --- FEED ACTIONS ---

export async function getUserFeed(page = 1, limit = 20) {
    try {
        const session = await auth();
        if (!session?.user) return { success: false, error: "Debes iniciar sesión" };

        await dbConnect();

        // 1. Get List of people I follow
        const currentUser = await User.findById((session.user as any).id).select('following');
        const followingIds = currentUser?.following || [];

        // Include my own activities? Maybe. Let's stick to following for now.
        // followingIds.push((session.user as any).id); 

        if (followingIds.length === 0) {
            return { success: true, data: [] };
        }

        // 2. Query Activities from these users
        const activities = await Activity.find({ userId: { $in: followingIds } })
            .populate('userId', 'name image') // Get actor info
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .lean();

        return { success: true, data: JSON.parse(JSON.stringify(activities)) };

    } catch (error) {
        console.error("Error fetching feed:", error);
        return { success: false, error: "Error al cargar el feed" };
    }
}
