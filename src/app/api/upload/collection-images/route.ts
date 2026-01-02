import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import UserCollection from '@/models/UserCollection';
import { decryptCredentials } from '@/lib/encryption';
import { CloudinaryProvider } from '@/lib/storage-providers/cloudinary';
import { GoogleDriveProvider } from '@/lib/storage-providers/google-drive';
import { DropboxProvider } from '@/lib/storage-providers/dropbox';
import { TeraboxProvider } from '@/lib/storage-providers/terabox';

export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        // Get user's storage provider
        const user = await User.findById(session.user.id).select('+storageProvider.credentials storageProvider');

        if (!user?.storageProvider?.credentials || user.storageProvider.type === 'none') {
            return NextResponse.json({
                error: 'No storage provider configured. Please configure storage in Settings.'
            }, { status: 400 });
        }

        // Parse form data
        const formData = await request.formData();
        const collectionId = formData.get('collectionId') as string;
        const images = formData.getAll('images') as File[];

        if (!collectionId || images.length === 0) {
            return NextResponse.json({ error: 'Missing data' }, { status: 400 });
        }

        // Verify collection belongs to user
        const collectionItem = await UserCollection.findOne({
            _id: collectionId,
            userId: session.user.id
        });

        if (!collectionItem) {
            return NextResponse.json({ error: 'Collection item not found' }, { status: 404 });
        }

        // Decrypt credentials
        const credentials = decryptCredentials(user.storageProvider.credentials, session.user.id);

        // Initialize provider
        let provider;
        if (user.storageProvider.type === 'cloudinary') {
            provider = new CloudinaryProvider(credentials);
        } else if (user.storageProvider.type === 'google-drive') {
            provider = new GoogleDriveProvider(credentials);
        } else if (user.storageProvider.type === 'dropbox') {
            provider = new DropboxProvider(credentials);
        } else if (user.storageProvider.type === 'terabox') {
            provider = new TeraboxProvider(credentials);
        } else {
            return NextResponse.json({ error: 'Provider not supported' }, { status: 400 });
        }

        // Upload images
        const uploadedImages = [];
        for (const image of images) {
            const buffer = Buffer.from(await image.arrayBuffer());
            const customPath = `users/${session.user.id}/collection/${collectionId}`;

            const url = await provider.upload(buffer, session.user.id, customPath);

            uploadedImages.push({
                url,
                provider: user.storageProvider.type,
                path: customPath,
                type: 'user_photo',
                uploadedAt: new Date(),
                isPrimary: collectionItem.images.length === 0 // First image is primary
            });
        }

        // Update collection
        await UserCollection.findByIdAndUpdate(collectionId, {
            $push: { images: { $each: uploadedImages } }
        });

        return NextResponse.json({
            success: true,
            uploaded: uploadedImages.length
        });

    } catch (error: any) {
        console.error('Upload error:', error);
        return NextResponse.json({
            error: error.message || 'Upload failed'
        }, { status: 500 });
    }
}
