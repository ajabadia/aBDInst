'use server';

import dbConnect from '@/lib/db';
import Instrument from '@/models/Instrument';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';
import { InstrumentSchema } from '@/lib/schemas';
import { escapeRegExp } from '@/lib/utils';

// Helper to sanitize Mongoose documents for client
function sanitize(doc: Record<string, any>) {
    const { _id, ...rest } = doc.toObject ? doc.toObject() : doc;
    return { id: _id.toString(), ...rest };
}

export async function createInstrument(data: FormData) {
    try {
        const session = await auth();
        if (!session || !['admin', 'editor'].includes((session.user as any).role)) {
            throw new Error('Unauthorized');
        }

        await dbConnect();

        const rawData = {
            type: data.get('type'),
            subtype: data.get('subtype')?.toString() || undefined,
            brand: data.get('brand'),
            model: data.get('model'),
            version: data.get('version')?.toString() || undefined,
            years: data.get('years')?.toString().split(',').map(y => y.trim()).filter(y => y),
            description: data.get('description')?.toString(),
            websites: data.get('websites')
                ? Array.from(new Map((JSON.parse(data.get('websites') as string) as any[]).map(w => [w.url, w])).values())
                : [],
            specs: data.get('specs') ? JSON.parse(data.get('specs') as string) : [],
            genericImages: data.get('genericImages') ? JSON.parse(data.get('genericImages') as string) : [],
            documents: data.get('documents') ? JSON.parse(data.get('documents') as string) : [],
            relatedTo: data.get('relatedTo') ? JSON.parse(data.get('relatedTo') as string) : [],

            // Variants
            parentId: data.get('parentId')?.toString() || undefined,
            variantLabel: data.get('variantLabel')?.toString() || undefined,
            excludedImages: data.get('excludedImages') ? JSON.parse(data.get('excludedImages') as string) : [],
            isBaseModel: data.get('isBaseModel') === 'true',
        };

        // Validate with Zod
        const validatedData = InstrumentSchema.safeParse(rawData);

        if (!validatedData.success) {
            // Flatten errors to a single string or map
            const errorMessage = validatedData.error.issues.map(e => e.message).join(', ');
            return { success: false, error: errorMessage };
        }

        const instrumentData = {
            ...validatedData.data,
            createdBy: session.user.id,
        };

        const instrument = await Instrument.create(instrumentData);

        revalidatePath('/instruments');
        return { success: true, id: instrument._id.toString() };
    } catch (error: any) {
        console.error('Create Instrument Error:', error);
        return { success: false, error: error.message };
    }
}

export async function getInstruments(
    query?: string,
    category?: string | null,
    sortBy: 'brand' | 'model' | 'year' | 'type' = 'brand',
    sortOrder: 'asc' | 'desc' = 'asc',
    brand?: string | null
) {
    try {
        await dbConnect();

        const filter: Record<string, any> = {};

        if (query) {
            const safeQuery = escapeRegExp(query);
            filter.$or = [
                { brand: { $regex: safeQuery, $options: 'i' } },
                { model: { $regex: safeQuery, $options: 'i' } }
            ];
        }

        if (category) {
            const safeCategory = escapeRegExp(category);
            filter.type = { $regex: new RegExp(`^${safeCategory}$`, 'i') };
        }

        if (brand) {
            const safeBrand = escapeRegExp(brand);
            filter.brand = { $regex: new RegExp(`^${safeBrand}$`, 'i') };
        }

        // Determine Sort Object
        let sort: Record<string, any> = {};
        const dir = sortOrder === 'asc' ? 1 : -1;

        switch (sortBy) {
            case 'brand':
                sort = { brand: dir, model: 1 };
                break;
            case 'model':
                sort = { model: dir };
                break;
            case 'type':
                sort = { type: dir, brand: 1 };
                break;
            case 'year':
                // Sort by the first year in the array
                sort = { 'years.0': dir, brand: 1 };
                break;
            default:
                sort = { brand: 1, model: 1 };
        }

        // Optimize: Select only necessary fields and use lean()
        const instruments = await Instrument.find(filter)
            .select('brand model type subtype genericImages years description variantLabel websites')
            .sort(sort)
            .lean();

        // Efficient transformation to plain objects for Server Components
        const safeInstruments = JSON.parse(JSON.stringify(instruments));
        return safeInstruments.map((inst: Record<string, any>) => ({
            ...inst,
            _id: inst._id.toString(),
            id: inst._id.toString()
        }));
    } catch (error) {
        console.error('Get Instruments Error:', error);
        return [];
    }
}

export async function getBrands() {
    try {
        await dbConnect();
        const brands = await Instrument.distinct('brand');
        return brands.sort();
    } catch (error) {
        console.error('Get Brands Error:', error);
        return [];
    }
}

