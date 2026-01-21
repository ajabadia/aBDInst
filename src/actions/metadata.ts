'use server';

import dbConnect from '@/lib/db';
import CatalogMetadata, { ICatalogMetadata } from '@/models/CatalogMetadata';
import { revalidatePath } from 'next/cache';
import { enrichArtistMetadata } from '@/lib/music/enrichment';
import { createSafeAction } from '@/lib/safe-action';
import { CatalogMetadataSchema } from '@/lib/schemas';
import { DatabaseError, NotFoundError, AppError, ValidationError } from '@/lib/errors';
import { logEvent } from '@/lib/logger';
import { z } from 'zod';

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

export const upsertMetadata = createSafeAction(
    CatalogMetadataSchema.partial(),
    async (data, userId, role, correlationId) => {
        if (!data.type || !data.key) {
            throw new Error('Type and Key are required');
        }

        await dbConnect();

        // Ensure label is present, default to key if not
        let updateData: any = {
            ...data,
            label: data.label || data.key
        };

        // If it's an artist and it's new (key doesn't exist yet) or has no images, enrich it
        if (data.type === 'artist') {
            const existing = await CatalogMetadata.findOne({ type: 'artist', key: data.key });
            if (!existing || (!existing.images?.length && !data.images?.length)) {
                await logEvent({
                    nivel: 'INFO',
                    origen: 'METADATA_ACTION',
                    accion: 'ENRICH_ARTIST',
                    mensaje: `Enriqueciendo metadatos para: ${data.label || data.key}`,
                    correlacion_id: correlationId
                });

                const enrichment = await enrichArtistMetadata(data.label || data.key);
                updateData = {
                    ...updateData,
                    assetUrl: data.assetUrl || enrichment.assetUrl,
                    images: data.images?.length ? data.images : enrichment.images,
                    description: data.description || enrichment.description
                };
            }
        }

        try {
            const result = await CatalogMetadata.findOneAndUpdate(
                { type: data.type, key: data.key },
                { $set: updateData },
                { upsert: true, new: true, runValidators: true }
            );

            revalidatePath('/instruments');
            revalidatePath('/dashboard/admin/metadata');

            return sanitize(result);
        } catch (error: any) {
            throw new DatabaseError("Error al guardar metadatos", error);
        }
    },
    { protected: true, allowedRoles: ['admin', 'editor'], name: 'UPSERT_METADATA' }
);

export const deleteMetadata = createSafeAction(
    z.string(),
    async (id, userId, role, correlationId) => {
        await dbConnect();
        try {
            await CatalogMetadata.findByIdAndDelete(id);

            revalidatePath('/instruments');
            revalidatePath('/dashboard/admin/metadata');

            return true;
        } catch (error: any) {
            throw new DatabaseError("Error al eliminar metadato", error);
        }
    },
    { protected: true, allowedRoles: ['admin', 'editor'], name: 'DELETE_METADATA' }
);

export const refreshArtistMetadata = createSafeAction(
    z.string(),
    async (id, userId, role, correlationId) => {
        await dbConnect();
        const artist = await CatalogMetadata.findById(id);
        if (!artist || artist.type !== 'artist') {
            throw new NotFoundError('Artista');
        }

        await logEvent({
            nivel: 'INFO',
            origen: 'METADATA_ACTION',
            accion: 'REFRESH_ARTIST_START',
            mensaje: `Refrescando datos para: ${artist.label}`,
            correlacion_id: correlationId
        });

        try {
            const enrichment = await enrichArtistMetadata(artist.label);

            if (enrichment.images.length > 0 || enrichment.description) {
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
                return sanitize(updated);
            }

            throw new Error('No se encontraron datos nuevos en Discogs');
        } catch (error: any) {
            if (error instanceof AppError) throw error;
            throw new DatabaseError("Error al refrescar datos del artista", error);
        }
    },
    { protected: true, allowedRoles: ['admin', 'editor'], name: 'REFRESH_ARTIST' }
);

export const uploadMetadataAsset = createSafeAction(
    z.instanceof(FormData),
    async (formData, userId, role, correlationId) => {
        const file = formData.get('file') as File;
        if (!file) throw new ValidationError('No se proporcionó ningún archivo');

        await logEvent({
            nivel: 'INFO',
            origen: 'METADATA_ACTION',
            accion: 'UPLOAD_ASSET',
            mensaje: `Subiendo archivo: ${file.name} (${file.type})`,
            correlacion_id: correlationId
        });

        try {
            let buffer = Buffer.from(await file.arrayBuffer());

            const { getStorageProvider } = await import('@/lib/storage-providers/factory');
            const provider = await getStorageProvider(userId);

            const url = await provider.upload(
                new File([buffer], file.name, { type: file.type }),
                userId,
                'instrument-collector/metadata'
            );

            return { url };
        } catch (error: any) {
            throw new AppError("Error al subir archivo de metadatos", 500, 'UPLOAD_ERROR', error);
        }
    },
    { protected: true, allowedRoles: ['admin', 'editor'], name: 'UPLOAD_METADATA_ASSET' }
);
export const batchImportArtists = createSafeAction(
    z.string(),
    async (rawNames, userId, role, correlationId) => {
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

        await logEvent({
            nivel: 'INFO',
            origen: 'METADATA_ACTION',
            accion: 'BATCH_IMPORT_START',
            mensaje: `Iniciando importación masiva de ${names.length} artistas`,
            correlacion_id: correlationId
        });

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

                // Create new artist (upsertMetadata logic internally or call the function?)
                // Since this is a server action, better to implement the core logic here to avoid re-validating etc.
                // But we can call the core logic if it was separate. For now, inline it or call the action but wait for its internal logic.
                // Call upsertMetadata.action directly if we want to bypass wrapper, but safest here is to just use Mongoose.

                const enrichment = await enrichArtistMetadata(name);
                const result = await CatalogMetadata.create({
                    type: 'artist',
                    key,
                    label: name,
                    description: enrichment.description || `Auto-created via batch import.`,
                    assetUrl: enrichment.assetUrl,
                    images: enrichment.images,
                });

                results.push({ name, status: 'created', artistId: result._id.toString() });

            } catch (err: any) {
                results.push({ name, status: 'error', error: err.message });
            }
        }

        revalidatePath('/dashboard/admin/metadata');
        return results;
    },
    { protected: true, allowedRoles: ['admin', 'editor'], name: 'BATCH_IMPORT_ARTISTS' }
);
