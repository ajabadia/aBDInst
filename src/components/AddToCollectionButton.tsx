'use client';

import { addToCollection } from '@/actions/collection';
import { useFormStatus } from 'react-dom';

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <button
            disabled={pending}
            className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition disabled:opacity-50"
        >
            {pending ? 'Añadiendo...' : 'Añadir a mi Colección'}
        </button>
    );
}

export default function AddToCollectionButton({ instrumentId }: { instrumentId: string }) {
    async function action() {
        const res = await addToCollection(instrumentId);
        if (res.success) {
            alert('Añadido a tu colección!');
            // Redirect or update UI?
            window.location.href = '/dashboard';
        } else {
            alert('Error: ' + res.error);
        }
    }

    return (
        <form action={action} className="mt-4">
            <SubmitButton />
        </form>
    );
}
