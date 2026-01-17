'use server';

import dbConnect from '@/lib/db';
import Article from '@/models/Article';
import { auth } from '@/auth';
import { nanoid } from 'nanoid';

// Get Articles (Admin/Owner see drafts, Public see published)
export async function getArticles(query: any = {}) {
    await dbConnect();
    const session = await auth();

    const isAdmin = (session?.user as any)?.role === 'admin' || (session?.user as any)?.role === 'editor';
    const filter = isAdmin ? query : { ...query, status: 'published' };

    try {
        const articles = await Article.find(filter)
            .populate('author', 'name image') // Basic author info
            .sort({ createdAt: -1 })
            .lean();

        return JSON.parse(JSON.stringify(articles));
    } catch (error) {
        console.error("Error fetching articles:", error);
        return [];
    }
}

export async function getArticleBySlug(slug: string) {
    await dbConnect();
    const session = await auth();
    const isAdmin = (session?.user as any)?.role === 'admin' || (session?.user as any)?.role === 'editor';

    try {
        const article = await Article.findOne({ slug })
            .populate('author', 'name image bio')
            .populate('relatedInstruments')
            .lean() as any;

        if (!article) return null;
        if (article.status !== 'published' && !isAdmin) return null; // Privacy check

        return JSON.parse(JSON.stringify(article));
    } catch (error) {
        console.error("Error fetching article:", error);
        return null;
    }
}

// CRUD
export async function createArticle(data: any) {
    const session = await auth();
    if (!session || !['admin', 'editor'].includes((session.user as any).role)) {
        return { success: false, error: 'Unauthorized' };
    }

    try {
        await dbConnect();

        const slug = data.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)+/g, '') + '-' + nanoid(6);

        const newArticle = await Article.create({
            ...data,
            slug,
            author: session.user.id
        });

        return { success: true, id: newArticle._id.toString(), slug };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function updateArticle(id: string, data: any) {
    const session = await auth();
    if (!session || !['admin', 'editor'].includes((session.user as any).role)) {
        return { success: false, error: 'Unauthorized' };
    }

    try {
        await dbConnect();
        await Article.findByIdAndUpdate(id, data);
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function deleteArticle(id: string) {
    const session = await auth();
    if (!session || !['admin', 'editor'].includes((session.user as any).role)) {
        return { success: false, error: 'Unauthorized' };
    }

    try {
        await dbConnect();
        await Article.findByIdAndDelete(id);
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
