import nodemailer from 'nodemailer';
import dbConnect from '@/lib/db';
import EmailAccount from '@/models/EmailAccount';

export interface SmtpConfig {
    host: string;
    port: number;
    user: string;
    pass: string;
    secure: boolean;
    fromEmail: string;
}

/**
 * Fetches an email account by ID or returns the default one.
 * Falls back to environment variables if no account is found.
 */
export async function getEmailAccountConfig(accountId?: string): Promise<SmtpConfig> {
    await dbConnect();

    let account = null;
    if (accountId) {
        account = await EmailAccount.findById(accountId);
    }

    if (!account) {
        account = await EmailAccount.findOne({ isDefault: true });
    }

    if (account) {
        return {
            host: account.host,
            port: account.port,
            user: account.user,
            pass: account.pass,
            secure: account.secure,
            fromEmail: account.fromEmail
        };
    }

    // Default / Fallback from Environment (Legacy support)
    return {
        host: process.env.SMTP_HOST || '',
        port: parseInt(process.env.SMTP_PORT || '587'),
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || '',
        secure: process.env.SMTP_SECURE === 'true',
        fromEmail: process.env.SMTP_FROM_EMAIL || 'noreply@instrumentcollector.com'
    };
}

export async function sendEmail({
    to,
    subject,
    html,
    emailAccountId
}: {
    to: string;
    subject: string;
    html: string;
    emailAccountId?: string;
}) {
    try {
        const config = await getEmailAccountConfig(emailAccountId);

        if (!config.host || !config.user) {
            console.warn('⚠️ SMTP not configured. Email suppressed:', { to, subject, emailAccountId });
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

        // Ensure "From" header is formatted cleanly
        const fromHeader = config.fromEmail.includes('<') ? config.fromEmail : `"Instrument Collector" <${config.fromEmail}>`;

        const info = await transporter.sendMail({
            from: fromHeader,
            to,
            subject,
            html
        });

        console.log(`📧 Email Sent to ${to} (ID: ${info.messageId}) using account: ${config.user}`);
        return { success: true, messageId: info.messageId };

    } catch (error: any) {
        console.error(`❌ Send Email Error:`, error);
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
