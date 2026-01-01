'use server';

import dbConnect from '@/lib/db';
import Instrument from '@/models/Instrument';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';
import { InstrumentSchema } from '@/lib/schemas';

// Helper to sanitize Mongoose documents for client
function sanitize(doc: any) {
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
            subtype: data.get('subtype'),
            brand: data.get('brand'),
            model: data.get('model'),
            version: data.get('version'),
            years: data.get('years')?.toString().split(',').map(y => y.trim()).filter(y => y),
            description: data.get('description'),
            specs: data.get('specs') ? JSON.parse(data.get('specs') as string) : [],
            genericImages: data.get('genericImages') ? JSON.parse(data.get('genericImages') as string) : [],
            documents: data.get('documents') ? JSON.parse(data.get('documents') as string) : [],
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
            createdBy: (session.user as any).id,
        };

        const instrument = await Instrument.create(instrumentData);

        revalidatePath('/instruments');
        return { success: true, id: instrument._id.toString() };
    } catch (error: any) {
        console.error('Create Instrument Error:', error);
        return { success: false, error: error.message };
    }
}

export async function getInstruments(query?: string) {
    try {
        await dbConnect();

        const filter = query
            ? {
                $or: [
                    { brand: { $regex: query, $options: 'i' } },
                    { model: { $regex: query, $options: 'i' } }
                ]
            }
            : {};

        const instruments = await Instrument.find(filter).sort({ brand: 1, model: 1 });
        return instruments.map(doc => ({
            ...doc.toObject(),
            _id: doc._id.toString(),
            createdBy: doc.createdBy?.toString(),
        }));
    } catch (error) {
        console.error('Get Instruments Error:', error);
        return [];
    }
}

export async function getInstrumentById(id: string) {
    try {
        await dbConnect();
        const instrument = await Instrument.findById(id).lean();
        if (!instrument) return null;

        // Deep sanitize by serializing to JSON
        // This handles _id inside arrays (specs) and other nested paths
        return JSON.parse(JSON.stringify(instrument));
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
            subtype: data.get('subtype'),
            brand: data.get('brand'),
            model: data.get('model'),
            version: data.get('version'),
            years: data.get('years')?.toString().split(',').map(y => y.trim()).filter(y => y),
            description: data.get('description'),
            specs: data.get('specs') ? JSON.parse(data.get('specs') as string) : undefined,
            genericImages: data.get('genericImages') ? JSON.parse(data.get('genericImages') as string) : undefined,
            documents: data.get('documents') ? JSON.parse(data.get('documents') as string) : undefined,
        };

        // Remove undefined fields so we don't validate things we aren't updating (though here we seem to update everything)
        Object.keys(rawUpdateData).forEach(key => (rawUpdateData as any)[key] === undefined && delete (rawUpdateData as any)[key]);

        // Validate with Zod - Use partial() for updates if we were doing partial updates, 
        // but here the form sends substantial data. However, genericImages/documents might be undefined in rawUpdateData if not present.
        // InstrumentSchema expects arrays if present.
        // Let's use InstrumentSchema and allow partials or check logic.
        // Since the form resubmits everything, full schema validation is safer, but we need to handle "undefined" optional fields correctly if Zod expects them.

        // Actually, looking at the schema: optional fields are optional.
        const validatedData = InstrumentSchema.partial().safeParse(rawUpdateData);

        if (!validatedData.success) {
            const errorMessage = validatedData.error.issues.map(e => e.message).join(', ');
            return { success: false, error: errorMessage };
        }

        const validKeys = Object.keys(validatedData.data);
        console.log('Valid keys to update:', validKeys);

        await Instrument.findByIdAndUpdate(id, validatedData.data);

        revalidatePath('/instruments');
        revalidatePath(`/instruments/${id}`);

        return {
            success: true,
            debug: {
                receivedImages: rawUpdateData.genericImages,
                receivedDocs: rawUpdateData.documents,
                validKeys: validKeys,
                validationError: !validatedData.success ? validatedData.error : null
            }
        };
    } catch (error: any) {
        console.error('Update Instrument Error:', error);
        return { success: false, error: error.message };
    }
}
