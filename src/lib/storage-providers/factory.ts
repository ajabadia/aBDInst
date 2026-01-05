
import { CloudinaryProvider } from './cloudinary';
import { GoogleDriveProvider } from './google-drive';
import { DropboxProvider } from './dropbox';
import { TeraboxProvider } from './terabox';
import { IStorageProvider } from './index';
import { decryptCredentials } from '@/lib/encryption';
import User from '@/models/User';
import dbConnect from '@/lib/db';

export async function getStorageProvider(userId: string): Promise<IStorageProvider> {
    await dbConnect();
    const user = await User.findById(userId).select('+storageProvider.credentials storageProvider');

    if (!user?.storageProvider || user.storageProvider.type === 'none' || user.storageProvider.type === 'cloudinary' && !user.storageProvider.credentials) {
        // Default fallback to environment env Cloudinary if configured, or fail
        if (process.env.CLOUDINARY_CLOUD_NAME) {
            return new CloudinaryProvider({
                cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
                apiKey: process.env.CLOUDINARY_API_KEY || '',
                apiSecret: process.env.CLOUDINARY_API_SECRET || ''
            });
        }
        throw new Error('No storage provider configured');
    }

    const providerType = user.storageProvider.type;
    const encryptedCreds = user.storageProvider.credentials;

    // Explicit check for Cloudinary with missing credentials in DB but present in ENV handled above? 
    // Actually if type is 'cloudinary' but no credentials in DB, we might want to use env vars?
    // Let's assume if user selected Cloudinary in UI, they provided creds OR we should fallback.
    // However, the check above handles the "default" case. 

    if (!encryptedCreds && providerType !== 'none') {
        // Fallback for when type is set but no creds (shouldn't happen ideally)
        if (providerType === 'cloudinary' && process.env.CLOUDINARY_CLOUD_NAME) {
            return new CloudinaryProvider({
                cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
                apiKey: process.env.CLOUDINARY_API_KEY || '',
                apiSecret: process.env.CLOUDINARY_API_SECRET || ''
            });
        }
        throw new Error(`Storage configuration incomplete for ${providerType}`);
    }

    const credentials = decryptCredentials(encryptedCreds, userId);

    switch (providerType) {
        case 'cloudinary':
            return new CloudinaryProvider(credentials);
        case 'google-drive':
            return new GoogleDriveProvider(credentials);
        case 'dropbox':
            return new DropboxProvider(credentials);
        case 'terabox':
            return new TeraboxProvider(credentials);
        default:
            // Final fallback
            if (process.env.CLOUDINARY_CLOUD_NAME) {
                return new CloudinaryProvider({
                    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
                    apiKey: process.env.CLOUDINARY_API_KEY || '',
                    apiSecret: process.env.CLOUDINARY_API_SECRET || ''
                });
            }
            throw new Error(`Unsupported storage provider: ${providerType}`);
    }
}
