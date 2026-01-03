import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import PriceAlert from '@/models/PriceAlert';
import { runScraperForAlert } from '@/actions/scraping';
import { Instrument } from '@/models/Instrument'; // Potentially useful if we auto-update valuations, but not strictly needed here yet.

export const maxDuration = 60; // Allow 60 seconds (Vercel Hobby Limit is 10s for functions usually, but cron might get more. If not, we limit batch size.)

export async function GET(req: NextRequest) {
    // 1. Security Check
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    try {
        await dbConnect();

        // 2. Find Stale Alerts (Older than 24 hours or never checked)
        const ONE_DAY_AGO = new Date(Date.now() - 24 * 60 * 60 * 1000);

        const staleAlerts = await PriceAlert.find({
            isActive: true,
            $or: [
                { lastChecked: { $lt: ONE_DAY_AGO } },
                { lastChecked: { $exists: false } }
            ]
        }).limit(5); // Limit batch size to prevent timeout

        console.log(`[CRON] Found ${staleAlerts.length} stale alerts to process.`);

        const results = [];

        // 3. Process Batch
        for (const alert of staleAlerts) {
            console.log(`[CRON] Processing alert: ${alert.query}`);
            try {
                const result = await runScraperForAlert(alert._id.toString());
                results.push({ id: alert._id, success: true, count: result.success ? result.count : 0 });
            } catch (e: any) {
                console.error(`[CRON] Failed alert ${alert._id}:`, e);
                results.push({ id: alert._id, success: false, error: e.message });
            }
        }

        return NextResponse.json({
            success: true,
            processed: results.length,
            details: results
        });

    } catch (error: any) {
        console.error('[CRON] Critical Error:', error);
        return new NextResponse(error.message, { status: 500 });
    }
}
