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

export async function checkAndAwardBadge(userId: string, triggerType: 'CONTRIBUTION' | 'EXHIBITION' | 'SPOTLIGHT') {
    try {
        await dbConnect();

        // Import Badge dynamically to avoid circular deps if any, though usually fine here
        const Badge = (await import('@/models/Badge')).default;
        const UserBadge = (await import('@/models/UserBadge')).default;
        const Instrument = (await import('@/models/Instrument')).default;

        const badges = await Badge.find({
            active: true,
            'criteria.type': { $exists: true }
        }).lean();

        const awardedBadges = [];

        for (const badge of badges) {
            // Skip if user already has it
            const existing = await UserBadge.findOne({ userId, badgeCode: badge.code });
            if (existing) continue;

            let shouldAward = false;

            // Check Criteria
            if (badge.criteria?.type === 'contribution_count' && triggerType === 'CONTRIBUTION') {
                // Count published instruments
                const count = await Instrument.countDocuments({ createdBy: userId, status: 'published' });
                if (count >= (badge.criteria.count || 1)) {
                    shouldAward = true;
                }
            } else if (badge.criteria?.type === 'exhibition_join' && triggerType === 'EXHIBITION') {
                shouldAward = true;
            } else if (badge.criteria?.type === 'spotlight_win' && triggerType === 'SPOTLIGHT') {
                shouldAward = true;
            }

            if (shouldAward) {
                await UserBadge.create({
                    userId,
                    badgeCode: badge.code,
                    badgeId: badge._id?.toString() || badge._id
                });
                awardedBadges.push(badge.name);
            }
        }

        if (awardedBadges.length > 0) {
            console.log(`🏆 Badges awarded to ${userId}:`, awardedBadges);
        }

        return { success: true, awarded: awardedBadges };

    } catch (error) {
        console.error('Badge Award Error:', error);
        return { success: false, error: 'Failed to process badges' };
    }
}

export async function getUserBadges(userId: string) {
    try {
        await dbConnect();
        const UserBadge = (await import('@/models/UserBadge')).default;
        const Badge = (await import('@/models/Badge')).default;

        const userBadges = await UserBadge.find({ userId }).sort({ createdAt: -1 }).lean();

        // Enrich with badge definition
        const enrichedBadges = await Promise.all(userBadges.map(async (ub: any) => {
            const badgeDef = await Badge.findOne({ code: ub.badgeCode }).lean();
            return {
                ...ub,
                _id: ub._id?.toString() || '',
                badgeId: ub.badgeId?.toString() || '',
                definition: badgeDef ? {
                    ...badgeDef,
                    _id: badgeDef._id?.toString() || ''
                } : null
            };
        }));

        return enrichedBadges.filter(b => b.definition);
    } catch (error) {
        console.error('Error fetching user badges:', error);
        return [];
    }
}
