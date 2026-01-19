
export async function duplicateShowroom(id: string) {
    const session = await (await import('@/auth')).auth();
    if (!session) return { success: false, error: 'Unauthorized' };

    await dbConnect();

    try {
        const sourceShowroom = await Showroom.findOne({ _id: id, userId: session.user.id }).lean();
        if (!sourceShowroom) return { success: false, error: 'Showroom not found' };

        // Cast to any to safely access properties
        const s = sourceShowroom as any;

        const newName = `Copia de ${s.name}`;
        const newSlug = newName.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now().toString().slice(-4);

        // Sanitize items: New IDs will be generated automatically for subdocuments by Mongoose if we don't provide _id
        // But we want to preserve the structure.
        const newItems = s.items.map((item: any) => ({
            collectionId: item.collectionId,
            publicNote: item.publicNote,
            placardText: item.placardText,
            displayOrder: item.displayOrder,
            slides: item.slides, // Copy slides array
            // Do NOT copy _id of the item, let Mongoose generate a new one
        }));

        const newShowroom = await Showroom.create({
            userId: session.user.id,
            name: newName,
            description: s.description,
            slug: newSlug,
            items: newItems,
            theme: s.theme,
            isPublic: false, // Always draft
            status: 'draft',
            visibility: 'private',
            coverImage: s.coverImage,
            kioskEnabled: s.kioskEnabled,
            privacy: s.privacy,
            stats: { views: 0, likes: 0 }
        });

        const { revalidatePath } = await import('next/cache');
        revalidatePath('/dashboard/showrooms');

        return { success: true, data: JSON.parse(JSON.stringify(newShowroom)) };

    } catch (e: any) {
        return { success: false, error: e.message };
    }
}
