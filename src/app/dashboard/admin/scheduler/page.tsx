import SchedulerClient from '@/components/dashboard/admin/SchedulerClient';
import { getTimeline } from '@/actions/scheduler';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';

export default async function AdminSchedulerPage(props: { searchParams: Promise<{ month?: string, year?: string }> }) {
    const session = await auth();
    if (!['admin', 'supereditor'].includes((session?.user as any)?.role)) {
        redirect('/dashboard');
    }
    const searchParams = await props.searchParams;

    // Default to current month or params
    const now = new Date();
    const month = searchParams.month ? parseInt(searchParams.month) : now.getMonth();
    const year = searchParams.year ? parseInt(searchParams.year) : now.getFullYear();

    // Calculated range for the view (First to Last day of month)
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0);

    const timelineData = await getTimeline(startDate, endDate);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Agenda del Curador</h1>
                <p className="text-gray-500">Planificación editorial y eventos del museo.</p>
            </div>

            <SchedulerClient
                initialData={timelineData}
                month={month}
                year={year}
            />
        </div>
    );
}
