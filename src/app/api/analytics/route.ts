// src/app/api/analytics/route.ts
import { NextResponse } from 'next/server';
import { getInstrumentStats, getPriceTrends, getLocationStats } from '@/actions/analytics';

export async function GET(request: Request) {
    const url = new URL(request.url);
    const type = url.searchParams.get('type') ?? 'stats';
    const period = url.searchParams.get('period') as 'monthly' | 'yearly' | undefined;
    try {
        let data;
        switch (type) {
            case 'price':
                data = await getPriceTrends(period ?? 'monthly');
                break;
            case 'location':
                data = await getLocationStats();
                break;
            case 'stats':
            default:
                data = await getInstrumentStats();
                break;
        }
        return NextResponse.json({ success: true, data });
    } catch (error) {
        console.error('Analytics API error', error);
        return NextResponse.json({ success: false, error: (error as any).message }, { status: 500 });
    }
}
