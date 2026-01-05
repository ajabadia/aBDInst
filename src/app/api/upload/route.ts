import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getStorageProvider } from '@/lib/storage-providers/factory';

export async function POST(request: Request) {
    try {
        const session = await auth();
        if (!session || !['admin', 'editor', 'normal'].includes((session.user as any).role)) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const formData = await request.formData();
        const file = formData.get('file') as File;
        const context = formData.get('context') as string;

        if (!file) {
            return NextResponse.json({ success: false, error: 'No file received' }, { status: 400 });
        }

        const userId = (session.user as any).id;
        let provider;
        let folder;

        // Force Cloudinary for Master Catalog updates
        if (context === 'catalog') {
            // Use environment variables directly (System Cloudinary)
            /* eslint-disable @typescript-eslint/no-var-requires */
            const { CloudinaryProvider } = require('@/lib/storage-providers/cloudinary');
            provider = new CloudinaryProvider({
                cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
                apiKey: process.env.CLOUDINARY_API_KEY || '',
                apiSecret: process.env.CLOUDINARY_API_SECRET || ''
            });
            folder = 'instruments/catalog'; // Shared folder
        } else {
            // Normal user flow: Use their preferred provider
            provider = await getStorageProvider(userId);
            folder = undefined; // Let provider decide (usually users/${id}/collection)
        }

        // Upload
        const url = await provider.upload(file, userId, folder);

        return NextResponse.json({
            success: true,
            url: url
        });

    } catch (error: any) {
        console.error('🔥 Upload API Fatal Error:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}
