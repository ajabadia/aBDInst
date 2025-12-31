'use client';

import { registerUser } from "@/actions/register";
import { useState } from "react";
import Link from 'next/link';
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Mail, Lock, User, Music } from 'lucide-react';
import { Input } from "./ui/Input";
import { Button } from "./ui/Button";

export default function RegisterForm() {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    // Use standard form submission instead of Server Action binding for loading state control
    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setLoading(true);

        const formData = new FormData(event.currentTarget);

        const res = await registerUser(formData);

        if (res.success) {
            toast.success('Cuenta creada correctamente. Iniciando sesión...');
            // Redirect to signin
            router.push('/api/auth/signin');
        } else {
            toast.error('Error: ' + res.error);
            setLoading(false);
        }
    }

    return (
        <div className="w-full max-w-md">
            <div className="bg-white/70 dark:bg-white/5 backdrop-blur-2xl p-10 md:p-12 rounded-[3rem] border border-gray-200/50 dark:border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.1)]">

                {/* Header del Registro */}
                <div className="flex flex-col items-center mb-10">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-green-500 to-teal-500 flex items-center justify-center mb-6 shadow-xl shadow-green-500/20">
                        <Music className="text-white w-8 h-8" strokeWidth={2.5} />
                    </div>
                    <h2 className="text-3xl font-semibold tracking-tighter text-gray-900 dark:text-white">
                        Crear Cuenta
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 mt-2 text-center">
                        Únete y empieza a organizar.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <Input
                        label="Nombre"
                        name="name"
                        type="text"
                        placeholder="Tu Nombre"
                        icon={User}
                        required
                    />
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
                            Registrarse
                        </Button>
                    </div>
                </form>

                <div className="mt-10 text-center">
                    <p className="text-sm text-gray-500">
                        ¿Ya tienes cuenta?{' '}
                        <Link href="/api/auth/signin" className="text-blue-600 dark:text-blue-400 font-semibold hover:underline decoration-2 underline-offset-4">
                            Inicia sesión
                        </Link>
                    </p>
                </div>
            </div>

            {/* Footer sutil */}
            <p className="mt-8 text-center text-xs text-gray-400 font-medium px-10 leading-relaxed">
                Únete a la comunidad de coleccionistas más organizada del mundo.
            </p>
        </div>
    );
}
