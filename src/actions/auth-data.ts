'use server';

import dbConnect from '@/lib/db';
import User from '@/models/User';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';

/* --- USER DATA --- */

export async function getUsers(page = 1, limit = 20, search = '') {
    try {
        const session = await auth();
        if (!session || (session.user as any)?.role !== 'admin') {
            throw new Error("Acceso denegado");
        }
        
        await dbConnect();
        const query: any = {};
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        const users = await User.find(query)
            .select('name email image role isBanned createdAt')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .lean();

        const total = await User.countDocuments(query);

        return { 
            success: true, 
            users: JSON.parse(JSON.stringify(users)), 
            total,
            pages: Math.ceil(total / limit)
        };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

/* --- BULK OPERATIONS --- */

export async function validateImport(data: any[]) {
    try {
        const session = await auth();
        const userId = (session?.user as any)?.id;
        if (!userId) return { success: false, error: 'Unauthorized' };

        const validItems = data.filter(item => item.brand && item.model);
        const invalidItems = data.filter(item => !item.brand || !item.model);

        return {
            success: true,
            data: {
                total: data.length,
                valid: validItems,
                invalid: invalidItems,
                errors: invalidItems.map(i => `Faltan datos en: ${i.brand || 'Item desconocido'}`)
            }
        };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
