import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getStorageProvider } from '@/lib/storage-providers/factory';
import Media from '@/models/Media';


export async function POST(req: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const formData = await req.formData();
        const file = formData.get('file') as File;
        const context = formData.get('context') as string || 'showroom';

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        // Determine type
        let type: 'image' | 'audio' | 'video' | 'document' = 'document';
        if (file.type.startsWith('image/')) type = 'image';
        else if (file.type.startsWith('audio/')) type = 'audio';
        else if (file.type.startsWith('video/')) type = 'video';
        else {
            return NextResponse.json({ error: 'Unsupported file type' }, { status: 400 });
        }

        // Validate file size
        const limit = type === 'image' ? 10 : 50; // 10MB images, 50MB audio/video
        if (file.size > limit * 1024 * 1024) {
            return NextResponse.json({ error: `File size too large (max ${limit}MB)` }, { status: 400 });
        }

        const provider = await getStorageProvider(session.user.id);
        const url = await provider.upload(file, session.user.id, context);

        // Register in Media Library
        await Media.create({
            userId: session.user.id,
            url,
            filename: file.name,
            type,
            category: context,
            size: file.size,
            tags: []
        });

        return NextResponse.json({ url, type });
    } catch (error: any) {
        console.error('Upload error:', error);
        return NextResponse.json({ error: error.message || 'Upload failed' }, { status: 500 });
    }
}
