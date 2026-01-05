'use server';

import dbConnect from '@/lib/db';
import Instrument from '@/models/Instrument';

export async function getInstrumentPdfData(id: string) {
    try {
        await dbConnect();
        const instrument = await Instrument.findById(id).lean();
        if (!instrument) return { success: false, error: "Instrumento no encontrado" };

        // We return the raw data so the client-side generator can use it
        // This avoids complex PDF generation on server (fonts, images, etc.)
        return { 
            success: true, 
            data: JSON.parse(JSON.stringify(instrument)) 
        };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
