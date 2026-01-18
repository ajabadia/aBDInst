'use server';

import dbConnect from '@/lib/db';
import Exhibition from '@/models/Exhibition';
import { auth } from '@/auth';
import { nanoid } from 'nanoid';
import { revalidatePath } from 'next/cache';

// Middleware helper
async function checkAdmin() {
    const session = await auth();
    const role = (session?.user as any)?.role;
    if (!session || !['admin', 'supereditor'].includes(role)) {
        throw new Error("Unauthorized");
    }
    return session.user;
}

export async function createExhibition(data: any) {
    try {
        const user = await checkAdmin();
        await dbConnect();

        const slug = data.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)+/g, '') + '-' + nanoid(6);

        const newExhibition = await Exhibition.create({
            ...data,
            slug,
            createdBy: user.id
        });

        revalidatePath('/dashboard/admin/scheduler');
        return { success: true, id: newExhibition._id.toString() };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function updateExhibition(id: string, data: any) {
    try {
        const user = await checkAdmin();
        await dbConnect();

        await Exhibition.findByIdAndUpdate(id, data);

        revalidatePath('/dashboard/admin/scheduler');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function getExhibition(id: string) {
    try {
        await dbConnect();
        const exhibition = await Exhibition.findById(id).lean();
        return JSON.parse(JSON.stringify(exhibition));
    } catch (error) {
        return null;
    }
}

export async function getAllExhibitions() {
    try {
        await checkAdmin();
        await dbConnect();
        const exhibitions = await Exhibition.find({})
            .sort({ startDate: 1 })
            .select('title slug startDate endDate status coverImage')
            .lean();
        return JSON.parse(JSON.stringify(exhibitions));
    } catch (error) {
        return [];
    }
}
