'use client';

import { useState } from 'react';
import { Button } from './ui/Button';
import { requestPasswordReset } from '@/actions/password-reset';
import { toast } from 'sonner';
import { Mail, ArrowRight, CheckCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

export default function ForgotPasswordForm() {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const res = await requestPasswordReset(email);
            if (res.success) {
                setIsSuccess(true);
                toast.success('Correo enviado');
            } else {
                toast.error(res.error || 'Error al enviar correo');
            }
        } catch (err: any) {
            toast.error('Error de conexión');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md mx-auto">
            <AnimatePresence mode="wait">
                {!isSuccess ? (
                    <motion.div
                        key="form"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                    >
                        <div className="space-y-2 text-center">
                            <h1 className="text-2xl font-bold tracking-tight">Recuperar Contraseña</h1>
                            <p className="text-gray-500 text-sm">Introduce tu email y te enviaremos instrucciones.</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <label htmlFor="email" className="apple-label">Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        id="email"
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="apple-input pl-10"
                                        placeholder="tu@email.com"
                                    />
                                </div>
                            </div>
                            <Button
                                type="submit"
                                className="w-full"
                                isLoading={isLoading}
                            >
                                Enviar Instrucciones <ArrowRight size={16} className="ml-2" />
                            </Button>
                        </form>

                        <div className="text-center">
                            <Link href="/login" className="text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors flex items-center justify-center gap-1">
                                <ArrowLeft size={14} /> Volver al login
                            </Link>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="success"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center space-y-6"
                    >
                        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                            <CheckCircle size={32} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold mb-2">¡Correo Enviado!</h2>
                            <p className="text-gray-500 text-sm">
                                Si el correo <strong>{email}</strong> está registrado, recibirás un enlace para restablecer tu contraseña.
                            </p>
                            <p className="text-xs text-gray-400 mt-4">
                                Revisa tu bandeja de spam si no lo ves en unos minutos.
                            </p>
                        </div>
                        <Button
                            variant="secondary"
                            className="w-full"
                            onClick={() => setIsSuccess(false)}
                        >
                            Probar con otro email
                        </Button>
                        <div className="text-center">
                            <Link href="/login" className="text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                                Volver al login
                            </Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
