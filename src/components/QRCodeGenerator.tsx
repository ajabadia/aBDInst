'use client';

import { QRCodeSVG } from 'qrcode.react';
import { useRef, useState, useEffect } from 'react';

interface QRCodeGeneratorProps {
    url: string;
    label?: string;
}

export default function QRCodeGenerator({ url, label }: QRCodeGeneratorProps) {
    const svgRef = useRef<SVGSVGElement>(null);
    const [fullUrl, setFullUrl] = useState(url);

    useEffect(() => {
        if (url.startsWith('/')) {
            setFullUrl(`${window.location.origin}${url}`);
        }
    }, [url]);

    const downloadQRCode = () => {
        if (!svgRef.current) return;

        const svgData = new XMLSerializer().serializeToString(svgRef.current);
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const img = new Image();

        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx?.drawImage(img, 0, 0);
            const pngFile = canvas.toDataURL("image/png");

            const downloadLink = document.createElement("a");
            downloadLink.download = `qrcode-${label || 'instrument'}.png`;
            downloadLink.href = pngFile;
            downloadLink.click();
        };

        img.src = "data:image/svg+xml;base64," + btoa(svgData);
    };

    return (
        <div className="flex flex-col items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700">
            <div className="bg-white p-2 rounded">
                <QRCodeSVG
                    value={fullUrl || 'loading...'}
                    size={150}
                    level={"H"}
                    includeMargin={true}
                    ref={svgRef}
                />
            </div>
            <div className="text-center">
                <p className="text-sm text-gray-500 mb-2 truncate max-w-xs">{url}</p>
                <button
                    onClick={downloadQRCode}
                    className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-3 py-1.5 rounded hover:bg-blue-200 dark:hover:bg-blue-800 transition font-medium"
                >
                    Descargar PNG
                </button>
            </div>
        </div>
    );
}
