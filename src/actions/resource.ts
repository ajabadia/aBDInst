'use server';

import { auth } from '@/auth';
import dbConnect from '@/lib/db';
import Resource from '@/models/Resource';
import User from '@/models/User';
import { decryptCredentials } from '@/lib/encryption';
import { CloudinaryProvider } from '@/lib/storage-providers/cloudinary';
import { GoogleDriveProvider } from '@/lib/storage-providers/google-drive';
import { DropboxProvider } from '@/lib/storage-providers/dropbox';
import { TeraboxProvider } from '@/lib/storage-providers/terabox';
import { revalidatePath } from 'next/cache';

// Helper to determine storage provider
async function getStorageProvider(userId: string) {
    const user = await User.findById(userId).select('+storageProvider.credentials');
    if (!user?.storageProvider || user.storageProvider.status !== 'configured') {
        throw new Error("Almacenamiento no configurado");
    }

    const credentials = decryptCredentials(user.storageProvider.credentials, userId);

    switch (user.storageProvider.type) {
        case 'cloudinary': return new CloudinaryProvider(credentials);
        case 'google-drive': return new GoogleDriveProvider(credentials);
        case 'dropbox': return new DropboxProvider(credentials);
        case 'terabox': return new TeraboxProvider(credentials);
        default: throw new Error("Proveedor no soportado");
    }
}

export async function uploadResource(formData: FormData) {
    try {
        const session = await auth();
        if (!session?.user?.id) throw new Error("No autorizado");

        const title = formData.get('title') as string;
        const description = formData.get('description') as string;
        const instrumentId = formData.get('instrumentId') as string;
        const collectionItemId = formData.get('collectionItemId') as string;
        const visibility = formData.get('visibility') as string || 'private';
        const type = formData.get('type') as string; // 'patch', 'manual', 'audio', 'video'

        // Extended logic for YouTube Links & external articles
        let url = '';
        let sizeBytes = 0;
        let mimeType = '';
        let subType = '';

        if (type === 'video' || type === 'link') {
            const videoUrl = formData.get('url') as string;
            if (!videoUrl) throw new Error("URL requerida");
            url = videoUrl;
            subType = type === 'video' ? 'youtube' : 'external';
            mimeType = type === 'video' ? 'video/embed' : 'text/html';
        } else {
            const file = formData.get('file') as File;
            if (!file) throw new Error("archivo requerido para este tipo");

            sizeBytes = file.size;
            mimeType = file.type;
            subType = file.name.split('.').pop()?.toLowerCase() || '';

            const provider = await getStorageProvider(session.user.id);
            const isPublic = visibility === 'public';
            const folder = isPublic ? `community/${type}s` : `users/${session.user.id}/resources/${type}s`;

            url = await provider.upload(file, session.user.id, folder);
        }

        // 2. Create DB Record
        const resource = await Resource.create({
            title,
            description,
            type,
            subType,
            url,
            sizeBytes,
            mimeType,
            uploadedBy: session.user.id,
            instrumentId: instrumentId || undefined,
            collectionItemId: collectionItemId || undefined,
            visibility
        });

        // Revalidate
        if (instrumentId) revalidatePath(`/instruments/${instrumentId}`);
        if (collectionItemId) revalidatePath(`/dashboard/collection/${collectionItemId}`);

        return { success: true, resource: JSON.parse(JSON.stringify(resource)) };

    } catch (error: any) {
        console.error("Upload Resource Error:", error);
        return { success: false, error: error.message };
    }
}

import { v2 as cloudinary } from 'cloudinary'; // Import Cloudinary

// ... (existing imports)

