import ExhibitionManager from '@/components/dashboard/admin/exhibitions/ExhibitionManager';
import { getAllExhibitions } from '@/actions/exhibition';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { CalendarRange } from 'lucide-react';

export default async function AdminExhibitionPage() {
    const session = await auth();
    const role = (session?.user as any)?.role;

    if (!['admin', 'supereditor'].includes(role)) {
        redirect('/dashboard');
    }

    const exhibitions = await getAllExhibitions();

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-20">
            <div>
                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                    <CalendarRange className="text-purple-600" />
                    Gestión de Exhibiciones
                </h1>
                <p className="text-gray-500">Crea concursos, asigna fechas y controla el estado de las exhibiciones.</p>
            </div>

            <ExhibitionManager exhibitions={exhibitions} />
        </div>
    );
}
