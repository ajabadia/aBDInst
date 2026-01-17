import Link from 'next/link';
import Image from 'next/image';
import { auth } from '@/auth';
import { Music, Package, Smartphone, ShieldCheck, Zap, Globe, ArrowRight, Layout, Calendar, Newspaper, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { getArticles } from '@/actions/blog';
import { getFeaturedContent } from '@/actions/home';

export default async function Home() {
  const session = await auth();

  // Fetch active featured content
  const featuredArticle = await getFeaturedContent('hero_article');
  const featuredInstrument = await getFeaturedContent('instrument_spotlight'); // New spot

  // Fallback for article
  const latestArticle = featuredArticle?.referenceId
    ? { ...featuredArticle.referenceId, type: 'featured' }
    : (await getArticles({ status: 'published' }))[0];

  return (
    <div className="flex flex-col min-h-screen bg-background overflow-x-hidden">

      {/* --- HERO SECTION --- */}
      <section className="relative h-screen min-h-[800px] flex flex-col justify-center items-center text-center px-6 overflow-hidden">
        {/* Background Decorative Blurs */}
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-ios-blue/10 blur-[150px] pointer-events-none animate-pulse-slow" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-500/10 blur-[150px] pointer-events-none" />

        <div className="max-w-5xl space-y-8 relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/5 dark:bg-white/10 text-gray-600 dark:text-gray-300 text-xs font-bold uppercase tracking-[0.2em] mb-4 backdrop-blur-md border border-white/20">
            <ShieldCheck size={14} /> The Collection OS
          </div>

          <h1 className="text-6xl md:text-8xl lg:text-9xl font-semibold tracking-tighter text-gray-900 dark:text-white leading-[0.95] mb-6">
            Tu legado.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-ios-blue to-purple-600">Reinventado.</span>
          </h1>

          <p className="text-2xl md:text-3xl text-gray-500 dark:text-gray-400 max-w-3xl mx-auto font-medium leading-relaxed tracking-tight">
            La plataforma definitiva para gestionar, documentar y exhibir tu colección de instrumentos.
          </p>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-6 pt-10">
            {!session ? (
              <Link href="/register">
                <Button size="lg" className="px-12 h-16 text-xl rounded-full shadow-lg shadow-ios-blue/30 hover:scale-105 transition-transform">
                  Empezar ahora
                </Button>
              </Link>
            ) : (
              <Link href="/dashboard">
                <Button size="lg" className="px-12 h-16 text-xl rounded-full shadow-lg shadow-ios-blue/30">
                  Ir al Dashboard
                </Button>
              </Link>
            )}
            <Link href="/instruments">
              <Button variant="ghost" size="lg" className="px-8 h-16 text-xl text-gray-600 dark:text-gray-300 hover:text-ios-blue dark:hover:text-white gap-2">
                Explorar Catálogo <ArrowRight size={20} />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* --- BENTO GRID SECTION --- */}
      <section className="py-24 px-6 bg-gray-50 dark:bg-black/40">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Todo en un vistazo.</h2>
            <p className="text-xl text-gray-500">Nuevas formas de interactuar con tu música.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 grid-rows-auto md:grid-rows-2 gap-6 h-auto md:h-[800px]">

            {/* 1. Large Feature Card: Kiosk Mode */}
            <div className="col-span-1 md:col-span-2 md:row-span-2 apple-card relative overflow-hidden group bg-black text-white border-0">
              <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black z-0" />
              <Image
                src="https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&q=80"
                alt="Stage"
                fill
                className="object-cover opacity-60 group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 p-8 flex flex-col justify-end z-10 bg-gradient-to-t from-black via-transparent to-transparent">
                <div className="bg-ios-orange w-12 h-12 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-ios-orange/30">
                  <Layout className="text-white" />
                </div>
                <h3 className="text-3xl font-bold mb-2">Modo Kiosco</h3>
                <p className="text-gray-300 text-lg mb-6 line-clamp-3">
                  Convierte tu tablet en una pantalla interactiva para exposiciones.
                  Tus instrumentos cobran vida con una interfaz inmersiva a pantalla completa.
                </p>
                <Link href="/dashboard/showrooms">
                  <Button variant="secondary" className="bg-white/20 hover:bg-white/30 text-white border-none rounded-full backdrop-blur-md">
                    Ver Demo
                  </Button>
                </Link>
              </div>
            </div>

            {/* 2. Blog Highlight (Dynamic) */}
            <div className="col-span-1 md:col-span-2 md:row-span-1 apple-card p-8 flex flex-col justify-between bg-white dark:bg-white/5 hover:border-ios-blue/30 transition-colors group relative overflow-hidden">
              {latestArticle ? (
                <>
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 text-xs font-bold text-ios-blue uppercase mb-2">
                      <Newspaper size={14} /> Blog
                    </div>
                    <h3 className="text-3xl font-bold mb-2 leading-tight group-hover:text-ios-blue transition-colors">
                      {latestArticle.title}
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 line-clamp-2">
                      {latestArticle.excerpt}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 mt-4 relative z-10">
                    <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden relative">
                      {latestArticle.author?.image && <Image src={latestArticle.author.image} fill alt="au" />}
                    </div>
                    <span className="text-sm font-medium">{latestArticle.author?.name}</span>
                    <Link href={`/blog/${latestArticle.slug}`} className="ml-auto">
                      <Button size="sm" variant="ghost" className="rounded-full">Leer <ArrowRight size={14} /></Button>
                    </Link>
                  </div>
                  {/* decorative bg */}
                  {latestArticle.coverImage && (
                    <Image src={latestArticle.coverImage} fill alt="bg" className="object-cover opacity-5 dark:opacity-10 group-hover:scale-105 transition-transform duration-700 pointer-events-none" />
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <Newspaper size={48} className="text-gray-300 mb-4" />
                  <h3 className="text-xl font-bold text-gray-400">Próximamente en el Blog</h3>
                </div>
              )}
            </div>

            {/* 3. Exhibitions (Teaser) */}
            <div className="col-span-1 md:col-span-1 md:row-span-1 apple-card p-6 flex flex-col bg-gradient-to-br from-purple-900 to-indigo-900 text-white relative overflow-hidden border-0">
              <div className="absolute top-0 right-0 p-32 bg-white/10 blur-[60px] rounded-full pointer-events-none" />
              <div className="bg-white/20 w-10 h-10 rounded-xl flex items-center justify-center mb-auto backdrop-blur-sm">
                <Trophy size={20} />
              </div>
              <div className="relative z-10">
                <h3 className="text-xl font-bold mb-1">Concursos</h3>
                <p className="text-purple-200 text-sm mb-4">Participa en retos temáticos y gana medallas.</p>
                <Button size="sm" className="w-full bg-white text-purple-900 hover:bg-gray-100 border-none rounded-full">
                  Muy Pronto
                </Button>
              </div>
            </div>

            {/* 4. Events / Exhibitions (Teaser) */}
            <div className="col-span-1 md:col-span-1 md:row-span-1 apple-card p-6 flex flex-col bg-gray-100 dark:bg-white/10 group">
              <div className="bg-ios-green/10 text-ios-green w-10 h-10 rounded-xl flex items-center justify-center mb-auto">
                <Calendar size={20} />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-1">Exposiciones</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">Muestras virtuales curadas por expertos.</p>
                <Link href="/blog">
                  <span className="text-sm font-bold text-ios-blue flex items-center gap-1 group-hover:gap-2 transition-all">Ver Agenda <ArrowRight size={14} /></span>
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* --- VALUE PROPS (Keep Existing but Refined) --- */}
      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center text-gray-900 dark:text-white mb-6">
                <Package size={28} />
              </div>
              <h3 className="text-2xl font-bold">Inventario Preciso</h3>
              <p className="text-gray-500 leading-relaxed">Documenta cada modificación, número de serie y accesorio con detalle forense.</p>
            </div>
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center text-gray-900 dark:text-white mb-6">
                <Zap size={28} />
              </div>
              <h3 className="text-2xl font-bold">Valor en Tiempo Real</h3>
              <p className="text-gray-500 leading-relaxed">Algoritmos que rastrean el mercado para decirte cuánto vale tu colección hoy.</p>
            </div>
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center text-gray-900 dark:text-white mb-6">
                <ShieldCheck size={28} />
              </div>
              <h3 className="text-2xl font-bold">Bóveda Segura</h3>
              <p className="text-gray-500 leading-relaxed">Privacidad por diseño. Tú controlas qué se comparte y qué permanece oculto.</p>
            </div>
          </div>
        </div>
      </section>

      {/* --- MOBILE APP UPSOL (Refined) --- */}
      <section className="py-40 bg-black text-white overflow-hidden relative">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-30 mix-blend-overlay" />
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <h2 className="text-5xl md:text-7xl font-bold tracking-tight mb-8">Siempre contigo.</h2>
          <p className="text-2xl text-gray-300 max-w-2xl mx-auto mb-12">
            La potencia de tu escritorio, optimizada para iOS y Android.
          </p>
          <div className="flex justify-center gap-6">
            <Button size="lg" className="bg-white text-black hover:bg-gray-100 rounded-full h-14 px-8 border-none">
              <Smartphone className="mr-2" /> Descargar App
            </Button>
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="py-20 border-t border-black/5 dark:border-white/5 bg-gray-50 dark:bg-black">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-ios-blue flex items-center justify-center shadow-lg shadow-ios-blue/20">
              <Music className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight">Instrument<span className="text-ios-blue">Collector</span></span>
          </div>
          <p className="text-sm text-gray-400 font-medium">
            © {new Date().getFullYear()} • Diseñado en California (mentira, en tu PC).
          </p>
          <div className="flex gap-8 text-sm font-semibold text-gray-500">
            <Link href="/contact" className="hover:text-ios-blue transition-colors">Contacto</Link>
            <Link href="/terms" className="hover:text-ios-blue transition-colors">Términos</Link>
            <Link href="/privacy" className="hover:text-ios-blue transition-colors">Privacidad</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
