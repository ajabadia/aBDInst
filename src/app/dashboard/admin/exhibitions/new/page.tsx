import ExhibitionForm from '@/components/dashboard/admin/ExhibitionForm';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';

export default async function NewExhibitionPage() {
    const session = await auth();
    if (!['admin', 'supereditor'].includes((session?.user as any)?.role)) {
        redirect('/dashboard');
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Nueva Exposición</h1>
                <p className="text-gray-500">Crea un evento temporal para la comunidad.</p>
            </div>
            <ExhibitionForm />
        </div>
    );
}
