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
