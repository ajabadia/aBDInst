'use client';

import { signIn } from "next-auth/react";
import { useState } from "react";
import Link from 'next/link';
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Mail, Lock, Music } from 'lucide-react';
import { Input } from "./ui/Input";
import { Button } from "./ui/Button";

export default function LoginForm() {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setLoading(true);

        const formData = new FormData(event.currentTarget);
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;

        try {
            const result = await signIn('credentials', { email, password, redirect: false });

            if (result?.error) {
                toast.error('Acceso denegado', {
                    description: 'Email o contraseña incorrectos.'
                });
                setLoading(false);
            } else {
                toast.success('¡Bienvenido de nuevo!');
                router.push('/dashboard');
                router.refresh();
            }
        } catch (e) {
            toast.error('Error del sistema');
            setLoading(false);
        }
    }

    return (
        <div className="w-full max-w-md animate-in fade-in zoom-in-95 duration-500">
            <div className="glass-panel p-10 md:p-14 rounded-[3rem] shadow-apple-lg border-white/20">

                {/* Apple ID Style Header */}
                <div className="flex flex-col items-center mb-12">
                    <div className="w-20 h-20 rounded-2xl bg-ios-blue flex items-center justify-center mb-6 shadow-lg shadow-ios-blue/30 scale-110">
                        <Music className="text-white w-10 h-10" strokeWidth={2.5} />
                    </div>
                    <h2 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
                        Iniciar sesión
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 mt-3 text-center font-medium">
                        Accede a tu bóveda de instrumentos.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <Input
                        label="Correo electrónico"
                        name="email"
                        type="email"
                        placeholder="ejemplo@icloud.com"
                        icon={Mail}
                        required
                    />
                    <Input
                        label="Contraseña"
                        name="password"
                        type="password"
                        placeholder="••••••••"
                        icon={Lock}
                        required
                    />


                    <div className="flex justify-end">
                        <Link href="/forgot-password" className="text-xs font-semibold text-ios-blue hover:underline">
                            ¿Olvidaste tu contraseña?
                        </Link>
                    </div>

                    <div className="pt-2">
                        <Button type="submit" isLoading={loading} className="w-full py-4 text-lg shadow-apple-glow">
                            Entrar
                        </Button>
                    </div>
                </form>

                <div className="mt-12 text-center">
                    <p className="text-sm text-gray-500 font-medium">
                        ¿Nuevo en el coleccionismo?{' '}
                        <Link href="/register" className="text-ios-blue font-bold hover:underline decoration-2 underline-offset-4">
                            Crear una cuenta
                        </Link>
                    </p>
                </div>
            </div>

            <p className="mt-10 text-center text-[11px] text-gray-400 font-bold uppercase tracking-[0.2em] px-10 leading-relaxed opacity-60">
                Seguridad de grado militar • Cifrado extremo
            </p>
        </div>
    );
}
