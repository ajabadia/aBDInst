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
            await sendEmail({
                to: process.env.ADMIN_EMAIL || 'admin@instrumentcollector.com', // Fallback or need to fetch admin list? 
                // Fetching admin list here might create loop if DB is down. 
                // Better to rely on a specific env for alerts OR the 'alerts' sender config TO address?
                // Actually sendEmail uses DB config for SENDER. Destination should be fixed or configured.
                // For now let's use a safe fallback or assume ADMIN_EMAIL env is set.

                // Better strategy: Send to the "Alerts" sender address itself if no other address specified? 
                // Or hardcode an alert recipient in system config?
                // Let's assume there is an ADMIN_EMAIL or we send to the 'support' sender address as a loopback.

                subject: `[ALERTA CRÍTICA] Error en ${context}`,
                html: `
                    <div style="font-family: monospace; padding: 20px; background: #fff0f0; border: 1px solid #fcc;">
                        <h2 style="color: #d00;">System Alert</h2>
                        <p><strong>Context:</strong> ${context}</p>
                        <p><strong>Message:</strong> ${errorMsg}</p>
                        <pre style="background: #fff; padding: 10px; overflow: auto; font-size: 11px;">${stack}</pre>
                        <p>Time: ${new Date().toISOString()}</p>
                    </div>
                `,
                channel: 'alerts'
            });
        }
    } catch (e) {
        // Fail silently to avoid crash loops
        console.error('Failed to report error:', e);
    }
}
