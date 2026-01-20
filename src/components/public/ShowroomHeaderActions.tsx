'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Play, QrCode } from 'lucide-react';
import QRCodeModal from './QRCodeModal';

interface ShowroomHeaderActionsProps {
    slug: string;
    isDark: boolean;
    kioskEnabled: boolean;
}

export default function ShowroomHeaderActions({ slug, isDark, kioskEnabled }: ShowroomHeaderActionsProps) {
    const [showQR, setShowQR] = useState(false);
    const [currentUrl, setCurrentUrl] = useState('');

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setCurrentUrl(window.location.href);
        }
    }, []);

    return (
        <div className="flex gap-4">
            <Button
                variant={isDark ? "secondary" : "outline"}
                icon={QrCode}
                onClick={() => setShowQR(true)}
                className="bg-white/10 backdrop-blur-md border-white/10 hover:bg-white/20 text-current rounded-full"
            >
                Compartir
            </Button>

            {kioskEnabled && (
                <Link href={`/s/${slug}/kiosk`}>
                    <Button variant={isDark ? "secondary" : "primary"} icon={Play} className="px-6 rounded-full shadow-xl">
                        Modo Kiosco
                    </Button>
                </Link>
            )}

            <QRCodeModal
                isOpen={showQR}
                onClose={() => setShowQR(false)}
                url={currentUrl}
                title={slug}
            />
        </div>
    );
}
