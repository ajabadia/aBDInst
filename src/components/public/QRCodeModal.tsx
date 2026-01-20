'use client';

import { useState, useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { X, Download, Share2, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface QRCodeModalProps {
    isOpen: boolean;
    onClose: () => void;
    url: string;
    title: string;
}

export default function QRCodeModal({ isOpen, onClose, url, title }: QRCodeModalProps) {
    const [copied, setCopied] = useState(false);
    const downloadRef = useRef<HTMLDivElement>(null);

    if (!isOpen) return null;

    const handleCopy = () => {
        navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDownload = () => {
        const canvas = document.querySelector('#qr-code-canvas') as HTMLCanvasElement;
        if (canvas) {
            const pngUrl = canvas.toDataURL("image/png");
            const downloadLink = document.createElement("a");
            downloadLink.href = pngUrl;
            downloadLink.download = `showroom-${title.toLowerCase().replace(/\s+/g, '-')}-qr.png`;
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />
            <div className="relative bg-white dark:bg-zinc-900 rounded-[2rem] p-8 w-full max-w-sm shadow-2xl animate-in fade-in zoom-in-95 duration-300">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                    <X size={20} />
                </button>

                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Share2 size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Compartir Showroom</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Escanea para visitar esta colección</p>
                </div>

                <div className="flex justify-center mb-8 bg-white p-4 rounded-xl shadow-inner w-fit mx-auto" ref={downloadRef}>
                    <QRCodeCanvas
                        id="qr-code-canvas"
                        value={url}
                        size={200}
                        level={"H"}
                        includeMargin={true}
                        imageSettings={{
                            src: "/logo-icon.png", // Assuming we have an icon, otherwise verify path
                            x: undefined,
                            y: undefined,
                            height: 24,
                            width: 24,
                            excavate: true,
                        }}
                    />
                </div>

                <div className="space-y-3">
                    <Button
                        onClick={handleDownload}
                        className="w-full bg-gray-900 dark:bg-white text-white dark:text-black hover:bg-gray-800"
                        icon={Download}
                    >
                        Descargar QR (PNG)
                    </Button>

                    <div className="flex gap-2">
                        <div className="flex-1 bg-gray-100 dark:bg-white/5 rounded-xl px-4 py-3 text-xs font-mono text-gray-500 truncate border border-transparent focus-within:border-blue-500 transition-colors">
                            {url}
                        </div>
                        <button
                            onClick={handleCopy}
                            className={`p-3 rounded-xl border transition-all ${copied
                                ? 'bg-green-500 border-green-500 text-white'
                                : 'border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/5'
                                }`}
                        >
                            {copied ? <Check size={18} /> : <Copy size={18} />}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
