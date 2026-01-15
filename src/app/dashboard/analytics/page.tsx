// src/app/dashboard/analytics/page.tsx
import AnalyticsDashboard from '@/components/AnalyticsDashboard';

export const metadata = {
    title: 'Analytics Dashboard',
    description: 'Visualize instrument collection metrics and trends',
};

export default function AnalyticsPage() {
    return <AnalyticsDashboard />;
}
