'use server';

import { auth } from '@/auth';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { encryptCredentials, decryptCredentials } from '@/lib/encryption';
import { CloudinaryProvider } from '@/lib/storage-providers/cloudinary';
import { GoogleDriveProvider } from '@/lib/storage-providers/google-drive';
import { DropboxProvider } from '@/lib/storage-providers/dropbox';
import { TeraboxProvider } from '@/lib/storage-providers/terabox';
import { revalidatePath } from 'next/cache';

export async function configureStorageProvider(provider: string, credentials: any) {
    try {
        const session = await auth();
        if (!session?.user?.id) throw new Error('No autorizado');

        await dbConnect();

        // Test connection first
        let testResult;
        if (provider === 'cloudinary') {
            const cloudinaryProvider = new CloudinaryProvider(credentials);
            testResult = await cloudinaryProvider.testConnection(credentials);
        } else if (provider === 'google-drive') {
            const googleDriveProvider = new GoogleDriveProvider(credentials);
            testResult = await googleDriveProvider.testConnection(credentials);
        } else if (provider === 'dropbox') {
            const dropboxProvider = new DropboxProvider(credentials);
            testResult = await dropboxProvider.testConnection(credentials);
        } else if (provider === 'terabox') {
            const teraboxProvider = new TeraboxProvider(credentials);
            testResult = await teraboxProvider.testConnection(credentials);
        } else {
            throw new Error('Provider not supported yet');
        }

        if (!testResult.success) {
            return { success: false, error: testResult.error || 'Connection test failed' };
        }

        // Encrypt credentials
        const encryptedCreds = encryptCredentials(credentials, session.user.id);

        // Extract public config (non-sensitive data)
        let publicConfig = {};
        if (provider === 'cloudinary') {
            publicConfig = { cloudName: credentials.cloudName };
        } else if (provider === 'google-drive') {
            publicConfig = { email: credentials.email };
        } else if (provider === 'dropbox') {
            publicConfig = { email: credentials.email };
        } else if (provider === 'terabox') {
            publicConfig = {};
        }

        // Update user
        await User.findByIdAndUpdate(session.user.id, {
            $set: {
                'storageProvider.type': provider,
                'storageProvider.credentials': encryptedCreds,
                'storageProvider.config': publicConfig,
                'storageProvider.status': 'configured',
                'storageProvider.lastTested': new Date()
            }
        });

        revalidatePath('/dashboard/settings/storage');
        return { success: true };
    } catch (error: any) {
        console.error('Configure storage error:', error);
        return { success: false, error: error.message };
    }
}

export async function getStorageProviderStatus() {
    try {
        const session = await auth();
        if (!session?.user?.id) return null;

        await dbConnect();
        const user = await User.findById(session.user.id).select('storageProvider');

        if (!user || !user.storageProvider) {
            return { type: 'none', status: 'not_configured' };
        }

        return {
            type: user.storageProvider.type,
            status: user.storageProvider.status,
            config: user.storageProvider.config,
            lastTested: user.storageProvider.lastTested
        };
    } catch (error) {
        console.error('Get storage status error:', error);
        return null;
    }
}

export async function testStorageConnection() {
    try {
        const session = await auth();
        if (!session?.user?.id) throw new Error('No autorizado');

        await dbConnect();
        const user = await User.findById(session.user.id).select('+storageProvider.credentials storageProvider');

        if (!user?.storageProvider?.credentials) {
            return { success: false, error: 'No storage provider configured' };
        }

        // Decrypt credentials
        const credentials = decryptCredentials(user.storageProvider.credentials, session.user.id);

        // Test based on provider type
        let testResult;
        if (user.storageProvider.type === 'cloudinary') {
            const provider = new CloudinaryProvider(credentials);
            testResult = await provider.testConnection(credentials);
        } else if (user.storageProvider.type === 'google-drive') {
            const provider = new GoogleDriveProvider(credentials);
            testResult = await provider.testConnection(credentials);
        } else if (user.storageProvider.type === 'dropbox') {
            const provider = new DropboxProvider(credentials);
            testResult = await provider.testConnection(credentials);
        } else if (user.storageProvider.type === 'terabox') {
            const provider = new TeraboxProvider(credentials);
            testResult = await provider.testConnection(credentials);
        } else {
            throw new Error('Provider not supported');
        }

        // Update last tested date if successful
        if (testResult.success) {
            await User.findByIdAndUpdate(session.user.id, {
                $set: {
                    'storageProvider.lastTested': new Date(),
                    'storageProvider.status': 'configured'
                }
            });
        } else {
            await User.findByIdAndUpdate(session.user.id, {
                $set: { 'storageProvider.status': 'error' }
            });
        }

        return testResult;
    } catch (error: any) {
        console.error('Test connection error:', error);
        return { success: false, error: error.message };
    }
}
