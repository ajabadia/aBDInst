import LoginForm from "@/components/LoginForm";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function LoginPage() {
    const session = await auth();
    if (session) {
        redirect('/dashboard');
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#f5f5f7] dark:bg-[#000] relative overflow-hidden">
            {/* Círculos decorativos de fondo para el efecto cristal */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-400/10 blur-[120px]" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-400/10 blur-[120px]" />

            <LoginForm />
        </div>
    );
}
