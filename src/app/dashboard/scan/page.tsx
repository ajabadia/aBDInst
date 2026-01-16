'use client';

import { useEffect, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Camera, QrCode } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

export default function QRScannerPage() {
    const router = useRouter();
    const [scannedResult, setScannedResult] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const scanner = new Html5QrcodeScanner(
            "reader",
            {
                fps: 10,
                qrbox: { width: 250, height: 250 },
                aspectRatio: 1.0
            },
            /* verbose= */ false
        );

        const onScanSuccess = (decodedText: string) => {
            scanner.clear();
            setScannedResult(decodedText);

            // If it's an internal URL, try to route cleanly
            try {
                const url = new URL(decodedText);
                if (url.origin === window.location.origin) {
                    router.push(url.pathname);
                } else {
                    // If it's an external URL or just the ID (if we change generator later)
                    window.location.href = decodedText;
                }
            } catch (e) {
                // If it's not a URL, it might be an ID
                if (decodedText.length > 20) { // Simple heuristic for MongoDB ObjectId
                    router.push(`/instruments/${decodedText}`);
                } else {
                    setError("Formato de código QR no reconocido.");
                }
            }
        };

        const onScanFailure = (err: any) => {
            // Failure happens constantly while seeking, so we don't show it normally
            // console.warn(`Code scan error = ${err}`);
        };

        scanner.render(onScanSuccess, onScanFailure);

        return () => {
            scanner.clear().catch(e => console.error("Scanner cleanup failed", e));
        };
    }, [router]);

    return (
        <div className="min-h-screen bg-[#f5f5f7] dark:bg-black pt-24 pb-12 px-6">
            <div className="max-w-xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <Link href="/dashboard">
                        <Button variant="ghost" size="sm" icon={ArrowLeft}>Dashboard</Button>
                    </Link>
                    <div className="flex items-center gap-2 bg-ios-blue/10 text-ios-blue px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
                        <QrCode size={14} /> Scanner
                    </div>
                </div>

                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight">Escanear Instrumento</h1>
                    <p className="text-gray-500 font-medium">Apunta a la etiqueta QR del instrumento para ver sus detalles.</p>
                </div>

                {/* Scanner Container */}
                <div className="glass-panel overflow-hidden rounded-[2.5rem] shadow-apple-lg border-white/20">
                    <div id="reader" className="w-full"></div>
                </div>

                {error && (
                    <div className="p-4 bg-ios-red/10 text-ios-red rounded-2xl text-center font-bold text-sm border border-ios-red/20 animate-in fade-in slide-in-from-top-4">
                        {error}
                        <Button variant="ghost" size="sm" onClick={() => window.location.reload()} className="ml-2 underline">Reintentar</Button>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="apple-card p-6 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-ios-blue/10 flex items-center justify-center text-ios-blue">
                            <Camera size={20} />
                        </div>
                        <div>
                            <p className="text-xs font-black uppercase text-gray-400 tracking-widest">Cámara</p>
                            <p className="text-sm font-bold">Uso móvil fluido</p>
                        </div>
                    </div>
                    <div className="apple-card p-6 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-ios-green/10 flex items-center justify-center text-ios-green">
                            <QrCode size={20} />
                        </div>
                        <div>
                            <p className="text-xs font-black uppercase text-gray-400 tracking-widest">Acceso</p>
                            <p className="text-sm font-bold">Directo al Inventario</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
