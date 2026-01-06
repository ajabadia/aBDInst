import { getPriceAlerts } from '@/actions/scraping';
import AlertsManager from '@/components/scraping/AlertsManager';
import { Bell, TrendingDown, Target } from 'lucide-react';

export default async function AlertsPage() {
    const alerts = await getPriceAlerts();
    const activeAlertsCount = alerts.length;

    return (
        <div className="max-w-7xl mx-auto px-6 py-12 lg:py-20">
            {/* Header with Stats */}
            <header className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-ios-indigo/10 text-ios-indigo rounded-xl shadow-sm">
                            <Bell className="w-6 h-6" />
                        </div>
                        <h1 className="text-4xl font-bold tracking-tight">Alertas de Precios</h1>
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 font-medium ml-1">
                        Rastrea el mercado secundario y recibe avisos cuando bajen los precios.
                    </p>
                </div>

                <div className="flex gap-4">
                    <div className="glass-panel px-6 py-3 rounded-2xl border-black/5 flex items-center gap-4">
                        <Target size={20} className="text-ios-indigo" />
                        <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Rastreando</p>
                            <p className="text-xl font-bold leading-none">{activeAlertsCount}</p>
                        </div>
                    </div>
                </div>
            </header>

            <div className="space-y-8">
                {/* Information Callout */}
                <div className="bg-ios-indigo/5 border border-ios-indigo/10 rounded-2xl p-6 flex items-start gap-4">
                    <div className="p-2 bg-ios-indigo text-white rounded-lg shrink-0">
                        <TrendingDown size={20} />
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-ios-indigo mb-1">Inteligencia de Mercado Activa</h4>
                        <p className="text-xs text-ios-indigo/70 leading-relaxed">
                            Nuestro sistema escanea Reverb, eBay y Wallapop cada hora buscando coincidencias con tus precios objetivo. 
                            Asegúrate de tener un Proxy configurado en el panel de administración para un rastreo ininterrumpido.
                        </p>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="glass-panel rounded-[2rem] overflow-hidden shadow-apple-lg">
                    <AlertsManager initialAlerts={alerts} />
                </div>
            </div>
        </div>
    );
}
