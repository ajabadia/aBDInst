import { Dropbox } from 'dropbox';
import { IStorageProvider, ImageTransformations } from './index';

export class DropboxProvider implements IStorageProvider {
    private dbx: Dropbox;
    private accessToken: string;

    constructor(credentials: { accessToken: string }) {
        this.accessToken = credentials.accessToken;
        this.dbx = new Dropbox({ accessToken: credentials.accessToken });
    }

    async upload(file: File | Buffer, userId: string, path?: string): Promise<string> {
        try {
            // Create user-specific path
            const fileName = path || `photo-${Date.now()}.jpg`;
            const dropboxPath = `/instrument-collector/${userId}/${fileName}`;

            // Convert File to Buffer if needed
            let buffer: Buffer;
            if (file instanceof File) {
                const arrayBuffer = await file.arrayBuffer();
                buffer = Buffer.from(arrayBuffer);
            } else {
                buffer = file;
            }

            // Upload file
            const response = await this.dbx.filesUpload({
                path: dropboxPath,
                contents: buffer,
                mode: { '.tag': 'add' },
                autorename: true,
            });

            // Create shared link
            const sharedLink = await this.dbx.sharingCreateSharedLinkWithSettings({
                path: response.result.path_display!,
                settings: {
                    requested_visibility: { '.tag': 'public' },
                },
            });

            // Convert to direct download link
            const directUrl = sharedLink.result.url.replace('?dl=0', '?raw=1');
            return directUrl;
        } catch (error) {
            console.error('Dropbox upload error:', error);
            throw new Error('Failed to upload to Dropbox');
        }
    }

    async delete(url: string, userId: string): Promise<boolean> {
        try {
            // Extract path from shared link
            const path = await this.getPathFromUrl(url);
            if (!path) {
                throw new Error('Invalid Dropbox URL');
            }

            await this.dbx.filesDeleteV2({
                path: path,
            });

            return true;
        } catch (error) {
            console.error('Dropbox delete error:', error);
            return false;
        }
    }

    getUrl(path: string, transformations?: ImageTransformations): string {
        // Dropbox doesn't support transformations natively
        // Return the path as-is (should be a full URL)
        return path;
    }

    async testConnection(credentials: any): Promise<{ success: boolean; error?: string }> {
        try {
            const dbx = new Dropbox({ accessToken: credentials.accessToken });

            // Test by getting current account info
            await dbx.usersGetCurrentAccount();

            return { success: true };
        } catch (error: any) {
            console.error('Dropbox test connection error:', error);
            return {
                success: false,
                error: error.message || 'Failed to connect to Dropbox'
            };
        }
    }

    private async getPathFromUrl(url: string): Promise<string | null> {
        try {
            // Get metadata from shared link
            const metadata = await this.dbx.sharingGetSharedLinkMetadata({
                url: url.replace('?raw=1', '?dl=0'),
            });

            if (metadata.result['.tag'] === 'file') {
                return (metadata.result as any).path_lower;
            }

            return null;
        } catch (error) {
            console.error('Error getting path from URL:', error);
            return null;
        }
    }
}
