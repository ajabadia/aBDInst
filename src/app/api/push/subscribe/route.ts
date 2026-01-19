import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import dbConnect from '@/lib/db';
import PushSubscription from '@/models/PushSubscription';

export async function POST(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const data = await req.json();

        if (!data.subscription?.endpoint || !data.subscription?.keys?.auth) {
            return NextResponse.json({ error: 'Invalid subscription data' }, { status: 400 });
        }

        await dbConnect();

        // Upsert based on endpoint to avoid duplicates
        await PushSubscription.findOneAndUpdate(
            { 'subscription.endpoint': data.subscription.endpoint },
            {
                userId: session.user.id,
                subscription: data.subscription as any,
                userAgent: req.headers.get('user-agent') || 'Unknown'
            },
            { upsert: true, new: true }
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error saving subscription:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
