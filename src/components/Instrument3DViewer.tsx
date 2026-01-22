'use client';

import React, { useEffect, useState } from 'react';
import { Box, Maximize, RotateCcw } from 'lucide-react';

interface Instrument3DViewerProps {
    modelUrl: string; // URL to .glb or .usdz file
    posterUrl?: string; // Static image to show while loading
    alt?: string;
}

/**
 * An interactive 3D model viewer for instruments.
 * Uses the <model-viewer> web component.
 */
export default function Instrument3DViewer({ modelUrl, posterUrl, alt = 'Instrument 3D Model' }: Instrument3DViewerProps) {
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        // Dynamically load the model-viewer script if not already present
        if (!document.getElementById('model-viewer-script')) {
            const script = document.createElement('script');
            script.id = 'model-viewer-script';
            script.type = 'module';
            script.src = 'https://ajax.googleapis.com/ajax/libs/model-viewer/4.0.0/model-viewer.min.js';
            document.head.appendChild(script);
        }
    }, []);

    return (
        <div className="relative w-full aspect-square bg-gray-100 dark:bg-gray-800 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-inner group">
            {/* 
          @ts-ignore - model-viewer is a web component 
      */}
            <model-viewer
                src={modelUrl}
                poster={posterUrl}
                alt={alt}
                shadow-intensity="1"
                camera-controls
                auto-rotate
                touch-action="pan-y"
                ar
                ar-modes="webxr scene-viewer quick-look"
                className="w-full h-full cursor-grab active:cursor-grabbing"
                onLoad={() => setLoaded(true)}
                style={{ width: '100%', height: '100%' }}
            >
                <div className="absolute top-4 left-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-white/80 dark:bg-black/50 backdrop-blur-md p-2 rounded-lg text-xs flex items-center gap-1">
                        <Box className="w-3 h-3" />
                        <span>3D Interactive</span>
                    </div>
                </div>

                {!loaded && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="flex flex-col items-center gap-2">
                            <RotateCcw className="w-8 h-8 text-blue-500 animate-spin" />
                            <span className="text-xs text-gray-500">Cargando modelo 3D...</span>
                        </div>
                    </div>
                )}

                <button
                    slot="ar-button"
                    className="absolute bottom-4 right-4 bg-white dark:bg-gray-800 p-3 rounded-full shadow-xl border border-gray-200 dark:border-gray-700 hover:scale-110 transition-transform flex items-center gap-2 text-sm font-medium"
                >
                    <Maximize className="w-4 h-4 text-blue-500" />
                    Ver en AR
                </button>
            </model-viewer>
        </div>
    );
}

// Add global type for model-viewer to avoid TS errors
declare global {
    namespace JSX {
        interface IntrinsicElements {
            'model-viewer': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
                src: string;
                poster?: string;
                alt?: string;
                'shadow-intensity'?: string;
                'camera-controls'?: boolean;
                'auto-rotate'?: boolean;
                'touch-action'?: string;
                ar?: boolean;
                'ar-modes'?: string;
                className?: string;
                onLoad?: () => void;
                style?: React.CSSProperties;
                // Add other common model-viewer attributes as needed
            };
        }
    }
}
