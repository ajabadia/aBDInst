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
                toast.error('Credenciales incorrectas', {
                    description: 'Por favor, revisa tu email y contraseña.'
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
        <div className="w-full max-w-md">
            <div className="bg-white/70 dark:bg-white/5 backdrop-blur-2xl p-10 md:p-12 rounded-[3rem] border border-gray-200/50 dark:border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.1)]">

                {/* Header del Login */}
                <div className="flex flex-col items-center mb-10">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center mb-6 shadow-xl shadow-blue-500/20">
                        <Music className="text-white w-8 h-8" strokeWidth={2.5} />
                    </div>
                    <h2 className="text-3xl font-semibold tracking-tighter text-gray-900 dark:text-white">
                        Iniciar sesión
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 mt-2 text-center">
                        Gestiona tu colección personal.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <Input
                        label="Email"
                        name="email"
                        type="email"
                        placeholder="tu@email.com"
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

                    <div className="pt-4">
                        <Button type="submit" isLoading={loading} className="w-full py-4 text-lg">
                            Entrar
                        </Button>
                    </div>
                </form>

                <div className="mt-10 text-center">
                    <p className="text-sm text-gray-500">
                        ¿No tienes cuenta?{' '}
                        <Link href="/register" className="text-blue-600 dark:text-blue-400 font-semibold hover:underline decoration-2 underline-offset-4">
                            Regístrate gratis
                        </Link>
                    </p>
                </div>
            </div>

            {/* Footer sutil estilo Apple */}
            <p className="mt-8 text-center text-xs text-gray-400 font-medium px-10 leading-relaxed">
                Tus datos están protegidos con cifrado de grado industrial. Al entrar, aceptas nuestros términos.
            </p>
        </div>
    );
}
