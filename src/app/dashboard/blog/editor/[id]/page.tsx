import ArticleEditor from '@/components/dashboard/blog/ArticleEditor';
import Article from '@/models/Article';
import { getUserCollection } from '@/actions/collection'; // To link instruments
import dbConnect from '@/lib/db';
import { notFound } from 'next/navigation';

export default async function ArticleEditorPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    await dbConnect();

    // Fetch Article
    const article = await Article.findById(params.id).lean();
    if (!article) notFound();

    // Fetch User Collection for linking (simplified list)
    const collection = await getUserCollection();

    return (
        <ArticleEditor
            article={JSON.parse(JSON.stringify(article))}
            collection={JSON.parse(JSON.stringify(collection))}
        />
    );
}
