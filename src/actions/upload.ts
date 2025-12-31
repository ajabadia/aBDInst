'use server';

import { v2 as cloudinary } from 'cloudinary';
import { auth } from '@/auth';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadImage(formData: FormData) {
    try {
        const session = await auth();
        if (!session || !['admin', 'editor', 'normal'].includes((session.user as any).role)) {
            throw new Error('Unauthorized');
        }

        const file = formData.get('file') as File;
        if (!file) throw new Error('No file provided');

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        return new Promise<{ success: boolean; url?: string; error?: string }>((resolve) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: 'instrument-collector/instruments',
                    resource_type: 'auto',
                },
                (error, result) => {
                    if (error) {
                        console.error('Cloudinary Upload Error:', error);
                        resolve({ success: false, error: error.message });
                    } else {
                        resolve({ success: true, url: result?.secure_url });
                    }
                }
            );
            uploadStream.end(buffer);
        });

    } catch (error: any) {
        console.error('Upload Action Error:', error);
        return { success: false, error: error.message };
    }
}
