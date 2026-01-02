'use client';

import { useMemo, Fragment } from 'react';
import Image from 'next/image';

interface CatalogComparisonTableProps {
    items: any[];
}

export default function CatalogComparisonTable({ items }: CatalogComparisonTableProps) {
    const comparisonData = useMemo(() => {
        // Extract all unique specification labels from all instruments
        const allSpecLabels = new Set<string>();
        items.forEach(item => {
            if (item.specs && Array.isArray(item.specs)) {
                item.specs.forEach((spec: any) => {
                    if (spec.label) {
                        allSpecLabels.add(spec.label);
                    }
                });
            }
        });

        // Build dynamic specification rows
        const specRows = Array.from(allSpecLabels).map(label => ({
            label: label,
            getValue: (item: any) => {
                if (item.specs && Array.isArray(item.specs)) {
                    const spec = item.specs.find((s: any) => s.label === label);
                    return spec?.value || '-';
                }
                return '-';
            }
        }));

        return [
            {
                category: 'Información Básica',
                rows: [
                    { label: 'Marca', getValue: (item: any) => item.brand || '-' },
                    { label: 'Modelo', getValue: (item: any) => item.model || '-' },
                    { label: 'Tipo', getValue: (item: any) => item.type || '-' },
                    { label: 'Subtipo', getValue: (item: any) => item.subtype || '-' },
                    {
                        label: 'Año(s)', getValue: (item: any) => {
                            if (item.years && item.years.length > 0) {
                                return item.years.join(', ');
                            }
                            return '-';
                        }
                    },
                ]
            },
            ...(specRows.length > 0 ? [{
                category: 'Especificaciones',
                rows: specRows
            }] : []),
            {
                category: 'Información Adicional',
                rows: [
                    {
                        label: 'Descripción', getValue: (item: any) => {
                            if (item.description) {
                                return item.description.length > 100
                                    ? item.description.substring(0, 100) + '...'
                                    : item.description;
                            }
                            return '-';
                        }
                    },
                    {
                        label: 'Sitio Web', getValue: (item: any) => {
                            if (item.websites && item.websites.length > 0) {
                                const primary = item.websites.find((w: any) => w.isPrimary) || item.websites[0];
                                return primary ? '🔗 Disponible' : '-';
                            }
                            return '-';
                        }
                    },
                    {
                        label: 'Documentación', getValue: (item: any) => {
                            if (item.documents && item.documents.length > 0) {
                                return `${item.documents.length} documento(s)`;
                            }
                            return '-';
                        }
                    },
                ]
            },
            {
                category: 'Valor de Mercado',
                rows: [
                    {
                        label: 'Precio Estimado', getValue: (item: any) => {
                            if (item.marketValue?.estimatedPrice) {
                                return `${item.marketValue.estimatedPrice.toLocaleString('es-ES')} ${item.marketValue.currency || 'EUR'}`;
                            }
                            return '-';
                        }
                    },
                    {
                        label: 'Rango de Precio', getValue: (item: any) => {
                            if (item.marketValue?.priceRange?.min && item.marketValue?.priceRange?.max) {
                                return `${item.marketValue.priceRange.min.toLocaleString('es-ES')} - ${item.marketValue.priceRange.max.toLocaleString('es-ES')} EUR`;
                            }
                            return '-';
                        }
                    },
                    {
                        label: 'Última Actualización', getValue: (item: any) => {
                            if (item.marketValue?.lastUpdated) {
                                const date = new Date(item.marketValue.lastUpdated);
                                return date.toLocaleDateString('es-ES');
                            }
                            return '-';
                        }
                    },
                ]
            },
        ];
    }, [items]);

    // Helper to check if values are different
    const hasVariation = (row: any) => {
        const values = items.map(item => {
            const value = row.getValue(item);
            return String(value);
        });
        return new Set(values).size > 1;
    };

    return (
        <div className="overflow-x-auto">
            <table className="w-full border-collapse">
                {/* Header with images */}
                <thead>
                    <tr>
                        <th className="sticky left-0 z-10 bg-white dark:bg-gray-900 p-4 text-left border-b-2 border-gray-200 dark:border-gray-700">
                            <div className="w-32">Característica</div>
                        </th>
                        {items.map((item) => (
                            <th key={item._id} className="p-4 border-b-2 border-gray-200 dark:border-gray-700 min-w-[200px]">
                                <div className="space-y-3">
                                    {/* Image */}
                                    <div className="aspect-video rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                                        {item.genericImages?.[0] ? (
                                            <Image
                                                src={item.genericImages[0]}
                                                alt={`${item.brand} ${item.model}`}
                                                width={200}
                                                height={150}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                                                Sin imagen
                                            </div>
                                        )}
                                    </div>
                                    {/* Name */}
                                    <div className="text-sm font-bold">
                                        {item.brand}<br />
                                        {item.model}
                                    </div>
                                </div>
                            </th>
                        ))}
                    </tr>
                </thead>

                {/* Body with comparison data */}
                <tbody>
                    {comparisonData.map((category) => (
                        <Fragment key={category.category}>
                            {/* Category Header */}
                            <tr>
                                <td
                                    colSpan={items.length + 1}
                                    className="sticky left-0 bg-gray-50 dark:bg-gray-800/50 p-3 font-bold text-sm uppercase tracking-wider border-t border-b border-gray-200 dark:border-gray-700"
                                >
                                    {category.category}
                                </td>
                            </tr>
                            {/* Category Rows */}
                            {category.rows.map((row) => {
                                const hasDifference = hasVariation(row);
                                return (
                                    <tr
                                        key={row.label}
                                        className={hasDifference ? 'bg-yellow-50/50 dark:bg-yellow-900/10' : ''}
                                    >
                                        <td className="sticky left-0 bg-white dark:bg-gray-900 p-4 text-sm font-medium border-b border-gray-200 dark:border-gray-700">
                                            <div className="flex items-center gap-2">
                                                {row.label}
                                                {hasDifference && (
                                                    <span className="text-xs text-yellow-600 dark:text-yellow-400">●</span>
                                                )}
                                            </div>
                                        </td>
                                        {items.map((item) => (
                                            <td
                                                key={item._id}
                                                className="p-4 text-sm border-b border-gray-200 dark:border-gray-700"
                                            >
                                                {row.getValue(item)}
                                            </td>
                                        ))}
                                    </tr>
                                );
                            })}
                        </Fragment>
                    ))}
                </tbody>
            </table>

            {/* Legend */}
            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <p className="text-xs text-gray-600 dark:text-gray-400">
                    <span className="text-yellow-600 dark:text-yellow-400">●</span> = Valores diferentes entre instrumentos
                </p>
            </div>
        </div>
    );
}
