'use client';

import { ChevronRight, Info } from 'lucide-react';

interface Spec {
    category: string;
    label: string;
    value: string;
}

export default function InstrumentSpecs({ specs }: { specs: Spec[] }) {
    // Agrupamos por categoría para el diseño de Apple
    const categories = Array.from(new Set(specs.map((s) => s.category)));

    return (
        <section className="py-16 bg-white dark:bg-gray-950">
            <div className="max-w-4xl mx-auto px-6">
                <h2 className="text-3xl font-semibold tracking-tight text-gray-900 dark:text-white mb-12">
                    Especificaciones técnicas.
                </h2>

                <div className="space-y-16">
                    {categories.map((cat) => (
                        <div key={cat} className="group">
                            {/* Cabecera de Categoría: Estilo Apple Support */}
                            <div className="flex items-center gap-2 mb-6 border-b border-gray-100 dark:border-gray-800 pb-2">
                                <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400">
                                    {cat}
                                </h3>
                            </div>

                            {/* Grid de Especificaciones: Muy limpio */}
                            <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-1">
                                {specs
                                    .filter((s) => s.category === cat)
                                    .map((spec, i) => (
                                        <div
                                            key={i}
                                            className="flex justify-between py-4 border-b border-gray-50 dark:border-gray-900/50 hover:bg-gray-50/50 dark:hover:bg-gray-900/30 transition-colors px-2 rounded-lg"
                                        >
                                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                                {spec.label}
                                            </dt>
                                            <dd className="text-sm font-semibold text-gray-900 dark:text-gray-100 text-right">
                                                {spec.value}
                                            </dd>
                                        </div>
                                    ))}
                            </dl>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
