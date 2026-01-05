import { google } from 'googleapis';
import { IStorageProvider, ImageTransformations } from './index';

export class GoogleDriveProvider implements IStorageProvider {
    private drive: any;
    private credentials: any;

    constructor(credentials: { accessToken: string; refreshToken: string; clientId: string; clientSecret: string }) {
        this.credentials = credentials;

        const oauth2Client = new google.auth.OAuth2(
            credentials.clientId,
            credentials.clientSecret,
            process.env.NEXT_PUBLIC_APP_URL + '/api/auth/google-drive/callback'
        );

        oauth2Client.setCredentials({
            access_token: credentials.accessToken,
            refresh_token: credentials.refreshToken,
        });

        this.drive = google.drive({ version: 'v3', auth: oauth2Client });
    }

    async upload(file: File | Buffer, userId: string, path?: string): Promise<string> {
        try {
            // Create user folder if it doesn't exist
            const folderName = `instrument-collector-${userId}`;
            const folderId = await this.getOrCreateFolder(folderName);

            // Prepare file metadata
            const fileMetadata = {
                name: path || `photo-${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`,
                parents: [folderId],
            };

            // Convert File to Buffer if needed
            let buffer: Buffer;
            if (file instanceof File) {
                const arrayBuffer = await file.arrayBuffer();
                buffer = Buffer.from(arrayBuffer);
            } else {
                buffer = file;
            }

            // Upload file
            const response = await this.drive.files.create({
                requestBody: fileMetadata,
                media: {
                    mimeType: 'image/jpeg',
                    body: buffer,
                },
                fields: 'id, webViewLink, webContentLink',
            });

            // Make file publicly accessible
            await this.drive.permissions.create({
                fileId: response.data.id,
                requestBody: {
                    role: 'reader',
                    type: 'anyone',
                },
            });

            // Get public URL
            const fileUrl = `https://drive.google.com/uc?export=view&id=${response.data.id}`;
            return fileUrl;
        } catch (error) {
            console.error('Google Drive upload error:', error);
            throw new Error('Failed to upload to Google Drive');
        }
    }

    async delete(url: string, userId: string): Promise<boolean> {
        try {
            // Extract file ID from URL
            const fileId = this.extractFileId(url);
            if (!fileId) {
                throw new Error('Invalid Google Drive URL');
            }

            await this.drive.files.delete({
                fileId: fileId,
            });

            return true;
        } catch (error) {
            console.error('Google Drive delete error:', error);
            return false;
        }
    }

    getUrl(path: string, transformations?: ImageTransformations): string {
        // Google Drive doesn't support transformations natively
        // Return the path as-is (should be a full URL)
        return path;
    }

    async testConnection(credentials: any): Promise<{ success: boolean; error?: string }> {
        try {
            const oauth2Client = new google.auth.OAuth2(
                credentials.clientId,
                credentials.clientSecret,
                process.env.NEXT_PUBLIC_APP_URL + '/api/auth/google-drive/callback'
            );

            oauth2Client.setCredentials({
                access_token: credentials.accessToken,
                refresh_token: credentials.refreshToken,
            });

            const drive = google.drive({ version: 'v3', auth: oauth2Client });

            // Test by listing files
            await drive.files.list({
                pageSize: 1,
                fields: 'files(id, name)',
            });

            return { success: true };
        } catch (error: any) {
            console.error('Google Drive test connection error:', error);
            return {
                success: false,
                error: error.message || 'Failed to connect to Google Drive'
            };
        }
    }

    private async getOrCreateFolder(folderName: string): Promise<string> {
        try {
            // Search for existing folder
            const response = await this.drive.files.list({
                q: `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
                fields: 'files(id, name)',
                spaces: 'drive',
            });

            if (response.data.files && response.data.files.length > 0) {
                return response.data.files[0].id;
            }

            // Create folder if it doesn't exist
            const folderMetadata = {
                name: folderName,
                mimeType: 'application/vnd.google-apps.folder',
            };

            const folder = await this.drive.files.create({
                requestBody: folderMetadata,
                fields: 'id',
            });

            return folder.data.id;
        } catch (error) {
            console.error('Error creating folder:', error);
            throw error;
        }
    }

    private extractFileId(url: string): string | null {
        // Extract file ID from various Google Drive URL formats
        const patterns = [
            /\/file\/d\/([^\/]+)/,
            /id=([^&]+)/,
            /\/d\/([^\/]+)/,
        ];

        for (const pattern of patterns) {
            const match = url.match(pattern);
            if (match) {
                return match[1];
            }
        }

        return null;
    }
}
