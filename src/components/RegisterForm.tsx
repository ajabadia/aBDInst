'use client';

import { registerUser } from "@/actions/register";
import { useFormStatus } from "react-dom";
import Link from 'next/link';

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <button
            type="submit"
            disabled={pending}
            className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded hover:bg-blue-700 focus:outline-none focus:shadow-outline disabled:opacity-50"
        >
            {pending ? 'Creando cuenta...' : 'Registrarse'}
        </button>
    );
}

export default function RegisterForm() {
    async function action(formData: FormData) {
        const res = await registerUser(formData);
        if (res.success) {
            alert('Cuenta creada correctamente. Ahora puedes iniciar sesión.');
            window.location.href = '/api/auth/signin';
        } else {
            alert('Error: ' + res.error);
        }
    }

    return (
        <div className="w-full max-w-sm bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-6 text-center text-gray-800 dark:text-gray-100">Crear Cuenta</h2>
            <form action={action}>
                <div className="mb-4">
                    <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="name">
                        Nombre
                    </label>
                    <input
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        id="name"
                        name="name"
                        type="text"
                        placeholder="Tu Nombre"
                        required
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="email">
                        Email
                    </label>
                    <input
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        id="email"
                        name="email"
                        type="email"
                        placeholder="tu@email.com"
                        required
                    />
                </div>
                <div className="mb-6">
                    <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="password">
                        Contraseña
                    </label>
                    <input
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
                        id="password"
                        name="password"
                        type="password"
                        placeholder="********"
                        required
                    />
                </div>
                <div className="flex items-center justify-between">
                    <SubmitButton />
                </div>
            </form>
            <div className="mt-4 text-center">
                <Link href="/api/auth/signin" className="text-sm text-blue-500 hover:text-blue-800">
                    ¿Ya tienes cuenta? Inicia sesión
                </Link>
            </div>
        </div>
    );
}