import { mergeInstruments } from '@/lib/inheritance';

export async function getInstrumentById(id: string) {
    try {
        await dbConnect();
        const instrument = await Instrument.findById(id)
            .populate('relatedTo', 'brand model variantLabel')
            .populate('parentId', 'brand model variantLabel')
            .lean();

        if (!instrument) return null;

        // Recursive inheritance
        let effectiveInstrument = JSON.parse(JSON.stringify(instrument));
        let currentParentId = (instrument as any).parentId?._id || (instrument as any).parentId;

        const hierarchy: any[] = [];

        while (currentParentId) {
            // Prevent infinite loops if database has cycles
            if (currentParentId.toString() === id.toString()) break;

            // Prevent duplicates in hierarchy
            if (hierarchy.some((p: any) => p._id.toString() === currentParentId.toString())) break;

            const parent = await Instrument.findById(currentParentId).lean() as any;
            if (!parent) break;

            effectiveInstrument = mergeInstruments(effectiveInstrument, JSON.parse(JSON.stringify(parent)));

            // Add to hierarchy
            hierarchy.push(JSON.parse(JSON.stringify(parent)));

            currentParentId = parent.parentId;
        }

        const variants = await Instrument.find({ parentId: id }).select('brand model variantLabel genericImages').lean();

        // Enforce uniqueness in hierarchy to prevent React duplicate key errors
        const uniqueHierarchy = Array.from(new Map(hierarchy.map((item: any) => [item._id.toString(), item])).values());

        // Safe return (ensure full serialization)
        const safeResult = JSON.parse(JSON.stringify({
            ...effectiveInstrument,
            _hierarchy: uniqueHierarchy,
            _variants: variants
        }));

        return safeResult;
    } catch (error) {
        console.error('Get Instrument Error:', error);
        return null;
    }
}

export async function updateInstrument(id: string, data: FormData) {
    try {
        const session = await auth();
        if (!session || !['admin', 'editor'].includes((session.user as any).role)) {
            throw new Error('Unauthorized');
        }

        await dbConnect();

        const rawUpdateData = {
            type: data.get('type'),
            subtype: data.get('subtype')?.toString() || undefined,
            brand: data.get('brand'),
            model: data.get('model'),
            version: data.get('version')?.toString() || undefined,
            years: data.get('years')?.toString().split(',').map(y => y.trim()).filter(y => y),
            description: data.get('description')?.toString(),
            websites: data.get('websites')
                ? Array.from(new Map((JSON.parse(data.get('websites') as string) as any[]).map(w => [w.url, w])).values())
                : [],
            specs: data.get('specs') ? JSON.parse(data.get('specs') as string) : [],
            genericImages: data.get('genericImages') ? JSON.parse(data.get('genericImages') as string) : [],
            documents: data.get('documents') ? JSON.parse(data.get('documents') as string) : [],

            relatedTo: data.get('relatedTo') ? JSON.parse(data.get('relatedTo') as string) : [],
            marketValue: data.get('marketValue') ? JSON.parse(data.get('marketValue') as string) : undefined,

            // Variants
            parentId: data.get('parentId')?.toString() || undefined,
            variantLabel: data.get('variantLabel')?.toString() || undefined,
            excludedImages: data.get('excludedImages') ? JSON.parse(data.get('excludedImages') as string) : [],
            isBaseModel: data.get('isBaseModel') === 'true',
        };

        // Remove undefined fields
        Object.keys(rawUpdateData).forEach(key => (rawUpdateData as Record<string, any>)[key] === undefined && delete (rawUpdateData as Record<string, any>)[key]);

        const validatedData = InstrumentSchema.partial().safeParse(rawUpdateData);

        if (!validatedData.success) {
            const errorMessage = validatedData.error.issues.map(e => e.message).join(', ');
            return { success: false, error: errorMessage };
        }

        await Instrument.findByIdAndUpdate(
            id,
            { $set: validatedData.data },
            { runValidators: true, new: true }
        );

        revalidatePath('/instruments');
        revalidatePath(`/instruments/${id}`);

        return { success: true };
    } catch (error: any) {
        console.error('Update Instrument Error:', error);
        return { success: false, error: error.message };
    }
}

export async function getRelatedGear(id: string) {
    try {
        await dbConnect();
        const accessories = await Instrument.find({ relatedTo: id }).lean();
        return JSON.parse(JSON.stringify(accessories));
    } catch (error) {
        console.error('Get Related Gear Error:', error);
        return [];
    }
}

export async function deleteInstruments(ids: string[]) {
    try {
        const session = await auth();
        if (!session || !['admin', 'editor'].includes((session.user as any).role)) {
            throw new Error('Unauthorized');
        }

        await dbConnect();
        await Instrument.deleteMany({ _id: { $in: ids } });

        revalidatePath('/instruments');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
