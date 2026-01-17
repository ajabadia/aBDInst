'use server';

import dbConnect from '@/lib/db';
import User from '@/models/User';
import { BADGES } from '@/lib/gamification';
import { revalidatePath } from 'next/cache';

export async function awardBadge(userId: string, badgeId: string) {
    if (!BADGES[badgeId]) return;

    await dbConnect();

    // Check if user already has badge
    const user = await User.findById(userId).select('badges');
    if (!user) return;

    const hasBadge = user.badges.some((b: any) => b.id === badgeId);
    if (!hasBadge) {
        await User.findByIdAndUpdate(userId, {
            $push: { badges: { id: badgeId, unlockedAt: new Date() } }
        });

        // In a real app, we might push a notification to the client via socket or return a flag
        // For now, we rely on UI to fetch the update
        return { newBadge: BADGES[badgeId] };
    }
    return null;
}

export async function checkInventoryMilestones(userId: string) {
    // Circular dependency check: importing UserCollection dynamically if needed, 
    // or just assume caller handles logic.
    // Let's count items.
    const UserCollection = (await import('@/models/UserCollection')).default;
    const count = await UserCollection.countDocuments({ userId, deletedAt: null });

    if (count >= 1) await awardBadge(userId, 'FIRST_INSTRUMENT');
    if (count >= 10) await awardBadge(userId, 'INVENTORY_MASTER');
}
