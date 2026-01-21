'use server';

import Media from '@/models/Media';
import { auth } from '@/auth';
import type { IMedia } from '@/models/Media';

export async function getMediaLibrary(limit = 50, page = 1, type = 'image') {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error('Unauthorized');
    }

    const skip = (page - 1) * limit;
    const query = { userId: session.user.id, type };

    try {
        const [items, total] = await Promise.all([
            Media.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Media.countDocuments(query)
        ]);

        // Convert _id to string for serialization
        const serializedItems = items.map((item: any) => ({
            ...item,
            _id: item._id.toString(),
            userId: item.userId.toString(),
            createdAt: item.createdAt.toISOString(),
            updatedAt: item.updatedAt.toISOString()
        }));

        return { items: serializedItems, total, pages: Math.ceil(total / limit) };
    } catch (error) {
        console.error('Error fetching media:', error);
        return { items: [], total: 0, pages: 0, error: 'Failed to fetch media' };
    }
}

export async function deleteMedia(mediaId: string) {
    const session = await auth();
    if (!session?.user?.id) throw new Error('Unauthorized');

    // Note: This only deletes the DB record, not the actual file in S3/Blob
    // In a full implementation, we'd delete the file too via the StorageProvider.
    await Media.deleteOne({ _id: mediaId, userId: session.user.id });
    return { success: true };
}
