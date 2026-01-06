import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { getCatalogMetadata } from '@/actions/metadata';
import MetadataManager from '@/components/admin/MetadataManager';

export default async function MetadataPage() {
    const session = await auth();
    const role = session?.user?.role;

    if (!session || !['admin', 'editor'].includes(role || '')) {
        redirect('/dashboard');
    }

    // Fetch initial data (default to 'brand' tab)
    const initialData = await getCatalogMetadata('brand');

    return <MetadataManager initialData={initialData} />;
}
