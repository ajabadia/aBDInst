'use server';

import dbConnect from '@/lib/db';
import PriceAlert from '@/models/PriceAlert';
import ScrapedListing from '@/models/ScrapedListing';
import { auth } from '@/auth';
import { ReverbScraper } from '@/lib/scrapers/ReverbScraper';
import { WallapopScraper } from '@/lib/scrapers/WallapopScraper';
import { revalidatePath } from 'next/cache';

export async function createPriceAlert(data: { query: string; targetPrice?: number; instrumentId?: string }) {
    try {
        const session = await auth();
        if (!session?.user) throw new Error('Unauthorized');

        await dbConnect();

        const alert = await PriceAlert.create({
            userId: (session.user as any).id,
            query: data.query,
            targetPrice: data.targetPrice,
            instrumentId: data.instrumentId,
            sources: ['reverb'], // Default source
            isActive: true
        });

        // Trigger initial scrape immediately
        try {
            await runScraperForAlert(alert._id.toString());
        } catch (e) {
            console.error("Initial scrape failed", e);
        }

        revalidatePath('/dashboard/alerts');
        return { success: true, id: alert._id.toString() };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function getPriceAlerts() {
    try {
        const session = await auth();
        if (!session?.user) return [];

        await dbConnect();

        const alerts = await PriceAlert.find({
            userId: (session.user as any).id
        }).sort({ createdAt: -1 })
            .populate('instrumentId', 'brand model images genericImages');

        return JSON.parse(JSON.stringify(alerts));
    } catch (error) {
        return [];
    }
}

export async function deletePriceAlert(id: string) {
    try {
        const session = await auth();
        if (!session?.user) throw new Error('Unauthorized');
        await dbConnect();
        await PriceAlert.deleteOne({ _id: id, userId: (session.user as any).id });
        revalidatePath('/dashboard/alerts');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function runScraperForAlert(alertId: string) {
    try {
        await dbConnect();
        const alert = await PriceAlert.findById(alertId);
        if (!alert) throw new Error('Alert not found');

        // 1. Use centralized Intelligence Service to fetch from all integrated APIs + Scrapers
        const { marketIntelligence } = await import('@/lib/api/MarketIntelligenceService');
        const results = await marketIntelligence.fetchAllListings(alert.query);

        console.log(`[PriceAlert] Fetched ${results.length} listings for: ${alert.query}`);

        // 2. Filter by target price if set
        const deals = results.filter(item => {
            if (!alert.targetPrice) return true;
            return item.price <= alert.targetPrice;
        });

        // 3. Save to cache (bulk write)
        const bulkOps = results.map(item => ({
            updateOne: {
                filter: { source: item.source, externalId: item.id },
                update: {
                    $set: {
                        ...item,
                        location: item.location || 'Online',
                        externalId: item.id,
                        query: alert.query,
                        isSold: false,
                        updatedAt: new Date()
                    }
                },
                upsert: true
            }
        }));

        if (bulkOps.length > 0) {
            await ScrapedListing.bulkWrite(bulkOps);
        }

        // 4. Notify User if deals found
        if (deals.length > 0) {
            try {
                const User = (await import('@/models/User')).default;
                const user = await User.findById(alert.userId);

                if (user && user.email) {
                    const { sendEmail } = await import('@/lib/email');

                    // Simple HTML list of deals
                    const dealsHtml = deals.slice(0, 5).map((d: any) => `
                        <div style="margin-bottom: 10px; padding: 10px; border-bottom: 1px solid #eee;">
                            <a href="${d.url}" style="font-weight: bold; color: #0070c9; text-decoration: none;">${d.title}</a>
                            <div style="color: #333; font-weight: bold;">${d.price} ${d.currency}</div>
                            <div style="font-size: 12px; color: #666;">${d.source} - ${d.location || 'Online'}</div>
                        </div>
                    `).join('');

                    const { getAndRenderEmail } = await import('@/lib/email-templates');
                    const emailContent = await getAndRenderEmail('PRICE_ALERT', {
                        username: user.name || 'Usuario',
                        query: alert.query,
                        allDealsHtml: dealsHtml
                    });

                    await sendEmail({
                        to: user.email,
                        ...emailContent
                    });
                    console.log(`[PriceAlert] Access email sent to ${user.email} for ${alert.query}`);
                }
            } catch (emailErr) {
                console.error('Failed to send alert email:', emailErr);
            }
        }

        // 5. Update alert stats
        alert.lastChecked = new Date();
        alert.triggerCount += 1;
        await alert.save();

        revalidatePath('/dashboard/alerts');

        return { success: true, count: results.length, deals: deals.length };
    } catch (error: any) {
        console.error('Scraper run error:', error);
        return { success: false, error: error.message };
    }
}

export async function checkIsTracked(instrumentId: string) {
    try {
        const session = await auth();
        if (!session?.user) return { isTracked: false };

        await dbConnect();
        const alert = await PriceAlert.findOne({
            userId: (session.user as any).id,
            instrumentId: instrumentId
        });

        return { isTracked: !!alert, alertId: alert?._id.toString() };
    } catch (error) {
        return { isTracked: false };
    }
}
