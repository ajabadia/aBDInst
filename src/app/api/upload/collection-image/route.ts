import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getStorageProvider } from '@/lib/storage-providers/factory';

export async function POST(req: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const formData = await req.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
            return NextResponse.json({ error: 'File must be an image' }, { status: 400 });
        }

        // Validate file size (10MB limit for collection images)
        if (file.size > 10 * 1024 * 1024) {
            return NextResponse.json({ error: 'File size too large (max 10MB)' }, { status: 400 });
        }

        const provider = await getStorageProvider(session.user.id);
        const url = await provider.upload(file, session.user.id, 'collection');

        return NextResponse.json({ url });
    } catch (error: any) {
        console.error('Upload error:', error);
        return NextResponse.json({ error: error.message || 'Upload failed' }, { status: 500 });
    }
}
