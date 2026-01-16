import { getPublicShowroom } from '@/actions/showroom';
import { notFound } from 'next/navigation';
import KioskClient from '@/components/public/KioskClient';

export default async function KioskPage(props: { params: Promise<{ slug: string }> }) {
    const params = await props.params;
    const { slug } = params;
    const showroom = await getPublicShowroom(slug);

    if (!showroom) {
        notFound();
    }

    return (
        <KioskClient showroom={showroom} />
    );
}
