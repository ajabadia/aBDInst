import { auth } from '@/auth';
import { getUserShowrooms, createShowroom, deleteShowroom } from '@/actions/showroom';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Layout } from 'lucide-react';
import ShowroomListClient from '@/components/dashboard/showrooms/ShowroomListClient';
import ShowroomCard from '@/components/dashboard/showrooms/ShowroomCard';

export default async function ShowroomsPage() {
    const session = await auth();
    if (!session) redirect('/login');

    const showrooms = await getUserShowrooms();

    return (
        <div className="max-w-7xl mx-auto px-6 py-12 lg:py-20 space-y-12">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div className="space-y-2">
                    <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
                        Mis <span className="text-ios-blue">Showrooms</span>
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 font-medium">
                        Crea exhibiciones curadas de tu colección para compartirlas con el mundo.
                    </p>
                </div>
                <ShowroomListClient initialShowrooms={showrooms} />
            </header>

            {showrooms.length === 0 ? (
                <div className="text-center py-20 bg-gray-50 dark:bg-white/5 rounded-[2.5rem] border border-black/5 dark:border-white/5">
                    <Layout className="w-24 h-24 mx-auto text-gray-300 dark:text-gray-600 mb-6" />
                    <h3 className="text-2xl font-bold mb-2">No tienes showrooms todavía</h3>
                    <p className="text-gray-500 max-w-md mx-auto mb-8">
                        Organiza tus instrumentos en colecciones temáticas (ej. "Mi Pedalera", "Guitarras 80s") y compártelas.
                    </p>
                    {/* The create button is inside Client Component to handle modal/action */}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {showrooms.map((showroom: any) => (
                        <ShowroomCard key={showroom._id} showroom={showroom} />
                    ))}
                </div>
            )}
        </div>
    );
}
