'use server';

import dbConnect from '@/lib/db';
import Instrument from '@/models/Instrument';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';

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
            years: data.get('years')?.toString().split(',').map(y => y.trim()),
            description: data.get('description'),
            specs: {
                polyphony: Number(data.get('specs.polyphony')) || undefined,
                oscillators: Number(data.get('specs.oscillators')) || undefined,
                sequencer: data.get('specs.sequencer') === 'on',
                midi: data.get('specs.midi') === 'on',
                weight: Number(data.get('specs.weight')) || undefined,
                dimensions: data.get('specs.dimensions'),
            },
            createdBy: (session.user as any).id,
        };

        const instrument = await Instrument.create(rawData);

        revalidatePath('/instruments');
        return { success: true, id: instrument._id.toString() };
    } catch (error: any) {
        console.error('Create Instrument Error:', error);
        return { success: false, error: error.message };
    }
}

export async function getInstruments() {
    try {
        await dbConnect();
        const instruments = await Instrument.find({}).sort({ brand: 1, model: 1 });
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
        const instrument = await Instrument.findById(id);
        if (!instrument) return null;

        return {
            ...instrument.toObject(),
            _id: instrument._id.toString(),
            createdBy: instrument.createdBy?.toString(),
        };
    } catch (error) {
        console.error('Get Instrument Error:', error);
        return null;
    }
}
