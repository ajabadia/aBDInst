import { auth } from '@/auth';
import { getStorageProvider } from '@/lib/storage-providers/factory';

export async function uploadImage(formData: FormData) {
    try {
        const session = await auth();
        if (!session || !['admin', 'editor', 'normal'].includes((session.user as any).role)) {
            throw new Error('Unauthorized');
        }

        const userId = (session.user as any).id;
        const file = formData.get('file') as File;
        if (!file) throw new Error('No file provided');

        // Get configured provider (or default)
        const provider = await getStorageProvider(userId);

        // Upload
        const url = await provider.upload(file, userId);

        return { success: true, url };

    } catch (error: any) {
        console.error('Upload Action Error:', error);
        return { success: false, error: error.message };
    }
}
