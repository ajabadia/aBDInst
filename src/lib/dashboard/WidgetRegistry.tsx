import dynamic from 'next/dynamic';
import { ReactNode } from 'react';

// Lazy load widgets for performance
const DistributionCharts = dynamic(() => import('@/components/DistributionCharts'), { ssr: false });
const EnhancedStats = dynamic(() => import('@/components/EnhancedStats'), { ssr: false });
const ActivityFeed = dynamic(() => import('@/components/social/ActivityFeed'), { ssr: false });
const ValueEvolutionChart = dynamic(() => import('@/components/ValueEvolutionChart'), { ssr: false });
const StudioCollection = dynamic(() => import('@/components/StudioCollection'), { ssr: false });
const MaintenanceForecast = dynamic(() => import('@/components/analytics/MaintenanceForecast'), { ssr: false });
const TopMovers = dynamic(() => import('@/components/analytics/TopMovers'), { ssr: false });
const FinanceOverview = dynamic(() => import('@/components/finance/FinanceOverview'), { ssr: false });

export type WidgetId = 'stats' | 'evolution' | 'distribution' | 'movers' | 'forecast' | 'activity' | 'finance_overview' | 'studio_collection';

export interface WidgetDefinition {
    id: WidgetId;
    title: string;
    // Allow any component type that accepts props
    component: React.ComponentType<any>;
    defaultVisible: boolean;
    defaultOrder: number;
    colSpan?: 1 | 2; // 1 = half width, 2 = full width
}

export const WIDGET_REGISTRY: Record<WidgetId, WidgetDefinition> = {
    'stats': {
        id: 'stats',
        title: 'Estadísticas Rápidas',
        component: EnhancedStats,
        defaultVisible: true,
        defaultOrder: 0,
        colSpan: 1
    },
    'evolution': {
        id: 'evolution',
        title: 'Evolución de Valor',
        component: ValueEvolutionChart,
        defaultVisible: true,
        defaultOrder: 1,
        colSpan: 2
    },
    'studio_collection': {
        id: 'studio_collection',
        title: 'Mi Estudio',
        component: StudioCollection,
        defaultVisible: true,
        defaultOrder: 2,
        colSpan: 2
    },
    'distribution': {
        id: 'distribution',
        title: 'Distribución',
        component: DistributionCharts,
        defaultVisible: true,
        defaultOrder: 3,
        colSpan: 2
    },
    'movers': {
        id: 'movers',
        title: 'Top Movers',
        component: TopMovers,
        defaultVisible: true,
        defaultOrder: 4,
        colSpan: 1
    },
    'forecast': {
        id: 'forecast',
        title: 'Mantenimiento',
        component: MaintenanceForecast,
        defaultVisible: true,
        defaultOrder: 5,
        colSpan: 1
    },
    'activity': {
        id: 'activity',
        title: 'Actividad Reciente',
        component: ActivityFeed,
        defaultVisible: true,
        defaultOrder: 6,
        colSpan: 1
    },
    'finance_overview': {
        id: 'finance_overview',
        title: 'Resumen Financiero',
        component: FinanceOverview,
        defaultVisible: false, // Hidden by default in overview
        defaultOrder: 7,
        colSpan: 2
    }
};

export const DEFAULT_LAYOUT = Object.values(WIDGET_REGISTRY).sort((a, b) => a.defaultOrder - b.defaultOrder);
