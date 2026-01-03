'use server';

import dbConnect from '@/lib/db';
import PriceAlert from '@/models/PriceAlert';
import ScrapedListing from '@/models/ScrapedListing';
import { auth } from '@/auth';
import { ReverbScraper } from '@/lib/scrapers/ReverbScraper';
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
        }).sort({ createdAt: -1 });

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

        const scraper = new ReverbScraper();
        const results = await scraper.search(alert.query);

        // Filter by target price if set
        const deals = results.filter(item => {
            if (!alert.targetPrice) return true;
            return item.price <= alert.targetPrice;
        });

        // Save scraped listings to cache
        for (const item of results) {
            await ScrapedListing.updateOne(
                { source: 'reverb', externalId: item.id },
                {
                    ...item,
                    location: item.location || 'Online', // Ensure fields match schema
                    externalId: item.id,
                    query: alert.query,
                    isSold: false
                },
                { upsert: true }
            );
        }

        // Update alert stats
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
