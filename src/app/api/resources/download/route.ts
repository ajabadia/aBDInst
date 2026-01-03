
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Resource from '@/models/Resource';
import { auth } from '@/auth';

export async function GET(req: NextRequest) {
    const searchParams = req.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
        return new NextResponse('Missing resource ID', { status: 400 });
    }

    try {
        await dbConnect();
        const resource = await Resource.findById(id);

        if (!resource) {
            return new NextResponse('Resource not found', { status: 404 });
        }

        // Authorization Check
        // If resource is private, ensure user is owner
        if (resource.visibility === 'private') {
            const session = await auth();
            if (!session?.user || resource.uploadedBy.toString() !== session.user.id) {
                return new NextResponse('Unauthorized', { status: 403 });
            }
        }

        // If it's a link/video (not a file), just redirect
        if (resource.type === 'video' || resource.type === 'link') {
            return NextResponse.redirect(resource.url);
        }

        // Fetch the file from the storage URL
        const fileResponse = await fetch(resource.url);

        if (!fileResponse.ok) {
            console.error(`Failed to fetch file from storage: ${resource.url} (${fileResponse.status})`);
            return new NextResponse('Upstream storage error', { status: 502 });
        }

        // Determine filename
        // Use subType as extension if valid, else fallback
        let extension = resource.subType || 'file';
        // Clean extension (remove dot if present, though subType usually lacks it)
        extension = extension.replace('.', '');

        const filename = `${resource.title}.${extension}`.replace(/[^a-zA-Z0-9.-]/g, '_');

        // Prepare headers for download
        const headers = new Headers();
        headers.set('Content-Disposition', `attachment; filename="${filename}"`);
        headers.set('Content-Type', resource.mimeType || 'application/octet-stream');
        headers.set('Content-Length', resource.sizeBytes.toString());

        return new NextResponse(fileResponse.body, {
            status: 200,
            headers,
        });

    } catch (error) {
        console.error('Download proxy error:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
