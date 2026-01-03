import { getInstrumentFinancials } from '@/actions/finance';
import InsuranceManager from './InsuranceManager';
import { DollarSign, TrendingDown, ShieldCheck } from 'lucide-react';

export default async function InstrumentFinanceSection({ collectionItemId }: { collectionItemId: string }) {
    const { success, data } = await getInstrumentFinancials(collectionItemId);

    if (!success || !data) return null;

    const { acquisition, policies, activePolicy, depreciation } = data;
    const cost = acquisition?.price || 0;
    const insuredValue = activePolicy?.coverageAmount || 0;
    const isUnderInsured = insuredValue < cost;

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <DollarSign className="text-green-600" />
                Gestión Financiera
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Financial Overview Card */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-4">
                    <h3 className="font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                        <TrendingDown size={18} /> Resumen de Valor
                    </h3>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                            <p className="text-xs text-gray-500">Coste de Adquisición</p>
                            <p className="text-xl font-bold text-gray-900 dark:text-white">
                                {cost.toLocaleString()} {acquisition?.currency || 'EUR'}
                            </p>
                        </div>
                        <div className={`p-4 rounded-lg border ${isUnderInsured ? 'bg-red-50 border-red-100 dark:bg-red-900/20 dark:border-red-900' : 'bg-green-50 border-green-100 dark:bg-green-900/20 dark:border-green-900'}`}>
                            <p className={`text-xs ${isUnderInsured ? 'text-red-500' : 'text-green-600'}`}>
                                Valor Asegurado
                            </p>
                            <p className={`text-xl font-bold ${isUnderInsured ? 'text-red-700 dark:text-red-400' : 'text-green-700 dark:text-green-400'}`}>
                                {insuredValue.toLocaleString()} {activePolicy?.currency || 'EUR'}
                            </p>
                        </div>
                    </div>

                    {isUnderInsured && insuredValue > 0 && (
                        <div className="text-xs text-red-500 flex items-center gap-1">
                            <ShieldCheck size={12} />
                            El seguro no cubre el coste total de adquisición. Considera aumentar la cobertura.
                        </div>
                    )}

                    {/* Simple Depreciation Table */}
                    <div className="mt-4">
                        <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Amortización Fiscal (10 años linear)</p>
                        <div className="overflow-x-auto">
                            <table className="w-full text-xs text-left">
                                <thead className="text-gray-400">
                                    <tr>
                                        <th className="pb-1">Año</th>
                                        <th className="pb-1">Amortización</th>
                                        <th className="pb-1">Valor Libro</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                    {depreciation.slice(0, 5).map((row: any) => (
                                        <tr key={row.year}>
                                            <td className="py-1 font-mono">{row.year}</td>
                                            <td className="py-1 text-gray-500">-{row.depreciationAmount.toFixed(0)}</td>
                                            <td className="py-1 font-mono font-medium">{row.bookValue.toFixed(0)}</td>
                                        </tr>
                                    ))}
                                    <tr><td colSpan={3} className="py-1 text-center text-gray-400 italic">... ver tabla completa en informes</td></tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Insurance Manager UI */}
                <InsuranceManager collectionItemId={collectionItemId} policies={policies} />
            </div>
        </div>
    );
}
