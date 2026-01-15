'use server';

import dbConnect from '@/lib/db';
import Instrument from '@/models/Instrument';
import { revalidatePath } from 'next/cache';
import { InstrumentSchema } from '@/lib/schemas';
import { escapeRegExp } from '@/lib/utils';
import CatalogMetadata from '@/models/CatalogMetadata'; // CORREGIDO
import Resource from '@/models/Resource';
import { auth } from '@/auth';

/* --- INSTRUMENTS --- */

export async function getInstruments(
    query?: string,
    category?: string | null,
    sortBy = 'brand',
    sortOrder: 'asc' | 'desc' = 'asc',
    limit?: number,
    full = false,
    brand?: string | null,
    minYear?: number | null,
    maxYear?: number | null
) {
    try {
        await dbConnect();
        const filter: Record<string, any> = {};

        // Search Query
        if (query) {
            const safeQuery = escapeRegExp(query);
            filter.$or = [{ brand: { $regex: safeQuery, $options: 'i' } }, { model: { $regex: safeQuery, $options: 'i' } }];
        }

        // Category Filter
        if (category) filter.type = { $regex: new RegExp(`^${escapeRegExp(category)}$`, 'i') };

        // Brand Filter (Fix: Explicitly added)
        if (brand) filter.brand = { $regex: new RegExp(`^${escapeRegExp(brand)}$`, 'i') };

        // Year Range Filter
        if (minYear || maxYear) {
            filter.years = {};
            // Assuming years are stored as 4-digit strings "YYYY"
            if (minYear) filter.years.$gte = String(minYear);
            if (maxYear) filter.years.$lte = String(maxYear);
        }

        let queryBuilder = Instrument.find(filter);
        if (!full) queryBuilder = queryBuilder.select('brand model type subtype genericImages years variantLabel websites');
        if (limit) queryBuilder = queryBuilder.limit(limit);

        const instruments = await queryBuilder
            .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
            .lean();

        const safeInstruments = JSON.parse(JSON.stringify(instruments));
        return safeInstruments.map((inst: Record<string, any>) => ({
            ...inst,
            _id: inst._id.toString(),
            id: inst._id.toString()
        }));
    } catch (error) {
        console.error("getInstruments error:", error);
        return [];
    }
}

export async function getBrands() {
    try {
        await dbConnect();
        const brands = await Instrument.distinct('brand');
        return brands.sort();
    } catch (error) {
        console.error("getBrands error:", error);
        return [];
    }
}

export async function getMetadataMap() {
    try {
        await dbConnect();
        // Usamos el modelo correcto: CatalogMetadata
        const metadata = await CatalogMetadata.find({}).lean();
        const plainMetadata = JSON.parse(JSON.stringify(metadata));

        return plainMetadata.reduce((acc: Record<string, any>, curr: Record<string, any>) => {
            const type = curr.type; // 'brand', 'type', 'decade'
            const key = String(curr.key).toLowerCase().trim();

            if (!acc[type]) acc[type] = {};
            acc[type][key] = curr;
            return acc;
        }, {});
    } catch (error) {
        console.error("getMetadataMap error:", error);
        return {};
    }
}

import { mergeInstruments } from '@/lib/inheritance';

/* --- OTRAS FUNCIONES --- */
export async function getInstrumentById(id: string) {
    try {
        await dbConnect();

        // Fetch current instrument
        const instrument = await Instrument.findById(id)
            .populate('relatedTo', 'brand model variantLabel')
            .populate('parentId', 'brand model variantLabel') // For hierarchy info
            .lean();

        if (!instrument) return null;

        // Recursive inheritance fetching
        let effectiveInstrument = JSON.parse(JSON.stringify(instrument));
        let currentParentId = (instrument as any).parentId?._id || (instrument as any).parentId;

        const hierarchy: any[] = []; // To track the chain

        while (currentParentId) {
            // Prevent infinite loops if database has cycles
            if (currentParentId.toString() === id.toString()) break;

            // Prevent duplicates in hierarchy
            if (hierarchy.some((p: any) => p._id.toString() === currentParentId.toString())) break;

            const parent = await Instrument.findById(currentParentId).lean() as any;
            if (!parent) break;

            // Merge: Parent is the base, child (effective) overrides
            effectiveInstrument = mergeInstruments(effectiveInstrument, JSON.parse(JSON.stringify(parent)));

            // Add to hierarchy
            hierarchy.push(JSON.parse(JSON.stringify(parent)));

            currentParentId = parent.parentId;
        }

        // Fetch children (variants) for bidirectional view
        const variants = await Instrument.find({ parentId: id }).select('brand model variantLabel genericImages').lean();

        // Enforce uniqueness in hierarchy to prevent React duplicate key errors
        const uniqueHierarchy = Array.from(new Map(hierarchy.map((item: any) => [item._id.toString(), item])).values());

        return {
            ...effectiveInstrument,
            _hierarchy: uniqueHierarchy, // Parents
            _variants: JSON.parse(JSON.stringify(variants)) // Children
        };
    } catch (error) {
        console.error("getInstrumentById error:", error);
        return null;
    }
}

export async function getRelatedGear(id: string) {
    try {
        await dbConnect();
        const accessories = await Instrument.find({ relatedTo: id }).lean();
        return JSON.parse(JSON.stringify(accessories));
    } catch (error) {
        console.error("getRelatedGear error:", error);
        return [];
    }
}

export async function getCatalogMetadata(type: string) {
    try {
        await dbConnect();
        const data = await CatalogMetadata.find({ type }).sort({ label: 1 }).lean();
        return JSON.parse(JSON.stringify(data));
    } catch (error) {
        console.error("getCatalogMetadata error:", error);
        return [];
    }
}

export async function upsertMetadata(data: Record<string, any>) {
    const session = await auth();
    if (!session || session.user?.role !== 'admin') throw new Error('Unauthorized');
    await dbConnect();
    await CatalogMetadata.findOneAndUpdate({ type: data.type, key: data.key }, data, { upsert: true });
    return { success: true };
}

export async function deleteMetadata(id: string) {
    const session = await auth();
    if (!session || session.user?.role !== 'admin') throw new Error('Unauthorized');
    await dbConnect();
    await CatalogMetadata.findByIdAndDelete(id);
    return { success: true };
}

export async function getResources(filter: Record<string, any>) {
    try {
        await dbConnect();
        const resources = await Resource.find(filter).sort({ createdAt: -1 }).lean();
        return JSON.parse(JSON.stringify(resources));
    } catch (error) {
        console.error("getResources error:", error);
        return [];
    }
}
