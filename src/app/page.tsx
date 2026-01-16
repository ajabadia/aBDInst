import Link from 'next/link';
import { auth } from '@/auth';
import { Music, Package, Smartphone, ShieldCheck, Zap, Globe } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default async function Home() {
  const session = await auth();

  return (
    <div className="flex flex-col min-h-screen bg-background">

      {/* --- HERO SECTION --- */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden flex flex-col items-center text-center px-6">
        {/* Background Decorative Blurs */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-ios-blue/5 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-ios-indigo/5 blur-[120px] pointer-events-none" />

        <div className="max-w-4xl space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-ios-blue/10 text-ios-blue text-xs font-bold uppercase tracking-[0.2em] mb-4">
            <ShieldCheck size={14} /> Personal Vault v2.0
          </div>

          <h1 className="text-6xl md:text-8xl font-bold tracking-tight text-gray-900 dark:text-white leading-[1.05]">
            Tu Colección.<br />
            <span className="text-ios-blue">Perfectamente</span> Organizada.
          </h1>

          <p className="text-xl md:text-2xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto font-medium leading-relaxed">
            Gestiona tu inventario musical con herramientas de grado profesional.
            Catálogo maestro, seguimiento de precios y mantenimiento técnico.
          </p>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-6">
            {!session ? (
              <Link href="/register">
                <Button size="lg" className="px-10 h-14 text-lg shadow-apple-glow">
                  Empezar ahora
                </Button>
              </Link>
            ) : (
              <Link href="/dashboard">
                <Button size="lg" className="px-10 h-14 text-lg shadow-apple-glow">
                  Mi Panel de Control
                </Button>
              </Link>
            )}
            <Link href="/instruments">
              <Button variant="secondary" size="lg" className="px-10 h-14 text-lg" icon={<Music />}>
                Explorar Catálogo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* --- FEATURES GRID --- */}
      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24 space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Diseñado para Coleccionistas.</h2>
            <p className="text-xl text-gray-500 max-w-2xl mx-auto">Cada detalle ha sido cuidado para ofrecer una experiencia fluida, rápida y potente.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {/* Feature 1 */}
            <div className="apple-card p-10 bg-white dark:bg-white/5 flex flex-col items-center text-center group">
              <div className="w-16 h-16 bg-ios-blue/10 text-ios-blue rounded-2xl flex items-center justify-center mb-8 transition-transform group-hover:scale-110 duration-500">
                <Music size={32} />
              </div>
              <h3 className="text-2xl font-bold mb-4 tracking-tight">Catálogo Maestro</h3>
              <p className="text-gray-500 dark:text-gray-400 leading-relaxed font-medium">
                Accede a una base de datos exhaustiva con especificaciones técnicas, historias y recursos para cada instrumento.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="apple-card p-10 bg-white dark:bg-white/5 flex flex-col items-center text-center group">
              <div className="w-16 h-16 bg-ios-indigo/10 text-ios-indigo rounded-2xl flex items-center justify-center mb-8 transition-transform group-hover:scale-110 duration-500">
                <ShieldCheck size={32} />
              </div>
              <h3 className="text-2xl font-bold mb-4 tracking-tight">Privacidad Total</h3>
              <p className="text-gray-500 dark:text-gray-400 leading-relaxed font-medium">
                Tus datos de compra, números de serie y fotos personales están protegidos en tu bóveda privada cifrada.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="apple-card p-10 bg-white dark:bg-white/5 flex flex-col items-center text-center group">
              <div className="w-16 h-16 bg-ios-teal/10 text-ios-teal rounded-2xl flex items-center justify-center mb-8 transition-transform group-hover:scale-110 duration-500">
                <Zap size={32} />
              </div>
              <h3 className="text-2xl font-bold mb-4 tracking-tight">Mercado en Vivo</h3>
              <p className="text-gray-500 dark:text-gray-400 leading-relaxed font-medium">
                Escaneo automático de precios en Reverb y eBay para que nunca pierdas una oportunidad de inversión.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* --- PWA / MOBILE SECTION --- */}
      <section className="py-32 bg-ios-blue text-white overflow-hidden relative">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 items-center gap-16">
          <div className="space-y-8 relative z-10">
            <h2 className="text-5xl md:text-6xl font-bold tracking-tight leading-none">Tu colección,<br />en tu bolsillo.</h2>
            <p className="text-xl text-blue-100/80 font-medium max-w-lg leading-relaxed">
              Totalmente optimizada para iPhone y Android. Instala Instrument Collector como una aplicación nativa y gestiona tu equipo desde cualquier parte.
            </p>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/10">
                <Globe size={24} />
                <span className="font-bold">App Web</span>
              </div>
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/10">
                <Smartphone size={24} />
                <span className="font-bold">iOS & Android</span>
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="w-full aspect-square bg-white/10 rounded-full absolute blur-[100px] -top-20 -right-20 animate-pulse" />
            {/* Simple mockup-like representation */}
            <div className="relative glass-panel border-white/20 p-3 rounded-[3.5rem] shadow-2xl rotate-6 transform translate-x-12 scale-110 hidden md:block">
              {/* iPhone Frame */}
              <div className="bg-black rounded-[3rem] h-[580px] w-[280px] p-3 overflow-hidden ring-4 ring-black/10">
                {/* Screen Content */}
                <div className="bg-background w-full h-full rounded-[2.5rem] relative overflow-hidden flex flex-col">
                  {/* Dynamic Island Area */}
                  <div className="absolute top-0 w-full h-8 flex justify-center z-20 pt-2">
                    <div className="w-24 h-6 black rounded-full bg-black"></div>
                  </div>

                  {/* App UI Mockup */}
                  <div className="flex-1 bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-pink-500/10 dark:from-indigo-500/30 dark:to-purple-900/20 p-6 flex flex-col">
                    <div className="mt-10 flex justify-between items-center mb-8">
                      <div className="space-y-1">
                        <div className="h-2 w-20 bg-gray-900/10 dark:bg-white/10 rounded-full" />
                        <div className="h-6 w-32 bg-gray-900/20 dark:bg-white/20 rounded-lg" />
                      </div>
                      <div className="w-10 h-10 rounded-full bg-ios-blue shadow-lg shadow-ios-blue/30" />
                    </div>

                    {/* Cards */}
                    <div className="space-y-4">
                      <div className="bg-white/80 dark:bg-white/5 backdrop-blur-md p-4 rounded-3xl shadow-sm border border-white/20">
                        <div className="flex gap-3 mb-3">
                          <div className="w-12 h-12 rounded-xl bg-ios-orange/10 flex items-center justify-center text-ios-orange">
                            <Music size={20} />
                          </div>
                          <div>
                            <div className="h-3 w-24 bg-gray-900/10 dark:bg-white/10 rounded mb-1.5" />
                            <div className="h-2 w-16 bg-gray-900/5 dark:bg-white/5 rounded" />
                          </div>
                        </div>
                        <div className="h-16 w-full bg-gray-900/5 dark:bg-white/5 rounded-2xl animate-pulse" />
                      </div>

                      <div className="bg-white/80 dark:bg-white/5 backdrop-blur-md p-4 rounded-3xl shadow-sm border border-white/20">
                        <div className="flex justify-between items-center mb-2">
                          <div className="h-3 w-16 bg-gray-900/10 dark:bg-white/10 rounded" />
                          <div className="h-5 w-12 bg-ios-green/20 rounded-full" />
                        </div>
                        <div className="space-y-2">
                          <div className="h-2 w-full bg-gray-900/5 dark:bg-white/5 rounded" />
                          <div className="h-2 w-2/3 bg-gray-900/5 dark:bg-white/5 rounded" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Tab Bar */}
                  <div className="h-16 bg-white/80 dark:bg-black/80 backdrop-blur-xl border-t border-black/5 dark:border-white/5 flex justify-around items-center px-4">
                    <div className="w-6 h-6 rounded bg-ios-blue/20 text-ios-blue flex justify-center items-center"><Music size={14} /></div>
                    <div className="w-6 h-6 rounded bg-transparent text-gray-400 flex justify-center items-center"><ShieldCheck size={14} /></div>
                    <div className="w-6 h-6 rounded bg-transparent text-gray-400 flex justify-center items-center"><Zap size={14} /></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="py-20 border-t border-black/5 dark:border-white/5">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-ios-blue flex items-center justify-center">
              <Music className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight">Instrument<span className="text-ios-blue">Collector</span></span>
          </div>
          <p className="text-sm text-gray-400 font-bold uppercase tracking-widest">
            © {new Date().getFullYear()} • Elevando el estándar del coleccionismo
          </p>
          <div className="flex gap-8 text-sm font-bold text-gray-400 uppercase tracking-widest">
            <Link href="/contact" className="hover:text-ios-blue transition-colors">Contacto</Link>
            <Link href="/terms" className="hover:text-ios-blue transition-colors">Términos</Link>
            <Link href="/privacy" className="hover:text-ios-blue transition-colors">Privacidad</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
