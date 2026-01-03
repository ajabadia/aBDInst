import { getPriceAlerts } from '@/actions/scraping';
import AlertsManager from '@/components/scraping/AlertsManager';

export default async function AlertsPage() {
    const alerts = await getPriceAlerts();

    return (
        <div className="container mx-auto px-6 py-10 max-w-7xl space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight mb-2">Alertas de Precios</h1>
                <p className="text-gray-500">
                    Rastrea el mercado y recibe notificaciones cuando aparezcan instrumentos a tu precio objetivo.
                </p>
            </div>

            <AlertsManager initialAlerts={alerts} />
        </div>
    );
}
