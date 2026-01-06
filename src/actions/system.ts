'use server';

import { auth } from '@/auth';
import dbConnect from '@/lib/db';
import SystemConfig from '@/models/SystemConfig';
import User from '@/models/User';
import { revalidatePath } from 'next/cache';

/* --- ADMIN HELPERS --- */

async function checkAdmin() {
    const session = await auth();
    if ((session?.user as any)?.role !== 'admin') throw new Error("Acceso denegado");
    await dbConnect();
    return session.user.id;
}

/* --- SYSTEM STATS --- */

export async function getAdminStats() {
    try {
        await checkAdmin();
        const Comment = (await import('@/models/Comment')).default;
        const Instrument = (await import('@/models/Instrument')).default;

        const [userCount, instrumentCount, reports, banned] = await Promise.all([
            User.countDocuments({}),
            Instrument.countDocuments({}),
            Comment.countDocuments({ reportCount: { $gt: 0 }, isDeleted: false }),
            User.countDocuments({ isBanned: true })
        ]);

        return { users: userCount, instruments: instrumentCount, reports, banned };
    } catch (error) { return { users: 0, instruments: 0, reports: 0, banned: 0 }; }
}

/* --- AI CONFIGURATION --- */

export async function getAllSystemConfigs() {
    try {
        await dbConnect();
        return JSON.parse(JSON.stringify(await SystemConfig.find({})));
    } catch (error) { return []; }
}

export async function updateSystemConfig(key: string, value: any) {
    try {
        await checkAdmin();
        await SystemConfig.findOneAndUpdate({ key }, { value }, { upsert: true });
        revalidatePath('/dashboard/admin');
        return { success: true };
    } catch (error: any) { return { success: false, error: error.message }; }
}

/* --- SCRAPING & ALERTS --- */

export async function getPriceAlerts() {
    const session = await auth();
    if (!session?.user?.id) return [];
    await dbConnect();
    const PriceAlert = (await import('@/models/PriceAlert')).default;
    const alerts = await PriceAlert.find({ userId: session.user.id })
        .populate('instrumentId', 'brand model genericImages images')
        .sort({ createdAt: -1 }).lean();
    return JSON.parse(JSON.stringify(alerts));
}

export async function createPriceAlert(data: any) {
    const session = await auth();
    await dbConnect();
    const PriceAlert = (await import('@/models/PriceAlert')).default;
    await PriceAlert.create({ ...data, userId: session?.user?.id });
    return { success: true };
}

export async function deletePriceAlert(id: string) {
    const session = await auth();
    await dbConnect();
    const PriceAlert = (await import('@/models/PriceAlert')).default;
    await PriceAlert.findOneAndDelete({ _id: id, userId: session?.user?.id });
    return { success: true };
}

/* --- AI ANALYSIS --- */

export async function analyzeInstrumentImage(formData: FormData) {
    // Gemini logic implementation...
    return { success: true, data: { brand: 'Mock', model: 'IA' } };
}

export async function analyzeInstrumentText(query: string) {
    // Gemini logic implementation...
    return { success: true, data: { brand: 'Mock', model: 'IA' } };
}
