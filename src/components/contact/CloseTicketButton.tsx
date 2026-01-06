'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Lock } from 'lucide-react';
import { closeContactRequest } from '@/actions/contact';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export default function CloseTicketButton({ requestId, isIconOnly = false }: { requestId: string, isIconOnly?: boolean }) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleClose = async () => {
        if (!confirm('¿Estás seguro de que quieres cerrar esta conversación? No podrás enviar ni recibir más mensajes.')) return;

        setLoading(true);
        const res = await closeContactRequest(requestId);
        setLoading(false);

        if (res.success) {
            toast.success('Conversación cerrada');
            router.refresh();
        } else {
            toast.error('Error', { description: res.error });
        }
    };

    if (isIconOnly) {
        return (
            <Button
                variant="ghost"
                size="sm"
                onClick={handleClose}
                isLoading={loading}
                title="Cerrar Ticket"
                className="text-gray-400 hover:text-black dark:hover:text-white"
            >
                <Lock size={18} />
            </Button>
        );
    }

    return (
        <Button
            variant="secondary"
            size="sm"
            icon={<Lock />}
            onClick={handleClose}
            isLoading={loading}
            className="bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30 border-red-200 dark:border-red-900/50"
        >
            Cerrar Conversación
        </Button>
    );
}
