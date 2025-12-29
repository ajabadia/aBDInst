import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import InstrumentForm from '@/components/InstrumentForm';

export default async function NewInstrumentPage() {
    const session = await auth();
    const role = (session?.user as any)?.role;

    if (!['admin', 'editor'].includes(role)) {
        redirect('/instruments');
    }

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-6 text-center">Nuevo Instrumento</h1>
            <InstrumentForm />
        </div>
    );
}
