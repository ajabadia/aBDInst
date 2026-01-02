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
            icon={Plus}
            className="shadow-sm shadow-blue-500/20" // Standard sizing is handled by Button component base styles
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
