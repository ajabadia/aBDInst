import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { getCatalogMetadata } from '@/actions/metadata';
import MetadataManager from '@/components/admin/MetadataManager';

export default async function MetadataPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
    const { tab } = await searchParams;
    const session = await auth();
    const role = session?.user?.role;

    if (!session || !['admin', 'editor'].includes(role || '')) {
        redirect('/dashboard');
    }

    // Fetch initial data based on tab (default to 'brand')
    const validTabs = ['brand', 'type', 'decade', 'artist'];
    const activeTab = (tab && validTabs.includes(tab)) ? tab : 'brand';
    const initialData = await getCatalogMetadata(activeTab);

    return <MetadataManager initialData={initialData} />;
}
