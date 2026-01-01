'use server';

import { auth } from '@/auth';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import UserCollection from '@/models/UserCollection';
import { decryptCredentials } from '@/lib/encryption';
import { CloudinaryProvider } from '@/lib/storage-providers/cloudinary';
import { revalidatePath } from 'next/cache';

export async function deleteCollectionImage(collectionId: string, imageId: string) {
    try {
        const session = await auth();
        if (!session?.user?.id) throw new Error('No autorizado');

        await dbConnect();

        // Get collection item
        const collectionItem = await UserCollection.findOne({
            _id: collectionId,
            userId: session.user.id
        });

        if (!collectionItem) {
            return { success: false, error: 'Item not found' };
        }

        // Find the image
        const image = collectionItem.images.id(imageId);
        if (!image) {
            return { success: false, error: 'Image not found' };
        }

        // Get user's storage provider
        const user = await User.findById(session.user.id).select('+storageProvider.credentials storageProvider');

        if (user?.storageProvider?.credentials) {
            // Delete from storage provider
            const credentials = decryptCredentials(user.storageProvider.credentials, session.user.id);

            if (user.storageProvider.type === 'cloudinary') {
                const provider = new CloudinaryProvider(credentials);
                await provider.delete(image.url, session.user.id);
            }
        }

        // Remove from database
        collectionItem.images.pull(imageId);
        await collectionItem.save();

        revalidatePath(`/dashboard/collection/${collectionId}`);
        return { success: true };
    } catch (error: any) {
        console.error('Delete image error:', error);
        return { success: false, error: error.message };
    }
}

export async function setPrimaryImage(collectionId: string, imageId: string) {
    try {
        const session = await auth();
        if (!session?.user?.id) throw new Error('No autorizado');

        await dbConnect();

        // Get collection item
        const collectionItem = await UserCollection.findOne({
            _id: collectionId,
            userId: session.user.id
        });

        if (!collectionItem) {
            return { success: false, error: 'Item not found' };
        }

        // Set all images to non-primary
        collectionItem.images.forEach((img: any) => {
            img.isPrimary = false;
        });

        // Set selected image as primary
        const image = collectionItem.images.id(imageId);
        if (image) {
            image.isPrimary = true;
        }

        await collectionItem.save();

        revalidatePath(`/dashboard/collection/${collectionId}`);
        return { success: true };
    } catch (error: any) {
        console.error('Set primary image error:', error);
        return { success: false, error: error.message };
    }
}
