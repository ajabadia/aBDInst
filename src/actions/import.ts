'use server';

import { Instrument } from '@/models/Instrument';
import { UserCollection } from '@/models/UserCollection';
import { connectDB } from '@/lib/db';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';

export async function validateImport(data: any[]) {
    try {
        await connectDB();
        const session = await auth();
        if (!session?.user?.email) return { success: false, error: 'Unauthorized' };

        // 1. Validate Schema Structure
        const validItems: any[] = [];
        const invalidItems: any[] = [];
        const errors: string[] = [];

        // Fetch existing instruments to check for duplicates (fuzzy match could be added later)
        // For now, strict check on Serial Number or Brand+Model+Year

        for (const item of data) {
            const issues: string[] = [];

            if (!item.brand) issues.push('Falta Marca');
            if (!item.model) issues.push('Falta Modelo');

            // Validate Year
            if (item.year) {
                const year = Number(item.year);
                if (isNaN(year) || year < 1900 || year > new Date().getFullYear() + 1) {
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

    } catch (error) {
        console.error('Validation Error:', error);
        return { success: false, error: 'Error validating data' };
    }
}

export async function bulkImport(items: any[]) {
    try {
        await connectDB();
        const session = await auth();
        if (!session?.user?.email) return { success: false, error: 'Unauthorized' };

        const importedIds: string[] = [];

        // This is not a real transaction for MongoDB unless replica set is enabled and configured
        // We will do best-effort sequence

        for (const item of items) {
            // 1. Create or Find Instrument (Master Catalog)
            // Ideally we search first
            const newInstrument = await Instrument.create({
                brand: item.brand,
                model: item.model,
                type: item.type || 'Other',
                year: item.year,
                description: item.description,
                specs: [], // CSV usually doesn't have detailed specs structure
                images: [],
                genericImages: [],
                createdBy: session.user.email
            });

            // 2. Add to User Collection
            await UserCollection.create({
                userId: session.user.id, // We need ID, ensure auth returns it or fetch user
                instrumentId: newInstrument._id,
                status: 'collection',
                condition: item.condition || 'Excellent',
                acquisition: {
                    date: new Date(),
                    price: item.price || 0,
                    currency: 'EUR',
                    origin: 'Imported'
                },
                location: 'Studio',
                notes: `Imported via Bulk Tool. ${item.description || ''}`
            });

            importedIds.push(newInstrument._id.toString());
        }

        revalidatePath('/dashboard');
        revalidatePath('/instruments');

        return { success: true, count: importedIds.length, ids: importedIds };

    } catch (error) {
        console.error('Bulk Import Error:', error);
        return { success: false, error: 'Failed to write to database' };
    }
}
