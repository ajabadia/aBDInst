import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { configureStorageProvider } from '@/actions/storage';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
        return NextResponse.redirect(new URL(`/dashboard/settings?error=${error}`, request.url));
    }

    if (!code) {
        return NextResponse.redirect(new URL('/dashboard/settings?error=no_code', request.url));
    }

    try {
        const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
        const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
        const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/google-drive/callback`;

        const oauth2Client = new google.auth.OAuth2(
            clientId,
            clientSecret,
            redirectUri
        );

        const { tokens } = await oauth2Client.getToken(code);
        oauth2Client.setCredentials(tokens);

        // Get user info to save as identifier
        const drive = google.drive({ version: 'v3', auth: oauth2Client });
        const about = await drive.about.get({ fields: 'user' });
        const email = about.data.user?.emailAddress;

        // Save credentials
        const result = await configureStorageProvider('google-drive', {
            ...tokens,
            clientId,
            clientSecret,
            email // Public config
        });

        if (!result.success) {
            throw new Error(result.error);
        }

        return NextResponse.redirect(new URL('/dashboard/settings?success=google_drive_connected', request.url));

    } catch (error: any) {
        console.error('Google Drive Auth Error:', error);
        return NextResponse.redirect(new URL(`/dashboard/settings?error=${encodeURIComponent(error.message)}`, request.url));
    }
}
