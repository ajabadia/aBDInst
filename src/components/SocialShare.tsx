'use client';

import React, { useState } from 'react';
import {
    Share2, Copy, Check, Twitter,
    Facebook, Link as LinkIcon,
    ExternalLink, Instagram
} from 'lucide-react';
import { Button } from './ui/Button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/Dialog';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

interface SocialShareProps {
    title: string;
    text: string;
    url: string;
    imageUrl?: string;
}

/**
 * Premium Social Sharing component with Apple-style backdrop and discovery card.
 */
export default function SocialShare({ title, text, url, imageUrl }: SocialShareProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [copied, setCopied] = useState(false);

    const fullUrl = typeof window !== 'undefined' ? `${window.location.origin}${url}` : url;

    const handleNativeShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title,
                    text,
                    url: fullUrl,
                });
            } catch (err) {
                console.log('Share failed or cancelled');
            }
        } else {
            setIsOpen(true);
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(fullUrl);
        setCopied(true);
        toast.success('Enlace copiado al portapapeles');
        setTimeout(() => setCopied(false), 2000);
    };

    const shareLinks = [
        {
            name: 'Twitter (X)',
            icon: Twitter,
            color: 'bg-black text-white',
            link: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(fullUrl)}`
        },
        {
            name: 'Facebook',
            icon: Facebook,
            color: 'bg-[#1877F2] text-white',
            link: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(fullUrl)}`
        },
        {
            name: 'Instagram',
            icon: Instagram,
            color: 'bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] text-white',
            link: `https://instagram.com` // Instagram doesn't support direct link sharing via web intent well
        },
    ];

    return (
        <>
            <Button
                variant="secondary"
                icon={Share2}
                onClick={handleNativeShare}
                className="shadow-sm hover:shadow-md transition-all rounded-xl"
            >
                Compartir
            </Button>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="max-w-md p-0 overflow-hidden border-none bg-transparent">
                    <div className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-2xl rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/20 dark:border-white/10">
                        {/* Discovery Card Preview */}
                        <div className="relative aspect-[1.91/1] w-full bg-gradient-to-br from-ios-blue/20 to-purple-500/20 flex items-center justify-center p-6">
                            {imageUrl ? (
                                <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-xl border-4 border-white/30">
                                    <Image src={imageUrl} alt={title} fill className="object-cover" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                                    <div className="absolute bottom-4 left-4 right-4 text-white">
                                        <p className="text-[10px] font-bold uppercase tracking-widest opacity-80 mb-1">Hallazgo en Instrument Collector</p>
                                        <h4 className="text-xl font-bold truncate">{title}</h4>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center space-y-3">
                                    <Share2 size={48} className="text-ios-blue mx-auto opacity-40" />
                                    <p className="font-bold text-gray-500">¿Compartir este descubrimiento?</p>
                                </div>
                            )}
                        </div>

                        <div className="p-8 space-y-8">
                            <DialogHeader className="mb-0 text-left">
                                <DialogTitle className="text-2xl">Difundir la palabra</DialogTitle>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Elige cómo quieres compartir este instrumento con el mundo.</p>
                            </DialogHeader>

                            {/* Social Grid */}
                            <div className="grid grid-cols-3 gap-4">
                                {shareLinks.map((social) => (
                                    <a
                                        key={social.name}
                                        href={social.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex flex-col items-center gap-2 group"
                                    >
                                        <div className={`p-4 rounded-2xl ${social.color} transition-transform group-hover:scale-110 shadow-lg`}>
                                            <social.icon size={24} />
                                        </div>
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{social.name}</span>
                                    </a>
                                ))}
                            </div>

                            {/* URL Copy Bar */}
                            <div className="relative flex items-center gap-2 p-2 bg-gray-100 dark:bg-black/40 rounded-2xl border border-black/5 dark:border-white/5">
                                <div className="flex-1 px-3 text-xs font-mono text-gray-500 truncate">
                                    {fullUrl}
                                </div>
                                <Button
                                    size="sm"
                                    onClick={copyToClipboard}
                                    className={copied ? "bg-ios-green text-white" : "bg-white dark:bg-zinc-800"}
                                >
                                    {copied ? <Check size={16} /> : <Copy size={16} />}
                                    <span className="ml-2">{copied ? 'Copiado' : 'Copiar'}</span>
                                </Button>
                            </div>

                            <div className="flex justify-center">
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="text-sm font-bold text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                                >
                                    Cerrar
                                </button>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
