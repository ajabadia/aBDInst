'use client';

import { useState } from 'react';
import { Button } from './ui/Button';
import { resetPassword } from '@/actions/password-reset';
import { toast } from 'sonner';
import { Lock, Eye, EyeOff, Check, ArrowRight, XCircle } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';

export default function ResetPasswordForm() {
    const searchParams = useSearchParams();
    const token = searchParams?.get('token');
    const router = useRouter();

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const [isLoading, setIsLoading] = useState(false);

    if (!token) {
        return (
            <div className="text-center p-8 bg-red-50 text-red-600 rounded-2xl">
                <XCircle size={40} className="mx-auto mb-4" />
                <h3 className="font-bold text-lg">Enlace invadido</h3>
                <p>El enlace de recuperación no contiene un token válido.</p>
            </div>
        );
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            toast.error('Las contraseñas no coinciden');
            return;
        }

        if (password.length < 6) {
            toast.error('La contraseña debe tener al menos 6 caracteres');
            return;
        }

        setIsLoading(true);

        try {
            const res = await resetPassword(token, password);
            if (res.success) {
                toast.success('Tu contraseña ha sido restablecida');
                // Optional: Sign in automatically or redirect to login
                router.push('/login?reset=success');
            } else {
                toast.error(res.error || 'Error al restablecer contraseña');
            }
        } catch (err: any) {
            toast.error('Error de conexión');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto space-y-6">
            <div className="space-y-2 text-center">
                <h1 className="text-2xl font-bold tracking-tight">Nueva Contraseña</h1>
                <p className="text-gray-500 text-sm">Introduce tu nueva contraseña segura.</p>
            </div>

            <div className="space-y-4">
                <div className="space-y-2">
                    <label className="apple-label">Contraseña</label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type={showPassword ? 'text' : 'password'}
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="apple-input pl-10 pr-10"
                            placeholder="••••••"
                            minLength={6}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="apple-label">Confirmar Contraseña</label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type={showPassword ? 'text' : 'password'}
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="apple-input pl-10"
                            placeholder="••••••"
                        />
                        {password && confirmPassword && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                {password === confirmPassword ? (
                                    <Check size={16} className="text-green-500" />
                                ) : (
                                    <XCircle size={16} className="text-red-500" />
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <Button
                type="submit"
                className="w-full"
                isLoading={isLoading}
                disabled={!password || !confirmPassword}
            >
                Restablecer y Entrar <ArrowRight size={16} className="ml-2" />
            </Button>
        </form>
    );
}
