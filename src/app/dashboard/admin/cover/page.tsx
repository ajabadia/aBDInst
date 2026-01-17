import FeaturedContentClient from '@/components/dashboard/admin/FeaturedContentClient';
import { getFeaturedContent } from '@/actions/home';
import { getArticles } from '@/actions/blog';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';

export default async function AdminCoverPage() {
    const session = await auth();
    const role = (session?.user as any)?.role;

    if (!['admin', 'supereditor'].includes(role)) {
        redirect('/dashboard');
    }

    const featured = await getFeaturedContent();
    const articles = await getArticles(); // Fetch all articles (drafts included if admin)

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Gestor de Portada</h1>
                <p className="text-gray-500">Decide qué artículo aparece destacado en la página principal.</p>
            </div>

            <FeaturedContentClient
                initialFeaturedId={featured?._id}
                articles={articles}
            />
        </div>
    );
}
