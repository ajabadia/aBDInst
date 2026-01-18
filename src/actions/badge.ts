
'use server';

import dbConnect from '@/lib/db';
import Badge from '@/models/Badge';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';
import { BadgeSchema } from '@/lib/schemas'; // Need to add this schema

export async function getBadges() {
    try {
        await dbConnect();
        const badges = await Badge.find({}).sort({ createdAt: -1 }).lean();
        return JSON.parse(JSON.stringify(badges));
    } catch (error) {
        console.error('Get Badges Error:', error);
        return [];
    }
}

export async function createBadge(data: FormData) {
    try {
        const session = await auth();
        if (!session || !['admin', 'supereditor'].includes((session.user as any).role)) {
            return { success: false, error: 'Unauthorized' };
        }

        await dbConnect();

        const rawData = {
            code: data.get('code'),
            name: data.get('name'),
            description: data.get('description'),
            imageUrl: data.get('imageUrl'),
            category: data.get('category'),
            icon: data.get('icon'),
            active: data.get('active') === 'true',
        };

        const badge = await Badge.create(rawData);
        revalidatePath('/admin/badges');
        return { success: true, badge: JSON.parse(JSON.stringify(badge)) };

    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function updateBadge(id: string, data: FormData) {
    try {
        const session = await auth();
        if (!session || !['admin', 'supereditor'].includes((session.user as any).role)) {
            return { success: false, error: 'Unauthorized' };
        }

        await dbConnect();

        const rawData = {
            code: data.get('code'),
            name: data.get('name'),
            description: data.get('description'),
            imageUrl: data.get('imageUrl'),
            category: data.get('category'),
            icon: data.get('icon'),
            active: data.get('active') === 'true',
        };

        // Remove empty/undefined
        Object.keys(rawData).forEach(key => (rawData as any)[key] === undefined && delete (rawData as any)[key]);

        await Badge.findByIdAndUpdate(id, rawData);
        revalidatePath('/admin/badges');
        return { success: true };

    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function deleteBadge(id: string) {
    try {
        const session = await auth();
        if (!session || !['admin'].includes((session.user as any).role)) {
            return { success: false, error: 'Unauthorized' };
        }
        await dbConnect();
        await Badge.findByIdAndDelete(id);
        revalidatePath('/admin/badges');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
