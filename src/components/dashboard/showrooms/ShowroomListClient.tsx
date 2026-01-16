'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Plus, Loader2 } from 'lucide-react';
import { createShowroom } from '@/actions/showroom';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function ShowroomListClient({ initialShowrooms }: { initialShowrooms: any[] }) {
    const router = useRouter();
    const [isCreating, setIsCreating] = useState(false);

    const handleCreate = async () => {
        setIsCreating(true);
        // Create a default untitled showroom and redirect to edit
        const res = await createShowroom({
            name: "Nuevo Showroom",
            description: "Descripción de tu nueva colección."
        });

        if (res.success && res.data) {
            toast.success("Showroom creado");
            router.push(`/dashboard/showrooms/${res.data._id}`);
        } else {
            toast.error("Error al crear showroom");
            setIsCreating(false);
        }
    };

    return (
        <div>
            {initialShowrooms.length > 0 && (
                <Button onClick={handleCreate} disabled={isCreating} icon={isCreating ? Loader2 : Plus}>
                    {isCreating ? 'Creando...' : 'Crear Showroom'}
                </Button>
            )}
            {/* If empty state, the parent handles the button or we can reuse this logic there if we passed a prop */}
            {initialShowrooms.length === 0 && (
                <div className="flex justify-center mt-6">
                    <Button onClick={handleCreate} disabled={isCreating} className="px-8 py-6 text-lg" icon={isCreating ? Loader2 : Plus}>
                        {isCreating ? 'Iniciando...' : 'Crear mi primer Showroom'}
                    </Button>
                </div>
            )}
        </div>
    );
}
