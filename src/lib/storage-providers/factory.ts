import 'server-only';
// Providers & Dependencies (Imported dynamically to avoid bundling issues)
import { IStorageProvider } from './index';

export async function getStorageProvider(userId: string): Promise<IStorageProvider> {
    // Dynamic imports to prevent Client Bundle pollution (Mongoose, Crypto, Net, etc.)
    const { default: dbConnect } = await import('@/lib/db');
    const { default: User } = await import('@/models/User');
    const { CloudinaryProvider } = await import('./cloudinary');
    const { decryptCredentials } = await import('@/lib/encryption');

    await dbConnect();
    const user = await User.findById(userId).select('+storageProvider.credentials');

    if (!user?.storageProvider || user.storageProvider.type === 'none' || user.storageProvider.type === 'cloudinary' && !user.storageProvider.credentials) {
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

    if (!encryptedCreds && providerType !== 'none') {
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
        case 'google-drive': {
            const { GoogleDriveProvider } = await import('./google-drive');
            return new GoogleDriveProvider(credentials);
        }
        case 'dropbox': {
            const { DropboxProvider } = await import('./dropbox');
            return new DropboxProvider(credentials);
        }
        case 'terabox': {
            const { TeraboxProvider } = await import('./terabox');
            return new TeraboxProvider(credentials);
        }
        default:
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
