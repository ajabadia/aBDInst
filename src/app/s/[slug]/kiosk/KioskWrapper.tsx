'use client';

import { useRouter } from 'next/navigation';
import KioskPlayer from '@/components/public/KioskPlayer';

export default function KioskWrapper({ showroom, slug }: { showroom: any, slug: string }) {
    const router = useRouter();

    const handleExit = () => {
        router.push(`/s/${slug}`);
    };

    return <KioskPlayer showroom={showroom} onExit={handleExit} />;
}
