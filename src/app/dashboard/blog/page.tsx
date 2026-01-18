import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Plus, Edit2, Trash2, Eye } from 'lucide-react';
import { getArticles, deleteArticle, createArticle } from '@/actions/blog';
import BlogListClient from '@/components/dashboard/blog/BlogListClient';

export default async function BlogDashboardPage() {
    const articles = await getArticles();

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-center border-b border-gray-200 dark:border-white/10 pb-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Blog & Artículos</h1>
                    <p className="text-gray-500 mt-2">Gestiona el contenido editorial y la base de conocimiento.</p>
                </div>
                <BlogListClient />
            </div>

            <div className="grid gap-4">
                {articles.length === 0 ? (
                    <div className="text-center py-20 text-gray-500 bg-gray-50 dark:bg-white/5 rounded-2xl border-2 border-dashed border-gray-200 dark:border-white/10">
                        <p className="text-lg">No hay artículos publicados.</p>
                        <p className="text-sm">Crea el primero para empezar a documentar tu colección.</p>
                    </div>
                ) : (
                    articles.map((article: any) => (
                        <div key={article._id} className="apple-card p-4 flex items-center justify-between group hover:border-ios-blue transition-colors bg-white dark:bg-white/5">
                            <div className="flex items-center gap-4">
                                <div className={`w-2 h-2 rounded-full ${article.status === 'published' ? 'bg-green-500' : 'bg-amber-500'}`} />
                                <div>
                                    <h3 className="font-bold text-lg">{article.title}</h3>
                                    <div className="flex items-center gap-3 text-xs text-gray-500 font-mono mt-1">
                                        <span>{new Date(article.updatedAt).toLocaleDateString()}</span>
                                        <span>•</span>
                                        <span>{article.author?.name || 'Unknown'}</span>
                                        <span>•</span>
                                        <span className="uppercase">{article.status}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Link href={`/blog/${article.slug}`} target="_blank">
                                    <Button variant="ghost" size="icon" icon={Eye} />
                                </Link>
                                <Link href={`/dashboard/blog/editor/${article._id}`}>
                                    <Button variant="secondary" size="sm" icon={Edit2}>Editar</Button>
                                </Link>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
