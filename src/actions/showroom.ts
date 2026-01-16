'use server';

import dbConnect from '@/lib/db';
import Showroom from '@/models/Showroom';
import UserCollection from '@/models/UserCollection';
import { auth } from '@/auth';
import { nanoid } from 'nanoid';
import { revalidatePath } from 'next/cache';

// --- CREATE ---
export async function createShowroom(data: { name: string; description?: string; theme?: string }) {
    const session = await auth();
    if (!session?.user?.email) return { success: false, error: "Unauthorized" };

    try {
        await dbConnect();
        // Get User ID from session (assuming User model or adapter logic, skipping direct User lookup for brevity if session has id)
        // If session.user.id is not populated by default authjs adapter, we might need to fetch it.
        // Assuming session.user.id exists as typical in this project flow or we use email.
        // Let's rely on finding user by email if needed, but for now assuming session.user.id is accessible or I need to fetch user.
        // Quick Fix: Fetch user via email to get _id reliably.
        const { default: User } = await import('@/models/User');
        const user = await User.findOne({ email: session.user.email });
        if (!user) return { success: false, error: "User not found" };

        const slug = nanoid(10); // Short URL friendly ID

        const newShowroom = await Showroom.create({
            userId: user._id,
            name: data.name,
            slug,
            description: data.description,
            theme: data.theme || 'minimal',
            items: [],
            isPublic: true
        });

        revalidatePath('/dashboard/showrooms');
        return { success: true, data: JSON.parse(JSON.stringify(newShowroom)) };
    } catch (error) {
        console.error("Error creating showroom:", error);
        return { success: false, error: "Failed to create showroom" };
    }
}

// --- READ (Private List) ---
export async function getUserShowrooms() {
    const session = await auth();
    if (!session?.user?.email) return [];

    try {
        await dbConnect();
        const { default: User } = await import('@/models/User');
        const user = await User.findOne({ email: session.user.email });
        if (!user) return [];

        const showrooms = await Showroom.find({ userId: user._id }).sort({ createdAt: -1 });
        return JSON.parse(JSON.stringify(showrooms));
    } catch (error) {
        console.error(error);
        return [];
    }
}

// --- READ (Public Single) ---
export async function getPublicShowroom(slug: string) {
    try {
        await dbConnect();
        const showroom = await Showroom.findOne({ slug, isPublic: true })
            .populate({
                path: 'userId',
                select: 'name image' // Only show basic owner info
            });

        if (!showroom) return null;

        // Fetch items manually to control privacy filters better than simple populate
        // We iterate showroom.items ids and fetch from UserCollection
        const itemIds = showroom.items.map((i: any) => i.collectionId);

        // We need lookup for the actual instrument data too (Instrument Catalog)
        // This aggregation/populate can be heavy. Let's do a robust populate.
        const populatedItems = await UserCollection.find({ _id: { $in: itemIds } })
            .populate('instrumentId') // Populate catalog data
            .lean();

        // MERGE & FILTER (Privacy Logic)
        const privacy = showroom.privacy;
        const finalItems = showroom.items.map((showroomItem: any) => {
            const foundItem: any = populatedItems.find((i: any) => i._id.toString() === showroomItem.collectionId.toString());
            if (!foundItem) return null;

            // Apply Privacy Restrictions
            const cleanItem = {
                ...foundItem,
                acquisition: privacy.showPrices || privacy.showAcquisitionDate ? {
                    price: privacy.showPrices ? foundItem.acquisition.price : undefined,
                    currency: privacy.showPrices ? foundItem.acquisition.currency : undefined,
                    date: privacy.showAcquisitionDate ? foundItem.acquisition.date : undefined,
                } : undefined,
                serialNumber: privacy.showSerialNumbers ? foundItem.serialNumber : undefined,
                // Always keep safe fields
                _id: foundItem._id,
                images: foundItem.images,
                userImages: foundItem.userImages,
                status: foundItem.status,
                // Showroom specific notes
                publicNote: showroomItem.publicNote,
                displayOrder: showroomItem.displayOrder
            };

            return cleanItem;
        }).filter(Boolean);

        // Increment View Count (Fire and forget, don't await blocking)
        Showroom.updateOne({ _id: showroom._id }, { $inc: { 'stats.views': 1 } }).exec();

        const result = {
            ...showroom.toObject(),
            items: finalItems
        };

        return JSON.parse(JSON.stringify(result));

    } catch (error) {
        console.error("Error fetching public showroom:", error);
        return null;
    }
}

// --- UPDATE ---
export async function updateShowroom(id: string, data: any) {
    const session = await auth();
    if (!session?.user?.email) return { success: false, error: "Unauthorized" };

    try {
        await dbConnect();
        const { default: User } = await import('@/models/User');
        const user = await User.findOne({ email: session.user.email });

        // Ensure ownership
        const showroom = await Showroom.findOne({ _id: id, userId: user._id });
        if (!showroom) return { success: false, error: "Showroom not found or unauthorized" };

        Object.assign(showroom, data);
        await showroom.save();

        revalidatePath('/dashboard/showrooms');
        if (showroom.slug) revalidatePath(`/s/${showroom.slug}`);

        return { success: true };
    } catch (error) {
        console.error(error);
        return { success: false, error: "Update failed" };
    }
}

// --- DELETE ---
export async function deleteShowroom(id: string) {
    const session = await auth();
    if (!session?.user?.email) return { success: false, error: "Unauthorized" };

    try {
        await dbConnect();
        const { default: User } = await import('@/models/User');
        const user = await User.findOne({ email: session.user.email });

        await Showroom.deleteOne({ _id: id, userId: user._id });
        revalidatePath('/dashboard/showrooms');
        return { success: true };
    } catch (error) {
        return { success: false, error: "Delete failed" };
    }
}
