'use server';

import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import Instrument from "@/models/Instrument";
import { revalidatePath } from "next/cache";

export async function addValuation(instrumentId: string, value: number, date: Date, source: string, notes?: string, range?: { min: number, max: number }) {
    try {
        const session = await auth();
        // Allow admin or maybe trusted editors? For now, restriction to admin is safest for "Official Market Value",
        // BUT user wants to log *their* observations?
        // Actually, the "Market Value" is usually a global property of the Instrument in this catalog.
        // If it's the User's observation, currently the schema stores it on `Instrument` (global) based on previous refactor.
        // Let's restrict to 'admin'/'editor' for modifying the Global Instrument Value.

        if (!session?.user) {
            return { success: false, error: "Unauthorized: Please login to add market values" };
        }
        // Removed admin check for personal collector app scaling as per user flow request
        // if (!['admin', 'editor'].includes((session.user as any).role)) { ... }

        await dbConnect();

        const instrument = await Instrument.findById(instrumentId);
        if (!instrument) return { success: false, error: "Instrument not found" };

        if (!instrument.marketValue) {
            instrument.marketValue = { original: {}, current: {}, history: [] };
        }

        if (!instrument.marketValue.history) {
            instrument.marketValue.history = [];
        }

        // Add to history
        const newEntry = {
            date: date,
            value: value,
            min: range?.min,
            max: range?.max,
            source: source,
            notes: notes
        };

        instrument.marketValue.history.push(newEntry);

        // Sort history by date desc
        instrument.marketValue.history.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());

        // Update current snapshot (Source of Truth for generic display)
        instrument.marketValue.current = {
            value: value,
            min: range?.min,
            max: range?.max,
            currency: 'EUR', // Force EUR for now as per requirement
            lastUpdated: new Date(),
            source: source
        };

        // Mark modified because we are touching nested mixed types potentially
        instrument.markModified('marketValue');

        await instrument.save();

        revalidatePath(`/instruments/${instrumentId}`);
        revalidatePath('/dashboard');

        return { success: true };
    } catch (error: any) {
        console.error("Add Valuation Error:", error);
    }
}

export async function deleteValuation(instrumentId: string, historyIndex: number) {
    try {
        const session = await auth();
        if (!session?.user) return { success: false, error: "Unauthorized" };

        await dbConnect();
        const instrument = await Instrument.findById(instrumentId);
        if (!instrument || !instrument.marketValue || !instrument.marketValue.history) {
            return { success: false, error: "Valuation not found" };
        }

        // Remove the item at specific index
        // Note: The index passed must match the server-side array order.
        // History in DB is just an array. If we pass index, we assume client and server are in sync.
        // A safer way would be to pass the ID of the subdocument if they have one, but they are just objects in schema.
        // Let's assume they have _id if Mongoose created them (Mongoose subdocs usually have _ids).
        // Let's check schema: `history: [{ ... }]` -> yes, Mongoose adds _id by default to subdoc arrays unless disabled.

        // Actually, let's use the _id if possible. If not, index.
        // Ideally we receive an ID. The History items in UI likely have _id.
        // But for now let's try to find it by index if the array is stable, OR (better) pass the Item ID.
        // Let's Assume the client passes the _id of the history item.
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function deleteValuationById(instrumentId: string, valuationId: string) {
    try {
        const session = await auth();
        if (!session?.user) return { success: false, error: "Unauthorized" };

        await dbConnect();
        // Use $pull to remove by _id
        await Instrument.updateOne(
            { _id: instrumentId },
            { $pull: { "marketValue.history": { _id: valuationId } } }
        );

        // We also need to re-calculate Current Market Value if we deleted the most recent one!
        // This is tricky. Ideally we fetch, modify, save.

        const instrument = await Instrument.findById(instrumentId);
        if (instrument && instrument.marketValue && instrument.marketValue.history) {
            // Sort desc to find new latest
            const sorted = [...instrument.marketValue.history].sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
            if (sorted.length > 0) {
                const latest = sorted[0];
                instrument.marketValue.current = {
                    value: latest.value,
                    min: latest.min,
                    max: latest.max,
                    currency: latest.currency || 'EUR',
                    lastUpdated: latest.date,
                    source: latest.source
                };
            } else {
                // No history left
                instrument.marketValue.current = {};
            }
            await instrument.save();
        }

        revalidatePath(`/instruments/${instrumentId}`);
        return { success: true };
    } catch (error: any) {
        console.error("Delete Valuation Error:", error);
        return { success: false, error: error.message };
    }
}

// Stub for AI estimation
export async function estimateValueAI(instrumentId: string) {
    // This will connect to the Admin AI agent logic later
    return { success: false, error: "Not implemented yet" };
}
