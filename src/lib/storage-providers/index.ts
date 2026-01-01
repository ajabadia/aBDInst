// Storage Provider Abstraction Layer

export interface IStorageProvider {
    /**
     * Upload a file to the user's storage
     * @param file - File to upload
     * @param userId - User ID for directory organization
     * @param path - Optional custom path within user directory
     * @returns URL of the uploaded file
     */
    upload(file: File | Buffer, userId: string, path?: string): Promise<string>;

    /**
     * Delete a file from storage
     * @param url - Full URL of the file to delete
     * @param userId - User ID for verification
     * @returns Success status
     */
    delete(url: string, userId: string): Promise<boolean>;

    /**
     * Get optimized URL for a file
     * @param path - Internal path in the provider
     * @param transformations - Optional transformations (resize, format, etc.)
     * @returns Optimized public URL
     */
    getUrl(path: string, transformations?: ImageTransformations): string;

    /**
     * Test connection with the provider
     * @param credentials - Provider credentials
     * @returns Success status and error message if any
     */
    testConnection(credentials: any): Promise<{ success: boolean; error?: string }>;
}

export interface ImageTransformations {
    width?: number;
    height?: number;
    format?: 'jpg' | 'png' | 'webp' | 'avif';
    quality?: number;
}

export interface StorageCredentials {
    cloudinary?: {
        cloudName: string;
        apiKey: string;
        apiSecret: string;
    };
    'google-drive'?: {
        accessToken: string;
        refreshToken: string;
    };
    dropbox?: {
        accessToken: string;
    };
    terabox?: {
        apiKey: string;
        apiSecret: string;
    };
}
