/**
 * Calculates the current ROI (Return on Investment)
 * @param purchasePrice The original price paid
 * @param currentPrice The current estimated market value
 * @returns ROI percentage (e.g., 20.5 for 20.5%)
 */
export function calculateROI(purchasePrice: number, currentPrice: number): number {
    if (purchasePrice === 0) return 0;
    return ((currentPrice - purchasePrice) / purchasePrice) * 100;
}

/**
 * Formats a currency value
 */
export function formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-ES', {
        style: 'currency',
        currency: 'EUR',
    }).format(value);
}
