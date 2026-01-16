
import { sendEmail, getSmtpConfig } from '@/lib/email';

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

        await sendEmail({
            to: adminEmail,
            channel: 'support', // Use support channel for system alerts
            subject: `🚨 Critical Error: ${context}`,
            html: `
                <div style="font-family: monospace; padding: 20px; background: #fff0f0; border: 1px solid #d00; border-radius: 5px;">
                    <h2 style="color: #d00; margin-top: 0;">System Error Alert</h2>
                    <p><strong>Context:</strong> ${context}</p>
                    <p><strong>Time:</strong> ${new Date().toISOString()}</p>
                    <hr style="border: 0; border-top: 1px solid #ffcccc;" />
                    <h3>Error Details:</h3>
                    <pre style="background: #fff; padding: 10px; overflow-x: auto;">${errorMessage}</pre>
                    <h3>Stack Trace:</h3>
                    <pre style="background: #fff; padding: 10px; overflow-x: auto; font-size: 11px; color: #666;">${errorStack}</pre>
                </div>
            `
        });

        console.log(`[ErrorNotifier] Alert sent to ${adminEmail}`);

    } catch (e) {
        // Fallback to console if email fails to avoid infinite loops
        console.error('[ErrorNotifier] Failed to send error email:', e);
    }
}
