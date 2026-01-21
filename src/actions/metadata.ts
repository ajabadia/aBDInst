'use server';

import dbConnect from '@/lib/db';
import CatalogMetadata, { ICatalogMetadata } from '@/models/CatalogMetadata';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';
import { enrichArtistMetadata } from '@/lib/music/enrichment';

// Helper to sanitize Mongoose documents
function sanitize(doc: any) {
    if (!doc) return null;

    // First, convert to plain object if it's a Mongoose document
    let obj = doc.toObject ? doc.toObject({
        getters: true,
        virtuals: false,
        versionKey: false,
        transform: (doc: any, ret: any) => {
            if (ret._id) ret.id = ret._id.toString();
            return ret;
        }
    }) : doc;

    // Force stringify and parse to destroy any hidden non-plain state (buffers, Dates, toJSON methods)
    return JSON.parse(JSON.stringify(obj));
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
        let updateData = {
            ...data,
            label: data.label || data.key
        };

        // If it's an artist and it's new (key doesn't exist yet) or has no images, enrich it
        if (data.type === 'artist') {
            const existing = await CatalogMetadata.findOne({ type: 'artist', key: data.key });
            if (!existing || (!existing.images?.length && !data.images?.length)) {
                console.log(`🔍 Enriching artist metadata for: ${data.label || data.key}`);
                const enrichment = await enrichArtistMetadata(data.label || data.key);
                updateData = {
                    ...updateData,
                    assetUrl: data.assetUrl || enrichment.assetUrl,
                    images: data.images?.length ? data.images : enrichment.images,
                    description: data.description || enrichment.description
                };
            }
        }

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

export async function refreshArtistMetadata(id: string) {
    try {
        const session = await auth();
        if (!session || !['admin', 'editor'].includes((session.user as any).role)) {
            throw new Error('Unauthorized');
        }

        await dbConnect();
        const artist = await CatalogMetadata.findById(id);
        if (!artist || artist.type !== 'artist') {
            throw new Error('Artist not found');
        }

        console.log(`🔄 Refreshing Discogs data for artist: ${artist.label}`);
        const enrichment = await enrichArtistMetadata(artist.label);

        if (enrichment.images.length > 0 || enrichment.description) {
            // Merge images, prefer new ones but keep existing if they were manual?
            // Actually, Discogs refresh usually means "get me the latest/better ones".
            // We rotate images: new Discogs images first.

            const updated = await CatalogMetadata.findByIdAndUpdate(id, {
                $set: {
                    images: enrichment.images,
                    assetUrl: enrichment.assetUrl || artist.assetUrl,
                    description: artist.description && !artist.description.includes('Auto-created')
                        ? artist.description // Keep manual description
                        : enrichment.description || artist.description
                }
            }, { new: true });

            revalidatePath('/dashboard/admin/metadata');
            return { success: true, data: sanitize(updated) };
        }

        return { success: false, error: 'No se encontraron datos nuevos en Discogs' };
    } catch (error: any) {
        console.error('Refresh Artist Error:', error);
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
export async function batchImportArtists(rawNames: string) {
    try {
        const session = await auth();
        if (!session || !['admin', 'editor'].includes((session.user as any).role)) {
            throw new Error('Unauthorized');
        }

        await dbConnect();

        // 1. Clean and split names
        const names = Array.from(new Set(
            rawNames
                .split(/[\n,;]/)
                .map(n => n.trim())
                .filter(n => n.length > 2)
                .filter(n => !/^\d+$/.test(n)) // Filter out purely numeric names
        ));

        const results: Array<{ name: string; status: 'created' | 'exists' | 'error'; error?: string; artistId?: string }> = [];

        // 2. Process each name
        for (const name of names) {
            try {
                // Generate key from name
                const key = name.toLowerCase()
                    .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Remove accents
                    .replace(/[^a-z0-9]/g, '-')
                    .replace(/-+/g, '-')
                    .replace(/^-|-$/g, '');

                // Check if exists
                const existing = await CatalogMetadata.findOne({ type: 'artist', key });
                if (existing) {
                    results.push({ name, status: 'exists', artistId: existing._id.toString() });
                    continue;
                }

                // Create new artist (upsertMetadata handles enrichment)
                const upsertResult = await upsertMetadata({
                    type: 'artist',
                    key,
                    label: name,
                    description: `Auto-created via batch import.`
                });

                if (upsertResult.success) {
                    results.push({ name, status: 'created', artistId: (upsertResult.data as any).id });
                } else {
                    results.push({ name, status: 'error', error: upsertResult.error });
                }
            } catch (err: any) {
                results.push({ name, status: 'error', error: err.message });
            }
        }

        revalidatePath('/dashboard/admin/metadata');
        return { success: true, results };
    } catch (error: any) {
        console.error('Batch Import Error:', error);
        return { success: false, error: error.message };
    }
}
