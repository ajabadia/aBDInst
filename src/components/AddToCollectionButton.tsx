'use client';

import { addToCollection } from '@/actions/collection';
import { useFormStatus } from 'react-dom';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Plus } from 'lucide-react';

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button
            isLoading={pending}
            variant="primary"
            icon={Plus}
            className="w-full md:w-auto"
        >
            {pending ? 'Añadiendo...' : 'Añadir a mi Colección'}
        </Button>
    );
}

export default function AddToCollectionButton({ instrumentId }: { instrumentId: string }) {
    const router = useRouter();

    async function action() {
        const res = await addToCollection(instrumentId);
        if (res.success) {
            toast.success('Añadido a tu colección!');
            router.push('/dashboard');
            router.refresh();
        } else {
            toast.error(res.error || 'Error al añadir a la colección');
        }
    }

    return (
        <form action={action} className="w-full md:w-auto">
            <SubmitButton />
        </form>
    );
}
