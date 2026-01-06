'use server';

import dbConnect from '@/lib/db';
import CatalogMetadata, { ICatalogMetadata } from '@/models/CatalogMetadata';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';

// Helper to sanitize Mongoose documents
function sanitize(doc: any) {
    const { _id, ...rest } = doc.toObject ? doc.toObject() : doc;
    return { id: _id.toString(), ...rest };
}

export async function getCatalogMetadata(type?: string) {
    try {
        await dbConnect();
        const filter = type ? { type } : {};
        const metadata = await CatalogMetadata.find(filter).sort({ label: 1 });
        return metadata.map(sanitize);
    } catch (error) {
        console.error('Get Catalog Metadata Error:', error);
        return [];
    }
}

// Fetch all metadata as a Map for easy lookup [key] -> metadata
export async function getMetadataMap(type?: string) {
    try {
        await dbConnect();
        const filter = type ? { type } : {};
        const metadata = await CatalogMetadata.find(filter);

        const map: Record<string, any> = {};
        metadata.forEach((item) => {
            // Create a unique key if getting all types, otherwise just use the key
            const lookupKey = type ? item.key : `${item.type}:${item.key}`;
            map[lookupKey] = sanitize(item);
        });

        return map;
    } catch (error) {
        console.error('Get Metadata Map Error:', error);
        return {};
    }
}

export async function upsertMetadata(data: Partial<ICatalogMetadata>) {
    try {
        const session = await auth();
        if (!session || !['admin', 'editor'].includes((session.user as any).role)) {
            throw new Error('Unauthorized');
        }

        if (!data.type || !data.key) {
            throw new Error('Type and Key are required');
        }

        await dbConnect();

        // Ensure label is present, default to key if not
        const updateData = {
            ...data,
            label: data.label || data.key
        };

        const result = await CatalogMetadata.findOneAndUpdate(
            { type: data.type, key: data.key },
            { $set: updateData },
            { upsert: true, new: true, runValidators: true }
        );

        revalidatePath('/instruments');
        revalidatePath('/dashboard/admin/metadata');

        return { success: true, data: sanitize(result) };
    } catch (error: any) {
        console.error('Upsert Metadata Error:', error);
        return { success: false, error: error.message };
    }
}

export async function deleteMetadata(id: string) {
    try {
        const session = await auth();
        if (!session || !['admin', 'editor'].includes((session.user as any).role)) {
            throw new Error('Unauthorized');
        }

        await dbConnect();
        await CatalogMetadata.findByIdAndDelete(id);

        revalidatePath('/instruments');
        revalidatePath('/dashboard/admin/metadata');

        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function uploadMetadataAsset(formData: FormData) {
    try {
        const session = await auth();
        // Strict Admin check for metadata
        if (!session || !['admin', 'editor'].includes((session.user as any).role)) {
            throw new Error('Unauthorized');
        }

        const userId = (session.user as any).id;
        const file = formData.get('file') as File;
        if (!file) throw new Error('No file provided');

        // Optimize SVG if needed
        let buffer = Buffer.from(await file.arrayBuffer());

        if (file.type === 'image/svg+xml') {
            const svgContent = buffer.toString('utf-8');
            // Simplified optimization: Replace typical black/hardcoded fills with currentColor or remove them to allow css coloring
            // This is a naive regex approach. For robust handling, use an SVG parser/optimizer llike SVGO in future.
            // For now, we mainly want to ensure no weird dimensions lock it.

            // Note: Cloudinary sanitizes SVGs on upload usually.
            // We just ensure we upload it. Modification in-flight is risky without a parser.
            // Let's rely on CSS 'fill-current' in the frontend for now, 
            // but we can try to strip width/height if present to ensure scaling.
            // const optimizedSvg = svgContent.replace(/width="\d+"/, '').replace(/height="\d+"/, '');
            // buffer = Buffer.from(optimizedSvg);
        }

        const { getStorageProvider } = await import('@/lib/storage-providers/factory');
        const provider = await getStorageProvider(userId);

        // Force 'instrument-collector/metadata' folder
        // Note: provider interface usually takes userId. 
        // We will assume the provider implementation respects customPath if we modified it (we did in step 1 if we pass it).
        // Wait, CloudinaryProvider.upload signature is (file, userId, customPath).

        const url = await provider.upload(
            new File([buffer], file.name, { type: file.type }),
            userId,
            'instrument-collector/metadata'
        );

        console.log('Provider returned URL:', url);

        return { success: true, url };
    } catch (error: any) {
        console.error('Upload Metadata Error:', error);
        return { success: false, error: error.message };
    }
}
