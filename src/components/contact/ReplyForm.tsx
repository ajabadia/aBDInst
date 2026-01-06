'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Send } from 'lucide-react';
import { replyToContact } from '@/actions/contact';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export default function ReplyForm({ requestId }: { requestId: string }) {
    const [loading, setLoading] = useState(false);
    const [content, setContent] = useState('');
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim()) return;

        setLoading(true);
        const res = await replyToContact(requestId, content);
        setLoading(false);

        if (res.success) {
            toast.success('Respuesta enviada');
            setContent('');
            router.refresh();
        } else {
            toast.error('Error', { description: res.error });
        }
    };

    return (
        <div className="fixed bottom-0 left-0 right-0 z-[70] px-4 pb-6 sm:px-6 sm:pb-8 pointer-events-none">
            <div className="max-w-4xl mx-auto glass-panel p-4 md:p-6 rounded-[2rem] shadow-apple-lg border-white/20 dark:border-white/10 pointer-events-auto backdrop-blur-xl">
                <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 items-end">
                    <textarea
                        required
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Escribe un mensaje..."
                        className="apple-input-field flex-1 resize-none min-h-[50px] max-h-[150px] leading-relaxed py-3 text-sm"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSubmit(e);
                            }
                        }}
                    />
                    <Button
                        type="submit"
                        className="h-12 w-12 sm:w-auto px-0 sm:px-6 shadow-apple-glow shrink-0 rounded-full sm:rounded-xl"
                        isLoading={loading}
                        icon={<Send />}
                    >
                        <span className="hidden sm:inline">Enviar</span>
                    </Button>
                </form>
            </div>
        </div>
    );
}
