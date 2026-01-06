import { checkExpiredRequests } from '@/actions/contact';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic'; // Prevent caching

export async function GET(req: NextRequest) {
    try {
        // Optional: Secure this with a shared secret if needed in production
        // const authHeader = req.headers.get('authorization');
        // if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        //     return new NextResponse('Unauthorized', { status: 401 });
        // }

        const result = await checkExpiredRequests();

        if (result.success) {
            return NextResponse.json({
                success: true,
                message: `Cleaned up ${result.count} expired requests`,
                timestamp: new Date().toISOString()
            });
        } else {
            return NextResponse.json({ success: false, error: result.error }, { status: 500 });
        }
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
