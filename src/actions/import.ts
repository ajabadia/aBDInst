'use server';

import Instrument from '@/models/Instrument';
import UserCollection from '@/models/UserCollection';
import dbConnect from '@/lib/db';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';
import { InstrumentSchema } from '@/lib/schemas';

/**
 * Validates the raw data from a CSV/Excel import before proceeding.
 */
export async function validateImport(data: any[]) {
    try {
        await dbConnect();
        const session = await auth();
        if (!session?.user?.id) return { success: false, error: 'Unauthorized' };

        const validItems: any[] = [];
        const invalidItems: any[] = [];
        const errors: string[] = [];

        for (const item of data) {
            const issues: string[] = [];

            // Basic required fields for cataloging
            if (!item.brand) issues.push('Falta Marca');
            if (!item.model) issues.push('Falta Modelo');
            if (!item.type) issues.push('Falta Tipo (ej: Synthesizer)');

            // Validate Year range
            if (item.year) {
                const year = Number(item.year);
                if (isNaN(year) || year < 1800 || year > new Date().getFullYear() + 2) {
                    issues.push(`Año inválido: ${item.year}`);
                }
            }

            if (issues.length > 0) {
                invalidItems.push({ ...item, _errors: issues });
                errors.push(`${item.brand || 'Item'} ${item.model || ''}: ${issues.join(', ')}`);
            } else {
                validItems.push(item);
            }
        }

        return {
            success: true,
            data: {
                total: data.length,
                valid: validItems,
                invalid: invalidItems,
                errors
            }
        };

    } catch (error: any) {
        console.error('Validation Error:', error);
        return { success: false, error: error.message || 'Error validating data' };
    }
}

/**
 * Performs a bulk import:
 * 1. Checks if instrument exists in Master Catalog (to avoid duplicates).
 * 2. Creates new Master Catalog entries if needed.
 * 3. Adds all items to the User's personal collection.
 */
export async function bulkImport(items: any[]) {
    try {
        await dbConnect();
        const session = await auth();
        const userId = (session?.user as any)?.id;
        if (!userId) return { success: false, error: 'Unauthorized' };

        const createdIds: string[] = [];
        let masterAddedCount = 0;

        // Process in a single loop but use a Map to cache Master Instrument IDs and avoid redundant DB hits
        const masterCache = new Map<string, string>();

        for (const item of items) {
            const cacheKey = `${item.brand.toLowerCase().trim()}|${item.model.toLowerCase().trim()}`;
            let instrumentId = masterCache.get(cacheKey);

            if (!instrumentId) {
                // Try to find in DB
                const existing = await Instrument.findOne({
                    brand: { $regex: new RegExp(`^${item.brand.trim()}$`, 'i') },
                    model: { $regex: new RegExp(`^${item.model.trim()}$`, 'i') }
                }).select('_id').lean();

                const doc = existing && (Array.isArray(existing) ? existing[0] : existing);

                if (doc) {
                    instrumentId = (doc as any)._id.toString();
                } else {
                    // Create in Master Catalog
                    const master = await Instrument.create({
                        brand: item.brand.trim(),
                        model: item.model.trim(),
                        type: item.type || 'Other',
                        years: item.year ? [item.year.toString()] : [],
                        createdBy: userId
                    });
                    instrumentId = master._id.toString();
                    masterAddedCount++;
                }
                masterCache.set(cacheKey, instrumentId!);
            }

            // Add to User Collection
            const newCollectionItem = await UserCollection.create({
                userId,
                instrumentId,
                status: 'active',
                condition: mapCondition(item.condition),
                acquisition: {
                    date: item.acquisitionDate ? new Date(item.acquisitionDate) : new Date(),
                    price: Number(item.price) || 0,
                    currency: item.currency || 'EUR',
                    origin: 'Bulk Import'
                },
                serialNumber: item.serialNumber || '',
                notes: `Importado masivamente. ${item.notes || ''}`
            });
            createdIds.push(newCollectionItem._id.toString());
        }

        revalidatePath('/dashboard');
        revalidatePath('/instruments');
        revalidatePath('/u/collection');

        return { 
            success: true, 
            ids: createdIds, 
            count: createdIds.length, 
            masterAdded: masterAddedCount 
        };

    } catch (error: any) {
        console.error('Bulk Import Error:', error);
        return { success: false, error: error.message || 'Failed to complete import' };
    }
}

/**
 * Maps common condition strings to our schema enum
 */
function mapCondition(raw: string): string {
    const c = (raw || '').toLowerCase();
    if (c.includes('new') || c.includes('nuevo')) return 'new';
    if (c.includes('excel') || c.includes('mint')) return 'excellent';
    if (c.includes('good') || c.includes('buen')) return 'good';
    if (c.includes('fair') || c.includes('regular')) return 'fair';
    if (c.includes('poor') || c.includes('mal')) return 'poor';
    if (c.includes('part') || c.includes('piez')) return 'for_parts';
    return 'good';
}
