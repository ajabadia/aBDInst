import { v2 as cloudinary } from 'cloudinary';
import { IStorageProvider, ImageTransformations } from './index';

export class CloudinaryProvider implements IStorageProvider {
    private cloudName: string;
    private apiKey: string;
    private apiSecret: string;

    constructor(credentials: { cloudName: string; apiKey: string; apiSecret: string }) {
        this.cloudName = credentials.cloudName;
        this.apiKey = credentials.apiKey;
        this.apiSecret = credentials.apiSecret;

        cloudinary.config({
            cloud_name: this.cloudName,
            api_key: this.apiKey,
            api_secret: this.apiSecret,
        });
    }

    async upload(file: File | Buffer, userId: string, customPath?: string): Promise<string> {
        try {
            // Convert File to Buffer if needed
            const buffer = file instanceof File ? Buffer.from(await file.arrayBuffer()) : file;

            // Determine MIME type
            let mimeType = 'application/octet-stream';
            if (file instanceof File) {
                mimeType = file.type;
            } else {
                // Basic magic number check or default
                // This is a simplified check, for production verify-magic-bytes is better
                mimeType = 'image/jpeg';
            }

            const isSvg = mimeType === 'image/svg+xml';

            // Upload to Cloudinary with user-specific folder
            // Upload to Cloudinary with user-specific folder and unique suffix
            const filenameRegex = /(.+?)(\.[^.]*$|$)/;
            const originalName = (file instanceof File ? file.name : 'image').replace(/\.[^/.]+$/, "");
            const uniqueSuffix = `${Date.now()}-${Math.random().toString(36).substring(7)}`;
            const publicId = `${originalName}-${uniqueSuffix}`;

            const folder = customPath || `users/${userId}/collection`;

            const uploadOptions: any = {
                folder,
                public_id: publicId, // Manually set unique public_id
                resource_type: 'auto',
            };

            // Only apply transformations for non-vector images
            if (!isSvg) {
                uploadOptions.transformation = [
                    { width: 2000, crop: 'limit' }, // Max width
                    { quality: 'auto:good' },
                    { fetch_format: 'auto' }
                ];
            }

            const result = await cloudinary.uploader.upload(
                `data:${mimeType};base64,${buffer.toString('base64')}`,
                uploadOptions
            );

            console.log('Cloudinary Upload Result:', { public_id: result.public_id, secure_url: result.secure_url, url: result.url });

            return result.secure_url;
        } catch (error: any) {
            console.error('Cloudinary upload error:', error);
            throw new Error(`Upload failed: ${error.message}`);
        }
    }

    async delete(url: string, userId: string): Promise<boolean> {
        try {
            // Extract public_id from URL
            const publicId = this.extractPublicId(url);

            // Verify it belongs to this user
            if (!publicId.startsWith(`users/${userId}/`)) {
                throw new Error('Unauthorized: Image does not belong to user');
            }

            const result = await cloudinary.uploader.destroy(publicId);
            return result.result === 'ok';
        } catch (error: any) {
            console.error('Cloudinary delete error:', error);
            return false;
        }
    }

    getUrl(path: string, transformations?: ImageTransformations): string {
        let url = `https://res.cloudinary.com/${this.cloudName}/image/upload/`;

        if (transformations) {
            const transforms: string[] = [];
            if (transformations.width) transforms.push(`w_${transformations.width}`);
            if (transformations.height) transforms.push(`h_${transformations.height}`);
            if (transformations.quality) transforms.push(`q_${transformations.quality}`);
            if (transformations.format) transforms.push(`f_${transformations.format}`);

            if (transforms.length > 0) {
                url += transforms.join(',') + '/';
            }
        }

        url += path;
        return url;
    }

    async testConnection(credentials: any): Promise<{ success: boolean; error?: string }> {
        try {
            // Configure with test credentials
            cloudinary.config({
                cloud_name: credentials.cloudName,
                api_key: credentials.apiKey,
                api_secret: credentials.apiSecret,
            });

            // Try to fetch account details (lightweight API call)
            await cloudinary.api.ping();

            return { success: true };
        } catch (error: any) {
            return {
                success: false,
                error: error.message || 'Connection test failed'
            };
        }
    }

    private extractPublicId(url: string): string {
        // Extract public_id from Cloudinary URL
        // Example: https://res.cloudinary.com/demo/image/upload/v1234/users/abc/photo.jpg
        // Returns: users/abc/photo
        const match = url.match(/\/upload\/(?:v\d+\/)?(.+)\.\w+$/);
        return match ? match[1] : '';
    }
}
