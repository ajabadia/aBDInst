
import BadgeManager from '@/components/admin/BadgeManager';

export default function GamificationAdminPage() {
    return (
        <div className="max-w-7xl mx-auto px-6 space-y-8 pb-20 pt-12">
            <header>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Fábrica de Trofeos</h1>
                <p className="text-gray-500 dark:text-gray-400">Gestiona las medallas, logros y recompensas de la comunidad.</p>
            </header>

            <BadgeManager />
        </div>
    );
}
