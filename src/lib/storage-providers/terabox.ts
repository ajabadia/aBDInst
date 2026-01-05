import { IStorageProvider, ImageTransformations } from './index';

export class TeraboxProvider implements IStorageProvider {
    private apiKey: string;
    private apiSecret: string;
    private baseUrl = 'https://api.terabox.com/rest/2.0';

    constructor(credentials: { apiKey: string; apiSecret: string }) {
        this.apiKey = credentials.apiKey;
        this.apiSecret = credentials.apiSecret;
    }

    async upload(file: File | Buffer, userId: string, path?: string): Promise<string> {
        try {
            // Create user-specific path
            const fileName = path || `photo-${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;
            const teraboxPath = `/instrument-collector/${userId}/${fileName}`;

            // Convert File to Buffer if needed
            let buffer: Buffer;
            if (file instanceof File) {
                const arrayBuffer = await file.arrayBuffer();
                buffer = Buffer.from(arrayBuffer);
            } else {
                buffer = file;
            }

            // Get upload URL
            const uploadUrlResponse = await fetch(
                `${this.baseUrl}/file/precreate?access_token=${this.apiKey}`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        path: teraboxPath,
                        size: buffer.length,
                        isdir: 0,
                        autoinit: 1,
                    }),
                }
            );

            const uploadUrlData = await uploadUrlResponse.json();

            if (uploadUrlData.errno !== 0) {
                throw new Error(`Terabox precreate failed: ${uploadUrlData.errmsg}`);
            }

            // Upload file
            const formData = new FormData();
            const uint8Array = new Uint8Array(buffer);
            formData.append('file', new Blob([uint8Array]), fileName);
            formData.append('path', teraboxPath);
            formData.append('uploadid', uploadUrlData.uploadid);

            const uploadResponse = await fetch(
                `${this.baseUrl}/file/upload?access_token=${this.apiKey}`,
                {
                    method: 'POST',
                    body: formData,
                }
            );

            const uploadData = await uploadResponse.json();

            if (uploadData.errno !== 0) {
                throw new Error(`Terabox upload failed: ${uploadData.errmsg}`);
            }

            // Get public link
            const linkResponse = await fetch(
                `${this.baseUrl}/file/share?access_token=${this.apiKey}`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        fid_list: JSON.stringify([uploadData.fs_id]),
                        schannel: 4,
                        channel_list: '[]',
                    }),
                }
            );

            const linkData = await linkResponse.json();

            if (linkData.errno !== 0) {
                throw new Error(`Terabox share failed: ${linkData.errmsg}`);
            }

            return linkData.link;
        } catch (error) {
            console.error('Terabox upload error:', error);
            throw new Error('Failed to upload to Terabox');
        }
    }

    async delete(url: string, userId: string): Promise<boolean> {
        try {
            // Extract file ID from URL (this is simplified, actual implementation may vary)
            const fileId = this.extractFileId(url);
            if (!fileId) {
                throw new Error('Invalid Terabox URL');
            }

            const response = await fetch(
                `${this.baseUrl}/file/delete?access_token=${this.apiKey}`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        filelist: JSON.stringify([fileId]),
                    }),
                }
            );

            const data = await response.json();
            return data.errno === 0;
        } catch (error) {
            console.error('Terabox delete error:', error);
            return false;
        }
    }

    getUrl(path: string, transformations?: ImageTransformations): string {
        // Terabox doesn't support transformations natively
        // Return the path as-is (should be a full URL)
        return path;
    }

    async testConnection(credentials: any): Promise<{ success: boolean; error?: string }> {
        try {
            // Test by getting user info
            const response = await fetch(
                `${this.baseUrl}/user/info?access_token=${credentials.apiKey}`,
                {
                    method: 'GET',
                }
            );

            const data = await response.json();

            if (data.errno === 0) {
                return { success: true };
            } else {
                return {
                    success: false,
                    error: data.errmsg || 'Failed to connect to Terabox'
                };
            }
        } catch (error: any) {
            console.error('Terabox test connection error:', error);
            return {
                success: false,
                error: error.message || 'Failed to connect to Terabox'
            };
        }
    }

    private extractFileId(url: string): string | null {
        // This is a simplified implementation
        // Actual file ID extraction may require parsing the Terabox share URL
        const match = url.match(/\/s\/([^\/]+)/);
        return match ? match[1] : null;
    }
}
