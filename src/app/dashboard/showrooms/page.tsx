import { auth } from '@/auth';
import { getUserShowrooms, createShowroom, deleteShowroom } from '@/actions/showroom';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Plus, Eye, Edit, Trash2, Layout } from 'lucide-react';
import ShowroomListClient from '@/components/dashboard/showrooms/ShowroomListClient';

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
                        <div key={showroom._id} className="group apple-card bg-white dark:bg-white/5 overflow-hidden flex flex-col h-full hover:shadow-apple-lg transition-all duration-300">
                            {/* Preview Banner (Simulated) */}
                            <div className={`h-32 w-full ${showroom.theme === 'dark' ? 'bg-gray-900' : 'bg-gray-100'} relative flex items-center justify-center`}>
                                <Layout className="text-black/10 dark:text-white/10 w-16 h-16" />
                                {showroom.items.length > 0 && (
                                    <div className="absolute bottom-3 right-3 bg-black/50 text-white text-xs font-bold px-2 py-1 rounded-full backdrop-blur-md">
                                        {showroom.items.length} ítems
                                    </div>
                                )}
                            </div>

                            <div className="p-6 flex-grow space-y-4">
                                <div>
                                    <h3 className="text-xl font-bold truncate">{showroom.name}</h3>
                                    <p className="text-sm text-gray-500 line-clamp-2 min-h-[2.5em]">
                                        {showroom.description || "Sin descripción"}
                                    </p>
                                </div>

                                <div className="flex items-center gap-3 pt-4 text-xs text-gray-400 font-medium border-t border-gray-100 dark:border-white/5">
                                    <span className="flex items-center gap-1"><Eye size={14} /> {showroom.stats?.views || 0} vistas</span>
                                    <span className="flex items-center gap-1 ml-auto">
                                        {new Date(showroom.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>

                            <div className="p-4 bg-gray-50 dark:bg-black/20 flex items-center gap-2">
                                <Link href={`/s/${showroom.slug}`} target="_blank" className="flex-1">
                                    <Button variant="secondary" className="w-full text-xs h-9 justify-center" icon={Eye}>
                                        Ver
                                    </Button>
                                </Link>
                                <Link href={`/dashboard/showrooms/${showroom._id}`} className="flex-1">
                                    <Button className="w-full text-xs h-9 justify-center" icon={Edit}>
                                        Editar
                                    </Button>
                                </Link>
                                {/* Delete Button would be here (or inside edit) */}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
