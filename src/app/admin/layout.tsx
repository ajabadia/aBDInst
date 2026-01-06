import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ShieldCheck, ArrowLeft } from 'lucide-react';

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();

    // Protect route - verify session and role
    if ((session?.user as any)?.role !== 'admin') {
        redirect('/');
    }

    return (
        <div className="min-h-screen bg-background pb-20">
            {/* Secondary Admin Navbar (Apple Style) */}
            <nav className="sticky top-0 z-[60] bg-white/70 dark:bg-black/70 backdrop-blur-xl border-b border-black/5 dark:border-white/10">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-xl transition-colors text-gray-400 hover:text-gray-900 dark:hover:text-white">
                            <ArrowLeft size={20} />
                        </Link>
                        <div className="h-6 w-[1px] bg-black/5 dark:bg-white/10" />
                        <div className="flex items-center gap-2.5">
                            <ShieldCheck size={20} className="text-ios-blue" />
                            <span className="text-lg font-bold tracking-tight">Control Center</span>
                            <span className="px-2 py-0.5 text-[10px] font-bold bg-ios-red/10 text-ios-red border border-ios-red/20 rounded-full uppercase tracking-wider">Admin</span>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-6 pt-10">
                {children}
            </main>
        </div>
    );
}
