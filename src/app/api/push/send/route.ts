import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import dbConnect from '@/lib/db';
import PushSubscription from '@/models/PushSubscription';
// Config Web Push (Lazy)
// eslint-disable-next-line @typescript-eslint/no-require-imports
const webpush = require('web-push');

export async function POST(req: NextRequest) {
    try {
        const session = await auth();
        // Lazy init to avoid build crash on missing env
        if (!process.env.VAPID_PRIVATE_KEY) {
            console.error('VAPID Keys missing');
            return NextResponse.json({ error: 'Server Config Error' }, { status: 500 });
        }

        try {
            webpush.setVapidDetails(
                process.env.NEXT_PUBLIC_WebPushEmail || 'mailto:admin@example.com',
                process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
                process.env.VAPID_PRIVATE_KEY!
            );
        } catch (e) {
            console.error('Failed to set VAPID details', e);
            // Continue if already set? or Fail.
        }

        const isAdmin = (session?.user as any)?.role === 'admin' || (session?.user as any)?.role === 'supereditor';

        if (!isAdmin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { userId, title, message, url } = await req.json();

        await dbConnect();

        let query = {};
        if (userId === 'all') {
            // Send to everyone (Careful!)
            query = {};
        } else if (userId) {
            query = { userId };
        } else {
            // Default to current user for testing
            query = { userId: session?.user?.id };
        }

        const subscriptions = await PushSubscription.find(query);

        if (subscriptions.length === 0) {
            return NextResponse.json({ success: false, message: 'No subscriptions found' });
        }

        const payload = JSON.stringify({
            title: title || 'Notificación de Prueba',
            body: message || '¡Hola! Esto es una prueba de Instrument Collector.',
            icon: '/icons/icon-192.png',
            url: url || '/dashboard'
        });

        const results = await Promise.allSettled(
            subscriptions.map(async (sub) => {
                try {
                    await webpush.sendNotification(sub.subscription as any, payload);
                    return { success: true, id: sub._id };
                } catch (error: any) {
                    if (error.statusCode === 410 || error.statusCode === 404) {
                        // Subscription expired or gone, delete it
                        await PushSubscription.deleteOne({ _id: sub._id });
                        return { success: false, id: sub._id, error: 'Expired' };
                    }
                    throw error;
                }
            })
        );

        const successCount = results.filter(r => r.status === 'fulfilled' && (r.value as any).success).length;

        return NextResponse.json({
            success: true,
            sent: successCount,
            total: subscriptions.length
        });

    } catch (error) {
        console.error('Error sending push:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
