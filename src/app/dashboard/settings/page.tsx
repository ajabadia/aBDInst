import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import UserSettingsForm from '@/components/UserSettingsForm';
import { Settings } from 'lucide-react';

export default async function SettingsPage() {
    const session = await auth();
    if (!session?.user?.id) {
        redirect('/login');
    }

    await dbConnect();
    const user = await User.findById(session.user.id).lean();

    if (!user) {
        redirect('/login');
    }

    // Convert MongoDB objects to plain JS for the client component
    const sanitizedUser = JSON.parse(JSON.stringify(user));

    return (
        <div className="container mx-auto px-6 py-12 max-w-6xl">
            <div className="flex items-center gap-4 mb-12">
                <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-900 dark:text-white">
                    <Settings size={28} />
                </div>
                <div>
                    <h1 className="text-4xl font-bold tracking-tight">Ajustes</h1>
                    <p className="text-gray-500">Gestiona tu identidad y seguridad en Instrument Collector</p>
                </div>
            </div>

            <UserSettingsForm user={sanitizedUser} />
        </div>
    );
}
