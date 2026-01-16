import { sendEmail, getSmtpConfig } from '@/lib/email';
import { getAndRenderEmail } from './email-templates';

export async function notifyAdminError(context: string, error: any) {
    try {
        const config = await getSmtpConfig();
        // Send to the support email as the "admin" recipient, or fall back to a hardcoded one if needed.
        // In a real app, we might have a specific ADMIN_EMAIL env var.
        const adminEmail = process.env.ADMIN_EMAIL || config.senders.support;

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
            channel: 'support', // Use support channel for system alerts
            ...emailContent
        });

        console.log(`[ErrorNotifier] Alert sent to ${adminEmail}`);

    } catch (e) {
        // Fallback to console if email fails to avoid infinite loops
        console.error('[ErrorNotifier] Failed to send error email:', e);
    }
}
