import ResetPasswordForm from '@/components/ResetPasswordForm';
import { Metadata } from 'next';
import { Suspense } from 'react';

export const metadata: Metadata = {
    title: 'Restablecer Contraseña - Instrument Collector',
    description: 'Crea una nueva contraseña segura.',
};

export default function ResetPasswordPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-black px-6">
            <div className="w-full max-w-md">
                <Suspense fallback={<div>Cargando...</div>}>
                    <ResetPasswordForm />
                </Suspense>
            </div>
        </div>
    );
}
