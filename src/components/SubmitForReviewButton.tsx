
'use client';

import { useState } from 'react';
import { submitForReview } from '@/actions/instrument';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { Send, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function SubmitForReviewButton({ id, currentStatus }: { id: string, currentStatus: string }) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    if (currentStatus !== 'draft' && currentStatus !== 'rejected') return null;

    const handleSubmit = async () => {
        setLoading(true);
        const res = await submitForReview(id);
        if (res.success) {
            toast.success('Enviado a revisión');
            router.refresh();
        } else {
            toast.error(res.error);
        }
        setLoading(false);
    };

    return (
        <Button onClick={handleSubmit} disabled={loading} className="bg-green-600 text-white hover:bg-green-700">
            {loading ? <Loader2 className="animate-spin" /> : <Send size={16} />}
            Solicitar Aprobación
        </Button>
    );
}
