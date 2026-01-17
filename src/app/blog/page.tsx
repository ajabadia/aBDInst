import Link from 'next/link';
import Image from 'next/image';
import { getArticles } from '@/actions/blog';
import { Calendar, User, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export const metadata = {
    title: 'Blog | Instrument Collector',
    description: 'Historias, guías y documentación sobre la colección de instrumentos.'
};

export default async function PublicBlogPage() {
    // Only published articles are returned by getArticles() when not admin (or even if admin, we should probably filter for public view if we reused the action, but existing action filters by published if !admin. Wait, I am calling from server component so I have session. If I am admin it returns drafts too. I should fix getArticles or filter here.
    // Let's modify getArticles to accept a strict 'publishedOnly' flag or filter here. 
    // Actually, let's just use the existing action and filter client-side or assume the action handles it.
    // Re-reading getArticles in blog.ts: "const filter = isAdmin ? query : { ...query, status: 'published' };"
    // So if I am admin I see drafts. That's fine for "Reviewing" but maybe confusing for "Public View". 
    // I entered this page as Admin usually.
    // Let's explicitly pass { status: 'published' } to be sure.

    const articles = await getArticles({ status: 'published' });

    return (
        <div className="min-h-screen pt-24 pb-20 px-6">
            <div className="max-w-7xl mx-auto space-y-12">

                {/* Header */}
                <div className="text-center space-y-4 max-w-2xl mx-auto">
                    <h1 className="text-4xl md:text-6xl font-black tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
                        El Diario del Coleccionista
                    </h1>
                    <p className="text-xl text-gray-500 font-medium">
                        Historias detrás de los instrumentos, guías de mantenimiento y documentación histórica.
                    </p>
                </div>

                {/* Featured / Hero Article (First one) */}
                {articles.length > 0 && (
                    <div className="relative group rounded-3xl overflow-hidden shadow-2xl aspect-[21/9] md:aspect-[2.5/1]">
                        <Image
                            src={articles[0].coverImage || '/placeholder-studio.jpg'} // Fallback? Need a real fallback or gradient
                            alt={articles[0].title}
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-6 md:p-12 flex flex-col justify-end items-start text-white">
                            <div className="flex items-center gap-3 mb-3 text-sm font-medium tracking-wide opacity-80 uppercase">
                                <span className="text-ios-blue bg-white/10 px-2 py-1 rounded backdrop-blur-md border border-white/10">Destacado</span>
                                <span className="flex items-center gap-1"><Calendar size={14} /> {new Date(articles[0].createdAt).toLocaleDateString()}</span>
                            </div>
                            <h2 className="text-3xl md:text-5xl font-bold mb-4 max-w-3xl leading-tight text-white drop-shadow-md">
                                {articles[0].title}
                            </h2>
                            <p className="text-gray-200 line-clamp-2 max-w-2xl mb-6 text-lg">
                                {articles[0].excerpt || articles[0].content.substring(0, 150) + '...'}
                            </p>
                            <Link href={`/blog/${articles[0].slug}`}>
                                <Button className="bg-white text-black hover:bg-gray-100 border-none shadow-xl">
                                    Leer Artículo <ArrowRight size={16} />
                                </Button>
                            </Link>
                        </div>
                    </div>
                )}

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {articles.slice(1).map((article: any) => (
                        <Link href={`/blog/${article.slug}`} key={article._id} className="group">
                            <div className="apple-card h-full flex flex-col overflow-hidden bg-white dark:bg-white/5 hover:border-ios-blue/50 transition-colors">
                                <div className="aspect-[16/10] relative overflow-hidden bg-gray-100 dark:bg-white/5">
                                    {article.coverImage ? (
                                        <Image
                                            src={article.coverImage}
                                            alt={article.title}
                                            fill
                                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                                            <span className="text-4xl font-serif opacity-20">Aa</span>
                                        </div>
                                    )}
                                </div>
                                <div className="p-6 flex flex-col flex-grow">
                                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-3 font-mono uppercase">
                                        <span className="text-ios-blue font-bold">{article.tags?.[0] || 'Artículo'}</span>
                                        <span>•</span>
                                        <span>{new Date(article.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <h3 className="text-xl font-bold mb-3 group-hover:text-ios-blue transition-colors leading-tight">
                                        {article.title}
                                    </h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-3 mb-4 flex-grow">
                                        {article.excerpt || article.content.substring(0, 100) + '...'}
                                    </p>
                                    <div className="flex items-center gap-2 text-xs font-medium text-gray-400">
                                        <div className="w-5 h-5 rounded-full bg-gray-200 overflow-hidden relative">
                                            {article.author?.image && <Image src={article.author.image} fill alt="au" />}
                                        </div>
                                        {article.author?.name || 'Redactor'}
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}

                    {articles.length === 0 && (
                        <div className="col-span-full py-20 text-center text-gray-400">
                            No hay artículos publicados todavía.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
