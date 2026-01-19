'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Play } from 'lucide-react';

interface ShowroomHeaderActionsProps {
    slug: string;
    isDark: boolean;
    kioskEnabled: boolean;
}

export default function ShowroomHeaderActions({ slug, isDark, kioskEnabled }: ShowroomHeaderActionsProps) {
    return (
        <div className="flex gap-4">
            {kioskEnabled && (
                <Link href={`/s/${slug}/kiosk`}>
                    <Button variant={isDark ? "secondary" : "primary"} icon={Play} className="px-6 rounded-full shadow-xl">
                        Modo Kiosco
                    </Button>
                </Link>
            )}
        </div>
    );
}
