'use server';

import dbConnect from '@/lib/db';
import Instrument from '@/models/Instrument';
import { revalidatePath } from 'next/cache';
import { InstrumentSchema } from '@/lib/schemas';
import { escapeRegExp } from '@/lib/utils';
import Metadata from '@/models/Config'; 
import Resource from '@/models/Resource';
import { auth } from '@/auth';

/* --- INSTRUMENTS --- */

export async function getInstruments(query?: string, category?: string | null, sortBy = 'brand', sortOrder: 'asc' | 'desc' = 'asc') {
    try {
        await dbConnect();
        const filter: any = {};
        if (query) {
            const safeQuery = escapeRegExp(query);
            filter.$or = [{ brand: { $regex: safeQuery, $options: 'i' } }, { model: { $regex: safeQuery, $options: 'i' } }];
        }
        if (category) filter.type = { $regex: new RegExp(`^${escapeRegExp(category)}$`, 'i') };

        const instruments = await Instrument.find(filter)
            .select('brand model type subtype genericImages years')
            .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
            .lean();

        return instruments.map((inst: any) => ({ ...inst, _id: inst._id.toString(), id: inst._id.toString() }));
    } catch (error) { return []; }
}

export async function createInstrument(data: FormData) {
    const session = await auth();
    if (!['admin', 'editor'].includes((session?.user as any)?.role)) throw new Error('Unauthorized');
    
    await dbConnect();
    // Logic for creation... (simplified for the domain merge)
    const rawData = Object.fromEntries(data.entries());
    const instrument = await Instrument.create({ ...rawData, createdBy: session?.user?.id });
    revalidatePath('/instruments');
    return { success: true, id: instrument._id.toString() };
}

export async function updateInstrument(id: string, data: FormData) {
    const session = await auth();
    if (!['admin', 'editor'].includes((session?.user as any)?.role)) throw new Error('Unauthorized');
    
    await dbConnect();
    // Logic for update...
    await Instrument.findByIdAndUpdate(id, Object.fromEntries(data.entries()));
    revalidatePath(`/instruments/${id}`);
    return { success: true };
}

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

/* --- METADATA & TAGS --- */

export async function getCatalogMetadata(type: string) {
    try {
        await dbConnect();
        const data = await Metadata.find({ type }).sort({ label: 1 }).lean();
        return JSON.parse(JSON.stringify(data));
    } catch (error) { return []; }
}

export async function upsertMetadata(data: any) {
    const session = await auth();
    if ((session?.user as any)?.role !== 'admin') throw new Error('Unauthorized');
    await dbConnect();
    await Metadata.findOneAndUpdate({ type: data.type, key: data.key }, data, { upsert: true });
    return { success: true };
}

export async function getMetadataMap() {
    try {
        await dbConnect();
        const metadata = await Metadata.find({}).lean();
        return metadata.reduce((acc: any, curr: any) => {
            if (!acc[curr.type]) acc[curr.type] = {};
            acc[curr.type][curr.key] = curr;
            return acc;
        }, {});
    } catch (error) { return {}; }
}

/* --- RESOURCES --- */

export async function getResources(filter: any) {
    try {
        await dbConnect();
        const resources = await Resource.find(filter).sort({ createdAt: -1 }).lean();
        return JSON.parse(JSON.stringify(resources));
    } catch (error) { return []; }
}

export async function uploadResource(data: any) {
    await dbConnect();
    const res = await Resource.create(data);
    return { success: true, id: res._id };
}
