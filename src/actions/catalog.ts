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
    full = false
) {
    try {
        await dbConnect();
        const filter: any = {};
        if (query) {
            const safeQuery = escapeRegExp(query);
            filter.$or = [{ brand: { $regex: safeQuery, $options: 'i' } }, { model: { $regex: safeQuery, $options: 'i' } }];
        }
        if (category) filter.type = { $regex: new RegExp(`^${escapeRegExp(category)}$`, 'i') };

        let queryBuilder = Instrument.find(filter);
        if (!full) queryBuilder = queryBuilder.select('brand model type subtype genericImages years');
        if (limit) queryBuilder = queryBuilder.limit(limit);

        const instruments = await queryBuilder
            .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
            .lean();

        return instruments.map((inst: any) => ({ 
            ...inst, 
            _id: inst._id.toString(), 
            id: inst._id.toString() 
        }));
    } catch (error) { return []; }
}

export async function getMetadataMap() {
    try {
        await dbConnect();
        // Usamos el modelo correcto: CatalogMetadata
        const metadata = await CatalogMetadata.find({}).lean();
        const plainMetadata = JSON.parse(JSON.stringify(metadata));
        
        return plainMetadata.reduce((acc: any, curr: any) => {
            const type = curr.type; // 'brand', 'type', 'decade'
            const key = String(curr.key).toLowerCase().trim();
            
            if (!acc[type]) acc[acc[type]] = {}; // Fix typo acc[type]
            if (!acc[type]) acc[type] = {};
            acc[type][key] = curr;
            return acc;
        }, {});
    } catch (error) { return {}; }
}

/* --- OTRAS FUNCIONES --- */
export async function getInstrumentById(id: string) {
    try {
        await dbConnect();
        const instrument = await Instrument.findById(id).populate('relatedTo', 'brand model').lean();
        return instrument ? JSON.parse(JSON.stringify(instrument)) : null;
    } catch (error) { return null; }
}

export async function getRelatedGear(id: string) {
    try {
        await dbConnect();
        const accessories = await Instrument.find({ relatedTo: id }).lean();
        return JSON.parse(JSON.stringify(accessories));
    } catch (error) { return []; }
}

export async function getCatalogMetadata(type: string) {
    try {
        await dbConnect();
        const data = await CatalogMetadata.find({ type }).sort({ label: 1 }).lean();
        return JSON.parse(JSON.stringify(data));
    } catch (error) { return []; }
}

export async function upsertMetadata(data: any) {
    const session = await auth();
    if ((session?.user as any)?.role !== 'admin') throw new Error('Unauthorized');
    await dbConnect();
    await CatalogMetadata.findOneAndUpdate({ type: data.type, key: data.key }, data, { upsert: true });
    return { success: true };
}

export async function deleteMetadata(id: string) {
    const session = await auth();
    if ((session?.user as any)?.role !== 'admin') throw new Error('Unauthorized');
    await dbConnect();
    await CatalogMetadata.findByIdAndDelete(id);
    return { success: true };
}

export async function getResources(filter: any) {
    try {
        await dbConnect();
        const resources = await Resource.find(filter).sort({ createdAt: -1 }).lean();
        return JSON.parse(JSON.stringify(resources));
    } catch (error) { return []; }
}
