import nodemailer from 'nodemailer';
import { getSystemConfig } from '@/actions/admin'; // We'll need a non-server-action version if possible, but for server-side logic this is fine.
// NOTE: getSystemConfig is marked 'use server' in admin.ts. 
// Ideally we should separate DB logic from server actions to be cleaner, 
// but Next.js server actions can be called from other server components/functions.

export type EmailChannel = 'general' | 'support' | 'alerts';

interface SmtpConfig {
    host: string;
    port: number;
    user: string;
    pass: string;
    secure: boolean;
    senders: {
        general: string;
        support: string;
        alerts: string;
    };
}

export async function getSmtpConfig(): Promise<SmtpConfig> {
    const dbConfig = await getSystemConfig('smtp_settings');

    // Default / Fallback from Environment
    const defaultConfig: SmtpConfig = {
        host: process.env.SMTP_HOST || '',
        port: parseInt(process.env.SMTP_PORT || '587'),
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || '',
        secure: process.env.SMTP_SECURE === 'true',
        senders: {
            general: process.env.SMTP_FROM_EMAIL || 'noreply@instrumentcollector.com',
            support: process.env.SMTP_FROM_EMAIL || 'support@instrumentcollector.com',
            alerts: process.env.SMTP_FROM_EMAIL || 'alerts@instrumentcollector.com'
        }
    };

    if (dbConfig && typeof dbConfig === 'object') {
        return { ...defaultConfig, ...dbConfig };
    }

    return defaultConfig;
}

export async function sendEmail({
    to,
    subject,
    html,
    channel = 'general'
}: {
    to: string;
    subject: string;
    html: string;
    channel?: EmailChannel;
}) {
    try {
        const config = await getSmtpConfig();

        if (!config.host || !config.user) {
            console.warn('⚠️ SMTP not configured. Email suppressed:', { to, subject, channel });
            if (process.env.NODE_ENV === 'development') {
                return { success: true, message: 'Simulated (No Config)' };
            }
            return { success: false, error: 'SMTP no configurado' };
        }

        const transporter = nodemailer.createTransport({
            host: config.host,
            port: config.port,
            secure: config.secure,
            auth: {
                user: config.user,
                pass: config.pass,
            },
        });

        const sender = config.senders[channel] || config.senders.general;
        // Ensure "From" header is formatted cleanly
        const fromHeader = sender.includes('<') ? sender : `"Instrument Collector" <${sender}>`;

        const info = await transporter.sendMail({
            from: fromHeader,
            to,
            subject,
            html
        });

        console.log(`📧 Email Sent [${channel}] to ${to} (ID: ${info.messageId})`);
        return { success: true, messageId: info.messageId };

    } catch (error: any) {
        console.error(`❌ Send Email Error [${channel}]:`, error);
        return { success: false, error: error.message };
    }
}

export async function verifySmtpConfig(config: SmtpConfig) {
    try {
        const transporter = nodemailer.createTransport({
            host: config.host,
            port: config.port,
            secure: config.secure,
            auth: {
                user: config.user,
                pass: config.pass,
            },
        });
        await transporter.verify();
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
