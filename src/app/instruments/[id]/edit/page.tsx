
import { auth } from '@/auth';
import { getInstrumentById } from '@/actions/instrument';
import { getResources } from '@/actions/resource';
import InstrumentForm from '@/components/InstrumentForm';
import { notFound, redirect } from 'next/navigation';

export default async function EditInstrumentPage({ params }: { params: { id: string } }) {
    const { id } = await params;
    const session = await auth();

    // Check permissions
    if (!session || !['admin', 'editor'].includes((session.user as any)?.role)) {
        redirect('/login');
    }

    const instrument = await getInstrumentById(id);
    const resources = await getResources({ instrumentId: id });

    if (!instrument) {
        notFound();
    }

    return (
        <div className="container mx-auto p-8 max-w-7xl">
            <h1 className="text-2xl font-bold mb-6">Editar Instrumento</h1>
            <InstrumentForm initialData={instrument} instrumentId={id} resources={resources} />
        </div>
    );
}
