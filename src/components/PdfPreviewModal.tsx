'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { FileText, X, Maximize2, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface PdfPreviewModalProps {
    url: string;
    title: string;
    children?: React.ReactNode;
}

export default function PdfPreviewModal({ url, title, children }: PdfPreviewModalProps) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            {children ? (
                <div onClick={() => setIsOpen(true)} className="cursor-pointer w-full h-full">
                    {children}
                </div>
            ) : (
                <Button
                    variant="secondary"
                    icon={FileText}
                    onClick={() => setIsOpen(true)}
                    className="w-full justify-start"
                >
                    {title}
                </Button>
            )}

            <AnimatePresence>
                {isOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />

                        {/* Modal Content */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-5xl h-[85vh] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md z-10">
                                <h3 className="font-semibold text-lg flex items-center gap-2">
                                    <FileText className="text-red-500" size={20} />
                                    {title}
                                </h3>
                                <div className="flex items-center gap-2">
                                    <a
                                        href={url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition"
                                        title="Abrir en pestaña nueva"
                                    >
                                        <ExternalLink size={20} />
                                    </a>
                                    <button
                                        onClick={() => setIsOpen(false)}
                                        className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition"
                                    >
                                        <X size={24} />
                                    </button>
                                </div>
                            </div>

                            {/* Viewer */}
                            <div className="flex-grow bg-gray-100 dark:bg-black/50 relative">
                                <iframe
                                    src={url} // Cloudinary and most CDN PDFs render fine in iframe
                                    className="w-full h-full"
                                    title={`Visor PDF: ${title}`}
                                />
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}
