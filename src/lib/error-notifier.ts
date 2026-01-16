import { sendEmail, getEmailAccountConfig } from '@/lib/email';
import { getAndRenderEmail } from './email-templates';

export async function notifyAdminError(context: string, error: any) {
    try {
        const config = await getEmailAccountConfig();
        const adminEmail = process.env.ADMIN_EMAIL || config.fromEmail;

        // Clean error message
        const errorMessage = error instanceof Error ? error.message : String(error);
        const errorStack = error instanceof Error ? error.stack : 'No stack trace';

        if (!adminEmail || adminEmail.includes('example.com')) {
            console.warn('[ErrorNotifier] No admin email configured to receive alerts.');
            return;
        }

        const emailContent = await getAndRenderEmail('SYSTEM_ERROR', {
            context,
            message: errorMessage,
            stack: errorStack || 'No stack trace'
        });

        await sendEmail({
            to: adminEmail,
            ...emailContent
        });
        // channel is now part of emailContent

        console.log(`[ErrorNotifier] Alert sent to ${adminEmail}`);

    } catch (e) {
        // Fallback to console if email fails to avoid infinite loops
        console.error('[ErrorNotifier] Failed to send error email:', e);
    }
}
