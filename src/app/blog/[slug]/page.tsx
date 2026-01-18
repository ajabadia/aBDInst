import { getArticleBySlug } from '@/actions/blog';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Calendar, Clock, ArrowLeft, Tag, Share2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export async function generateMetadata(props: { params: Promise<{ slug: string }> }) {
    const params = await props.params;
    const article = await getArticleBySlug(params.slug);
    if (!article) return { title: 'Not Found' };
    return {
        title: `${article.title} | Blog`,
        description: article.excerpt
    };
}

export default async function PublicArticlePage(props: { params: Promise<{ slug: string }> }) {
    const params = await props.params;
    const article = await getArticleBySlug(params.slug);

    if (!article) notFound();

    return (
        <div className="min-h-screen bg-white dark:bg-black">
            {/* Nav Back */}
            <div className="fixed top-20 left-6 z-40 hidden xl:block">
                <Link href="/blog">
                    <Button variant="secondary" size="icon" className="rounded-full shadow-xl">
                        <ArrowLeft size={20} />
                    </Button>
                </Link>
            </div>

            {/* Hero Image */}
            <div className="w-full h-[50vh] md:h-[60vh] relative">
                {article.coverImage ? (
                    <Image
                        src={article.coverImage}
                        alt={article.title}
                        fill
                        className="object-cover"
                        priority
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-900 to-black" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

                <div className="absolute bottom-0 left-0 w-full p-6 md:p-12">
                    <div className="max-w-4xl mx-auto space-y-4 animate-in slide-in-from-bottom-5 duration-700">
                        <div className="flex flex-wrap gap-2">
                            {article.tags?.map((tag: string) => (
                                <span key={tag} className="px-3 py-1 bg-ios-blue text-white text-xs font-bold uppercase tracking-wider rounded-full shadow-lg shadow-ios-blue/20">
                                    {tag}
                                </span>
                            ))}
                        </div>
                        <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white leading-tight drop-shadow-2xl">
                            {article.title}
                        </h1>
                        <div className="flex items-center gap-4 text-gray-300 font-medium">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-white/10 overflow-hidden relative border border-white/20">
                                    {article.author?.image ? (
                                        <Image src={article.author.image} fill alt="author" className="object-cover" />
                                    ) : <div className="w-full h-full bg-gray-500" />}
                                </div>
                                <span>{article.author?.name}</span>
                            </div>
                            <span>•</span>
                            <span className="flex items-center gap-1.5"><Calendar size={14} /> {new Date(article.createdAt).toLocaleDateString()}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1.5"><Clock size={14} /> {Math.ceil(article.content.split(' ').length / 200)} min lectura</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Container */}
            <div className="max-w-4xl mx-auto px-6 py-12 -mt-10 relative z-10">
                {/* Intro/Excerpt */}
                {article.excerpt && (
                    <p className="text-xl md:text-2xl font-serif italic text-gray-500 dark:text-gray-400 mb-10 leading-relaxed border-l-4 border-ios-blue pl-6">
                        {article.excerpt}
                    </p>
                )}

                {/* Main Content (Simple Markdown-like rendering) */}
                <article className="prose prose-lg dark:prose-invert prose-blue max-w-none">
                    {/* 
                      For MVP, we render as plaintext with whitespace preservation. 
                      In real app, we'd use 'react-markdown' or 'dangerouslySetInnerHTML' if we trusted the HTML.
                      Given 'content' is likely just text or basic MD from our editor.
                    */}
                    <div className="whitespace-pre-wrap font-serif text-lg md:text-xl leading-8 text-gray-800 dark:text-gray-200">
                        {article.content}
                    </div>
                </article>

                {/* Integration: Related Instruments */}
                {article.relatedInstruments && article.relatedInstruments.length > 0 && (
                    <div className="mt-20 pt-10 border-t border-gray-200 dark:border-white/10">
                        <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                            <Tag className="text-ios-blue" />
                            Instrumentos Relacionados
                        </h3>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {article.relatedInstruments.map((inst: any) => (
                                <Link href={`/instruments/${inst.slug || inst._id}`} key={inst._id} className="group">
                                    <div className="flex items-center gap-4 bg-gray-50 dark:bg-white/5 p-4 rounded-2xl border border-transparent hover:border-ios-blue/30 transition-all hover:shadow-lg">
                                        <div className="w-20 h-20 bg-white rounded-xl overflow-hidden relative shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                                            {inst.genericImages?.[0] ? (
                                                <Image src={inst.genericImages[0]} fill alt="inst" className="object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-xs text-gray-400 font-mono">NO IMG</div>
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-bold text-lg leading-tight group-hover:text-ios-blue transition-colors">
                                                {inst.brand} {inst.model}
                                            </p>
                                            <p className="text-sm text-gray-500">{inst.year} • {inst.type}</p>
                                        </div>
                                        <ArrowRight className="ml-auto text-gray-300 group-hover:text-ios-blue group-hover:translate-x-1 transition-all" />
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
