'use server';

import dbConnect from '@/lib/db';
import SystemConfig from '@/models/SystemConfig';
import Article from '@/models/Article';
import { auth } from '@/auth';

export async function getFeaturedContent() {
    await dbConnect();
    // Fetch config
    const config = await SystemConfig.findOne({ key: 'featured_article_id' });

    if (!config?.value) return null;

    try {
        const article = await Article.findById(config.value)
            .populate('author', 'name image')
            .lean();
        return JSON.parse(JSON.stringify(article));
    } catch (e) {
        return null; // Article might be deleted
    }
}

export async function setFeaturedArticle(articleId: string) {
    const session = await auth();
    // Allow admin and supereditor
    const role = (session?.user as any)?.role;
    if (!session || !['admin', 'supereditor'].includes(role)) {
        return { success: false, error: 'Unauthorized' };
    }

    try {
        await dbConnect();
        await SystemConfig.findOneAndUpdate(
            { key: 'featured_article_id' },
            { value: articleId },
            { upsert: true, new: true }
        );
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
