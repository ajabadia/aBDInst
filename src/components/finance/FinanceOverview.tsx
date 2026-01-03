'use client';

import { DollarSign, Shield, TrendingUp, AlertTriangle } from 'lucide-react';

interface FinanceOverviewProps {
    data: {
        totalCost: number;
        totalInsured: number;
        coverageRatio: number;
        policyCount: number;
        itemCount: number;
    };
}

export default function FinanceOverview({ data }: FinanceOverviewProps) {
    if (!data) return null;

    const isGoodCoverage = data.coverageRatio >= 80;

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <DollarSign className="text-green-600" size={20} />
                    Resumen Financiero
                </h3>
                <span className={`px-2 py-1 rounded-full text-xs font-bold ${isGoodCoverage ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {Math.round(data.coverageRatio)}% Asegurado
                </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Inversión Total</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                        {data.totalCost.toLocaleString()} €
                    </p>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Valor Asegurado</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                        {data.totalInsured.toLocaleString()} €
                    </p>
                </div>
            </div>

            <div className="mt-4">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Cobertura de la colección</span>
                    <span>{data.policyCount} Pólizas activas</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                    <div
                        className={`h-2 rounded-full ${isGoodCoverage ? 'bg-green-500' : 'bg-yellow-500'}`}
                        style={{ width: `${Math.min(data.coverageRatio, 100)}%` }}
                    />
                </div>
                {!isGoodCoverage && (
                    <p className="text-xs text-yellow-600 mt-2 flex items-center gap-1">
                        <AlertTriangle size={12} />
                        Tu colección podría estar infraasegurada.
                    </p>
                )}
            </div>
        </div>
    );
}
