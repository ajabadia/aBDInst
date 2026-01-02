'use client';

import QRCodeGenerator from "./QRCodeGenerator";

interface PrintSpecSheetProps {
    instrument: any;
}

export default function PrintSpecSheet({ instrument }: PrintSpecSheetProps) {
    return (
        <div className="hidden print:block fixed inset-0 bg-white z-[9999] p-8 overflow-y-auto w-full h-full">
            {/* Header */}
            <div className="flex justify-between items-end border-b-2 border-black pb-4 mb-8">
                <div>
                    <h2 className="text-xl text-gray-500 uppercase tracking-widest font-semibold">{instrument.brand}</h2>
                    <h1 className="text-5xl font-bold text-black mt-1 tracking-tight">{instrument.model}</h1>
                </div>
                <div className="text-right">
                    <p className="text-xs text-gray-400 uppercase">Ficha Técnica</p>
                    <p className="font-mono text-sm">{new Date().toLocaleDateString()}</p>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-2 gap-8 mb-8">
                {/* Image */}
                <div className="aspect-[4/3] relative rounded-xl overflow-hidden border border-gray-100 bg-gray-50 flex items-center justify-center">
                    {instrument.genericImages?.[0] && (
                        <img
                            src={instrument.genericImages[0]}
                            className="max-w-full max-h-full object-contain"
                            alt={instrument.model}
                        />
                    )}
                </div>

                {/* Specs */}
                <div className="space-y-6">
                    <div>
                        <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2 border-b border-gray-100 pb-1">Especificaciones</h3>
                        <div className="grid grid-cols-2 gap-y-4 gap-x-8">
                            {instrument.specs && Object.entries(instrument.specs).slice(0, 8).map(([key, val]: any) => (
                                <div key={key}>
                                    <p className="text-[10px] text-gray-500 uppercase">{key}</p>
                                    <p className="text-sm font-medium text-black">{typeof val === 'object' ? val.value : val}</p>
                                </div>
                            ))}
                            <div>
                                <p className="text-[10px] text-gray-500 uppercase">Año</p>
                                <p className="text-sm font-medium text-black">{instrument.year || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-[10px] text-gray-500 uppercase">Tipo</p>
                                <p className="text-sm font-medium text-black">{instrument.type}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Description */}
            <div className="mb-8">
                <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4 border-b border-gray-100 pb-1">Descripción</h3>
                <p className="text-justify text-gray-800 leading-relaxed font-serif text-sm">
                    {instrument.description}
                </p>
            </div>

            {/* Footer with QR */}
            <div className="flex items-center gap-6 mt-auto border-t border-gray-100 pt-6">
                <div className="w-24 h-24 border border-gray-200">
                    {/* Placeholder for QR - or actual QR if we pass the prop */}
                    <div className="w-full h-full bg-gray-50 flex items-center justify-center text-[10px] text-gray-400 text-center p-2">
                        Escanea para ver digital
                    </div>
                </div>
                <div>
                    <p className="font-bold text-black">Instrument Collector</p>
                    <p className="text-xs text-gray-500">Gestión profesional de colecciones.</p>
                </div>
            </div>
        </div>
    );
}
