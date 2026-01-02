'use client';

import { useMemo, Fragment } from 'react';
import Image from 'next/image';
import { Check, X, Minus } from 'lucide-react';

interface ComparisonTableProps {
    items: any[];
}

export default function ComparisonTable({ items }: ComparisonTableProps) {
    const comparisonData = useMemo(() => {
        // Extract all unique specification labels from all instruments
        // specs is an array of {category, label, value}
        const allSpecLabels = new Set<string>();
        items.forEach(item => {
            const inst = item.instrument || item.instrumentId;
            if (inst?.specs && Array.isArray(inst.specs)) {
                inst.specs.forEach((spec: any) => {
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
                const inst = item.instrument || item.instrumentId;
                if (inst?.specs && Array.isArray(inst.specs)) {
                    const spec = inst.specs.find((s: any) => s.label === label);
                    return spec?.value || '-';
                }
                return '-';
            }
        }));

        return [
            {
                category: 'Información Básica',
                rows: [
                    {
                        label: 'Marca', getValue: (item: any) => {
                            const inst = item.instrument || item.instrumentId;
                            return inst?.brand || '-';
                        }
                    },
                    {
                        label: 'Modelo', getValue: (item: any) => {
                            const inst = item.instrument || item.instrumentId;
                            return inst?.model || '-';
                        }
                    },
                    {
                        label: 'Tipo', getValue: (item: any) => {
                            const inst = item.instrument || item.instrumentId;
                            return inst?.type || '-';
                        }
                    },
                    {
                        label: 'Año', getValue: (item: any) => {
                            const inst = item.instrument || item.instrumentId;
                            return inst?.year || '-';
                        }
                    },
                ]
            },
            ...(specRows.length > 0 ? [{
                category: 'Especificaciones',
                rows: specRows
            }] : []),
            {
                category: 'Tu Colección',
                rows: [
                    {
                        label: 'Estado', getValue: (item: any) => {
                            const statusMap: Record<string, string> = {
                                'active': 'Activo',
                                'sold': 'Vendido',
                                'wishlist': 'Wishlist',
                                'repair': 'En reparación'
                            };
                            return statusMap[item.status] || item.status;
                        }
                    },
                    {
                        label: 'Condición', getValue: (item: any) => {
                            const conditionMap: Record<string, string> = {
                                'new': 'Nuevo',
                                'excellent': 'Excelente',
                                'good': 'Bueno',
                                'fair': 'Aceptable',
                                'poor': 'Pobre',
                                'for_parts': 'Para piezas'
                            };
                            return conditionMap[item.condition] || item.condition;
                        }
                    },
                    { label: 'Número de Serie', getValue: (item: any) => item.serialNumber || '-' },
                    { label: 'Ubicación', getValue: (item: any) => item.location || '-' },
                ]
            },
            {
                category: 'Valor',
                rows: [
                    {
                        label: 'Precio de Compra', getValue: (item: any) =>
                            item.acquisition?.price
                                ? `${item.acquisition.price.toLocaleString('es-ES')} ${item.acquisition.currency || 'EUR'}`
                                : '-'
                    },
                    {
                        label: 'Valor de Mercado', getValue: (item: any) => {
                            const inst = item.instrument || item.instrumentId;
                            if (inst?.marketValue?.estimatedPrice) {
                                return `${inst.marketValue.estimatedPrice.toLocaleString('es-ES')} ${inst.marketValue.currency || 'EUR'}`;
                            }
                            return '-';
                        }
                    },
                    {
                        label: 'Ganancia/Pérdida', getValue: (item: any) => {
                            const purchase = item.acquisition?.price || 0;
                            const inst = item.instrument || item.instrumentId;
                            const current = inst?.marketValue?.estimatedPrice || purchase;
                            const diff = current - purchase;
                            if (diff === 0) return '-';
                            const color = diff > 0 ? 'text-green-600' : 'text-red-600';
                            return <span className={color}>{diff > 0 ? '+' : ''}{diff.toLocaleString('es-ES')} EUR</span>;
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
            // Handle React elements by converting to string representation
            if (typeof value === 'object' && value !== null && value.props) {
                return value.props.children?.toString() || '';
            }
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
                        {items.map((item, index) => {
                            const inst = item.instrument || item.instrumentId;
                            return (
                                <th key={item._id} className="p-4 border-b-2 border-gray-200 dark:border-gray-700 min-w-[200px]">
                                    <div className="space-y-3">
                                        {/* Image */}
                                        <div className="aspect-video rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                                            {item.images?.[0]?.url || item.userImages?.[0]?.url || inst?.genericImages?.[0] || inst?.imageUrl ? (
                                                <Image
                                                    src={item.images?.[0]?.url || item.userImages?.[0]?.url || inst?.genericImages?.[0] || inst?.imageUrl}
                                                    alt={`${inst?.brand} ${inst?.model}`}
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
                                            {inst?.brand}<br />
                                            {inst?.model}
                                        </div>
                                    </div>
                                </th>
                            )
                        })}
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
