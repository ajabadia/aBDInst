'use client';

import { Button } from '@/components/ui/Button';
import { Plus, Loader2 } from 'lucide-react';
import { createArticle } from '@/actions/blog';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

export default function BlogListClient() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const handleCreate = async () => {
        setIsLoading(true);
        const res = await createArticle({ title: 'Nuevo Artículo Sin Título', content: 'Escribe aquí tu contenido...' });

        if (res.success) {
            toast.success("Borrador creado");
            router.push(`/dashboard/blog/editor/${res.id}`);
        } else {
            toast.error(res.error || "Error al crear artículo");
            setIsLoading(false);
        }
    };

    return (
        <Button onClick={handleCreate} disabled={isLoading} icon={isLoading ? Loader2 : Plus} className="shadow-xl">
            1
            {isLoading ? 'Creando...' : 'Nuevo Artículo'}
        </Button>
    );
}
