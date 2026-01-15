'use server';

import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import UserCollection from "@/models/UserCollection";
import Reminder from "@/models/Reminder";
import { revalidatePath } from "next/cache";

export async function scheduleMaintenance(collectionId: string, date: Date, interval: string, notes: string) {
    try {
        const session = await auth();
        const userId = (session?.user as any)?.id;
        if (!userId) return { success: false, error: "Debes iniciar sesión" };

        await dbConnect();

        // 1. Update Collection Item
        const item = await UserCollection.findOneAndUpdate(
            { _id: collectionId, userId: userId }, // Ensure ownership
            {
                nextMaintenanceDate: date,
                maintenanceInterval: interval,
                maintenanceNotes: notes
            },
            { new: true }
        ).populate('instrumentId', 'brand model');

        if (!item) return { success: false, error: "Instrumento no encontrado" };

        // 2. Create/Update Reminder
        // Check if there's already an active maintenance reminder for this instrument
        const existingReminder = await Reminder.findOne({
            userId: userId,
            instrumentId: collectionId,
            isCompleted: false,
            title: { $regex: /Mantenimiento/i }
        });

        const reminderTitle = `Mantenimiento: ${(item.instrumentId as any).brand} ${(item.instrumentId as any).model}`;

        if (existingReminder) {
            existingReminder.dueDate = date;
            existingReminder.description = notes;
            existingReminder.repeat = mapIntervalToRepeat(interval); // 'weekly', 'monthly', 'yearly' or 'none'
            await existingReminder.save();
        } else {
            await Reminder.create({
                userId: userId,
                instrumentId: collectionId,
                title: reminderTitle,
                description: notes,
                dueDate: date,
                repeat: mapIntervalToRepeat(interval),
                isCompleted: false
            });
        }

        revalidatePath('/dashboard');
        revalidatePath('/dashboard/maintenance');
        revalidatePath(`/dashboard/collection/${collectionId}`);

        return { success: true };

    } catch (error) {
        console.error("Error scheduling maintenance:", error);
        return { success: false, error: "Error al programar mantenimiento" };
    }
}

export async function getUpcomingMaintenance(limit = 10) {
    try {
        const session = await auth();
        const userId = (session?.user as any)?.id;
        if (!userId) return { success: false, data: [] };

        await dbConnect();

        // Get items with nextMaintenanceDate in future (or past/overdue)
        const items = await UserCollection.find({
            userId: userId,
            nextMaintenanceDate: { $ne: null },
            deletedAt: null
        })
            .populate('instrumentId', 'brand model images genericImages')
            .sort({ nextMaintenanceDate: 1 }) // Soonest first
            .limit(limit)
            .lean();

        return { success: true, data: JSON.parse(JSON.stringify(items)) };

    } catch (error) {
        return { success: false, error: "Error fetching maintenance" };
    }
}

function mapIntervalToRepeat(interval: string) {
    switch (interval) {
        case '1w': return 'weekly';
        case '1m': return 'monthly';
        case '3m': return 'none'; // No native quarterly in our simple enum yet
        case '6m': return 'none';
        case '1y': return 'yearly';
        default: return 'none';
    }
}
