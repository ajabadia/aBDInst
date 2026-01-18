
import { IStorageProvider } from './index';

export async function getStorageProvider(userId: string): Promise<IStorageProvider> {
    throw new Error('Client side cannot access storage provider factory directly. This code should only run on server.');
}
