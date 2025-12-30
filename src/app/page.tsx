import Link from 'next/link';
import { auth } from '@/auth';

export default async function Home() {
  const session = await auth();

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      {/* Hero Section */}
      <section className="flex-grow flex flex-col justify-center items-center text-center px-4 py-20 bg-gradient-to-b from-white to-blue-50 dark:from-gray-950 dark:to-gray-900">
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">
          Tu Colección.<br />Elevada.
        </h1>
        <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-2xl mb-10">
          Gestiona tus instrumentos musicales con la precisión que merecen.
          Catálogo maestro, inventario personal y seguimiento detallado en una sola app.
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          {!session ? (
            <Link
              href="/api/auth/signin"
              className="px-8 py-3 bg-blue-600 text-white rounded-full text-lg font-semibold hover:bg-blue-700 transition shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              Empezar Ahora
            </Link>
          ) : (
            <Link
              href="/dashboard"
              className="px-8 py-3 bg-blue-600 text-white rounded-full text-lg font-semibold hover:bg-blue-700 transition shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              Ir a mi Colección
            </Link>
          )}
          <Link
            href="/instruments"
            className="px-8 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-full text-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition shadow hover:shadow-md"
          >
            Explorar Catálogo
          </Link>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-white dark:bg-gray-950 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-3 gap-8 text-center md:text-left">
            <div className="p-6 rounded-2xl bg-gray-50 dark:bg-gray-900 border dark:border-gray-800">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-xl flex items-center justify-center mb-4 text-2xl mx-auto md:mx-0">
                🎸
              </div>
              <h3 className="text-xl font-bold mb-2">Catálogo Maestro</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Una base de datos curada con especificaciones técnicas, historias y fotos genéricas de miles de instrumentos.
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-gray-50 dark:bg-gray-900 border dark:border-gray-800">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-xl flex items-center justify-center mb-4 text-2xl mx-auto md:mx-0">
                📦
              </div>
              <h3 className="text-xl font-bold mb-2">Inventario Personal</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Añade tus unidades, registra números de serie, precios de compra, sube tus fotos y documenta reparaciones.
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-gray-50 dark:bg-gray-900 border dark:border-gray-800">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-xl flex items-center justify-center mb-4 text-2xl mx-auto md:mx-0">
                📱
              </div>
              <h3 className="text-xl font-bold mb-2">Mobile First & PWA</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Instálala en tu móvil. Funciona offline para que siempre tengas acceso a tu inventario, estés donde estés.
              </p>
            </div>
          </div>
        </div>
      </section>

      <footer className="py-8 text-center text-sm text-gray-500 dark:text-gray-600 border-t dark:border-gray-800">
        <p>Instrument Collector © {new Date().getFullYear()} - Built with Next.js 15</p>
      </footer>
    </div>
  );
}
