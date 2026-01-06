'use client';

import { useMemo, Fragment } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Check, X, Info } from 'lucide-react';

interface CatalogComparisonTableProps {
    items: any[];
}

export default function CatalogComparisonTable({ items }: CatalogComparisonTableProps) {
    const comparisonData = useMemo(() => {
        // 1. Identify all unique categories across all items
        const categorySet = new Set<string>();
        items.forEach(item => {
            if (item.specs && Array.isArray(item.specs)) {
                item.specs.forEach((s: any) => {
                    if (s.category) categorySet.add(s.category);
                });
            }
        });

        // 2. Define fixed sections
        const baseGroups = [
            {
                category: 'Información Básica',
                rows: [
                    { label: 'Marca', getValue: (item: any) => item.brand },
                    { label: 'Modelo', getValue: (item: any) => item.model },
                    { label: 'Tipo', getValue: (item: any) => item.type },
                    { label: 'Subtipo', getValue: (item: any) => item.subtype || '-' },
                    { label: 'Años', getValue: (item: any) => item.years?.join(', ') || '-' },
                ]
            },
            {
                category: 'Información Adicional',
                rows: [
                    { label: 'Descripción', getValue: (item: any) => item.description || '-' },
                    { label: 'Sitios Web', getValue: (item: any) => item.websites?.length || 0 },
                    { label: 'Documentos', getValue: (item: any) => item.documents?.length || 0 },
                ]
            }
        ];

        // 3. Dynamic Technical Spec Groups
        const dynamicGroups = Array.from(categorySet)
            .filter(cat => !['Información Básica', 'Información Adicional', 'Valor de Mercado'].includes(cat))
            .map(category => {
                const labelSetInCat = new Set<string>();
                items.forEach(item => {
                    const specsInCat = item.specs?.filter((s: any) => s.category === category) || [];
                    specsInCat.forEach((s: any) => labelSetInCat.add(s.label));
                });

                const rows = Array.from(labelSetInCat).map(label => ({
                    label,
                    getValue: (item: any) => {
                        const spec = item.specs?.find((s: any) => s.category === category && s.label === label);
                        return spec?.value || '-';
                    }
                }));

                return { category, rows };
            });

        // 4. Market Value Group
        const marketGroup = {
            category: 'Valor de Mercado',
            rows: [
                { label: 'Precio Estimado', getValue: (item: any) => item.marketValue?.current?.value ? `${item.marketValue.current.value} ${item.marketValue.current.currency}` : '-' },
                { label: 'Rango Mínimo', getValue: (item: any) => item.marketValue?.current?.min ? `${item.marketValue.current.min} EUR` : '-' },
                { label: 'Rango Máximo', getValue: (item: any) => item.marketValue?.current?.max ? `${item.marketValue.current.max} EUR` : '-' },
            ]
        };

        return [...baseGroups, ...dynamicGroups, marketGroup];
    }, [items]);

    const hasVariation = (row: any) => {
        const values = items.map(item => String(row.getValue(item)));
        const uniqueValues = new Set(values.filter(v => v !== '-')); // Only compare meaningful values
        return uniqueValues.size > 1;
    };

    return (
        <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full border-collapse min-w-[800px]">
                <thead>
                    <tr>
                        <th className="sticky left-0 z-30 bg-white/95 dark:bg-black/95 backdrop-blur-md p-6 text-left border-b border-black/5 dark:border-white/10 w-48">
                            <div className="flex items-center gap-2 text-gray-400">
                                <Info size={16} />
                                <span className="apple-label !m-0">Especificación</span>
                            </div>
                        </th>
                        {items.map((item) => (
                            <th key={item._id} className="p-6 border-b border-black/5 dark:border-white/10 min-w-[220px] bg-white/50 dark:bg-white/5">
                                <div className="space-y-4">
                                    <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-black/5 relative shadow-sm">
                                        {item.genericImages?.[0] ? (
                                            <Image src={item.genericImages[0]} alt="" fill className="object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-300 italic text-xs">Sin imagen</div>
                                        )}
                                    </div>
                                    <div className="text-center">
                                        <p className="text-[10px] font-black text-ios-blue uppercase tracking-widest mb-1">{item.brand}</p>
                                        <p className="font-bold text-gray-900 dark:text-white leading-tight">{item.model}</p>
                                    </div>
                                </div>
                            </th>
                        ))}
                    </tr>
                </thead>

                <tbody>
                    {comparisonData.map((group) => (
                        <Fragment key={group.category}>
                            <tr>
                                <td colSpan={items.length + 1} className="sticky left-0 bg-black/[0.02] dark:bg-white/[0.02] p-4 pt-8 border-b border-black/5 dark:border-white/5">
                                    <h3 className="apple-label !m-0 !text-ios-blue px-2">{group.category}</h3>
                                </td>
                            </tr>
                            {group.rows.map((row) => {
                                const diff = hasVariation(row);
                                return (
                                    <tr key={row.label} className="group transition-colors hover:bg-black/[0.01] dark:hover:bg-white/[0.01]">
                                        <td className="sticky left-0 z-20 bg-white dark:bg-black p-5 text-sm font-bold text-gray-500 border-b border-black/5 dark:border-white/5 shadow-[2px_0_10px_rgba(0,0,0,0.02)]">
                                            <div className="flex items-center gap-2">
                                                {row.label}
                                                {diff && <span className="w-1.5 h-1.5 rounded-full bg-ios-blue shadow-[0_0_8px_rgba(0,122,255,0.5)]" />}
                                            </div>
                                        </td>
                                        {items.map((item) => {
                                            const val = row.getValue(item);
                                            return (
                                                <td key={item._id} className={cn(
                                                    "p-5 text-[13px] border-b border-black/5 dark:border-white/5 transition-colors",
                                                    diff ? "text-gray-900 dark:text-white font-semibold bg-ios-blue/[0.01]" : "text-gray-500 dark:text-gray-400 font-medium"
                                                )}>
                                                    {val === true ? <Check className="text-ios-green" size={18} /> : 
                                                     val === false ? <X className="text-ios-red" size={18} /> : 
                                                     val || '-'}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                );
                            })}
                        </Fragment>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
