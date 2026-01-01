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
            icon={Plus}
            className="w-full shadow-lg shadow-blue-500/20 h-10 text-sm px-6" // Specific sizing for header
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
            toast.error('Error: ' + res.error);
        }
    }

    return (
        <form action={action}>
            <SubmitButton />
        </form>
    );
}
