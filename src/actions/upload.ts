import { auth } from '@/auth';

export async function uploadImage(formData: FormData) {
    try {
        const session = await auth();
        if (!session || !['admin', 'editor', 'normal'].includes((session.user as any).role)) {
            throw new Error('Unauthorized');
        }

        const userId = (session.user as any).id;
        const file = formData.get('file') as File;
        const folder = formData.get('folder') as string | undefined; // Support custom folder

        if (!file) throw new Error('No file provided');

        // Get configured provider (or default)
        // Dynamic import to prevent bundling leaks to client
        const { getStorageProvider } = await import('@/lib/storage-providers/factory');
        const provider = await getStorageProvider(userId);

        // Upload
        const url = await provider.upload(file, userId, folder);

        // const url = "mock_url"; // DEBUG: Temporary mock to verify build fix

        return { success: true, url };

    } catch (error: any) {
        console.error('Upload Action Error:', error);
        return { success: false, error: error.message };
    }
}
