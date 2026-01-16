import { sendEmail } from './email';

export async function reportError(error: any, context: string, severity: 'critical' | 'warning' = 'critical') {
    // Only report critical errors to email to avoid spam
    // Or if in production
    if (process.env.NODE_ENV !== 'production' && severity !== 'critical') return;

    try {
        const errorMsg = error instanceof Error ? error.message : String(error);
        const stack = error instanceof Error ? error.stack : 'No stack trace';

        console.error(`[REPORT:${severity.toUpperCase()}] ${context}:`, error);

        if (severity === 'critical') {
            const { getAndRenderEmail } = await import('./email-templates');
            const emailContent = await getAndRenderEmail('SYSTEM_ERROR', {
                context,
                message: errorMsg,
                stack: stack || 'No stack trace'
            });

            await sendEmail({
                to: process.env.ADMIN_EMAIL || 'admin@instrumentcollector.com',
                ...emailContent
            });
        }
    } catch (e) {
        // Fail silently to avoid crash loops
        console.error('Failed to report error:', e);
    }
}