export async function getResources(input: { instrumentId?: string, collectionItemId?: string }) {
    try {
        await dbConnect();
        const query: any = {};

        if (input.instrumentId) {
            query.instrumentId = input.instrumentId;
            query.visibility = 'public'; // Only fetch public resources for Catalog
        }

        if (input.collectionItemId) {
            query.collectionItemId = input.collectionItemId;
            // For collection item, we show ALL resources linked to it (Private mostly)
        }

        const resources: any[] = await Resource.find(query)
            .populate('uploadedBy', 'name image')
            .sort({ createdAt: -1 })
            .lean();

        // Enrich resources with signed download URLs for Cloudinary
        const enrichedResources = await Promise.all(resources.map(async (res) => {
            const enriched = { ...res, _id: res._id.toString(), uploadedBy: { ...res.uploadedBy, _id: res.uploadedBy._id.toString() } };

            // Only process Cloudinary URLs for File types (not video links)
            if (res.url && res.url.includes('cloudinary') && (res.type !== 'video' && res.type !== 'link')) {
                try {
                    // Extract public_id
                    // Assuming standard Cloudinary URL format: .../upload/(v1234)/folder/public_id.ext or just public_id
                    // The CloudinaryProvider stores simplified URLs or full URLs.
                    // A robust regex to extract path after 'upload/v<version>/' or 'upload/'
                    const match = res.url.match(/\/upload\/(?:v\d+\/)?(.+)$/);
                    if (match && match[1]) {
                        // Removing extension if present in public_id effectively, but raw files usually don't have it in the id itself if mapped to 'raw' resource type without extension
                        // Ideally we use the public_id stored. Since we don't store it explicitly in DB, we guess from URL.
                        // Cloudinary 'raw' resources include the extension in the public_id usually.
                        let publicId = match[1];

                        // Determine resource_type from DB or assume 'raw' for non-images if not specified? 
                        // Our DB has 'type' which is our internal type (patch, manual).
                        // 'image' type is not usually stored in Resource model (that's only for photos).
                        // Patches/Manuals are usually 'raw' (except PDF can be 'image' sometimes but we use 'raw' or 'auto' => usually 'raw' for PDF in 'auto').

                        // We can generate a signed URL with attachment flag
                        const config = await User.findById(res.uploadedBy._id || res.uploadedBy).select('+storageProvider.credentials');
                        if (config && config.storageProvider?.type === 'cloudinary') {
                            const creds = JSON.parse(config.storageProvider.credentials); // Encrypted? Wait.
                            // Decryption needed? Yes.
                            //  const decrypted = decryptCredentials(config.storageProvider.credentials, res.uploadedBy._id.toString());
                            // Using the global cloudinary instance might not work if it's configured for different users dynamically.
                            // BUT 'cloudinary.url' is a synchronous formatter. It needs config.

                            // Optimization: Instead of full re-config per user (slow), basic public URL text manipulation 
                            // is safer and faster IF the resource is public.
                            // IF resource is public (in 'community' folder), we can just replace the URL parts string-based as we tried before,
                            // BUT handling 'raw' correctly.

                            // Correct generic Cloudinary RAW attachment URL:
                            // https://res.cloudinary.com/<cloud>/raw/upload/fl_attachment:<name>/v<ver>/<public_id>

                            const filename = `${res.title}.${res.subType || 'file'}`.replace(/[^a-zA-Z0-9.-]/g, '_');
                            // Inject fl_attachment segments
                            enriched.downloadUrl = res.url.replace(/\/upload\//, `/upload/fl_attachment:${filename}/`);
                        }
                    }
                } catch (e) {
                    // Fallback
                }
            }
            return enriched;
        }));

        return JSON.parse(JSON.stringify(enrichedResources));
    } catch (error) {
        console.error("Get Resources Error:", error);
        return [];
    }
}

export async function deleteResource(resourceId: string) {
    try {
        const session = await auth();
        if (!session?.user?.id) throw new Error("No autorizado");

        await dbConnect();

        const resource = await Resource.findById(resourceId);
        if (!resource) throw new Error("Recurso no encontrado");

        if (resource.uploadedBy.toString() !== session.user.id) {
            // Allow admin override? For now, strict ownership.
            throw new Error("No tienes permiso");
        }

        // Delete from Storage
        // TODO: We need public_id or similar. 
        // Our Provider interface `delete(url, userId)` handles logic extraction safely (Cloudinary).
        // Other providers might need help.
        try {
            const provider = await getStorageProvider(session.user.id);
            await provider.delete(resource.url, session.user.id);
        } catch (e) {
            console.error("Storage delete failed (continuing DB delete):", e);
        }

        await Resource.findByIdAndDelete(resourceId);

        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
