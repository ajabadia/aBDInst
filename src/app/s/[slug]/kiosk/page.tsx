import { getPublicShowroom } from '@/actions/showroom';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import KioskWrapper from './KioskWrapper';

export default async function KioskPage(props: { params: Promise<{ slug: string }> }) {
    const params = await props.params;
    const { slug } = params;

    // Fetch with same logic as public page
    const showroom = await getPublicShowroom(slug);

    if (!showroom) return notFound();

    // Kiosk Security: If not enabled, return 404 or access denied
    // (Though owner might want to preview it even if disabled? Let's check session)
    const session = await (await import('@/auth')).auth();
    const isOwner = session?.user?.id === showroom.userId?._id?.toString() || session?.user?.id === showroom.userId?.toString();

    if (!showroom.kioskEnabled && !isOwner) {
        return (
            <div className="h-screen w-full flex flex-col items-center justify-center bg-black text-white p-8 text-center">
                <h1 className="text-2xl font-bold mb-4">Modo Kiosco Deshabilitado</h1>
                <p className="text-gray-400 mb-8">El propietario ha desactivado esta función.</p>
                <Link href={`/s/${slug}`} className="px-6 py-3 bg-white text-black rounded-full font-bold flex items-center gap-2">
                    <ArrowLeft size={18} /> Volver al Showroom
                </Link>
            </div>
        );
    }

    // Create a Client Component wrapper to handle navigation logic (exit)
    return (
        <KioskWrapper showroom={showroom} slug={slug} />
    );
}
