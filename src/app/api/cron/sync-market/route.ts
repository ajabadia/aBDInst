import { NextRequest, NextResponse } from 'next/server';
import { syncMarketDataBatch } from '@/actions/sync-market';

export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minutes (Vercel Pro/Business, Hobby is restricted to 10-60s)

/**
 * GET /api/cron/sync-market
 * Triggered by Vercel Cron or manual administration.
 * Weeky Market Intelligence Sync.
 */
export async function GET(req: NextRequest) {
    // 1. Security check via Cron Secret
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        // If it's a manual trigger from an admin in development, 
        // we might want to bypass, but for security we enforce the secret.
        return new NextResponse('Unauthorized', { status: 401 });
    }

    try {
        // 2. Run the sync for a batch of 20 instruments
        // We limit to 20 to stay within serverless execution limits.
        // Vercel Cron can be scheduled to run every day, but the server action
        // itself ensures only 'stale' (older than 6 days) instruments are processed.
        const result = await syncMarketDataBatch(20);

        return NextResponse.json({
            timestamp: new Date().toISOString(),
            ...result
        });

    } catch (error: any) {
        console.error('[CRON-SYNC-MARKET] Critical Error:', error);

        // Notify admin of failure
        try {
            const { notifyAdminError } = await import('@/lib/error-notifier');
            await notifyAdminError('Cron Job: sync-market', error);
        } catch (e) {
            console.error('Failed to send error notification:', e);
        }

        return new NextResponse(error.message, { status: 500 });
    }
}
