
/**
 * Mock Email Service
 * 
 * Since we cannot install 'resend' or 'nodemailer' in this environment,
 * this service simulates sending emails by logging them to the server console.
 * 
 * TODO: Replace this with a real provider integration.
 */

interface SendEmailParams {
    to: string;
    subject: string;
    html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailParams): Promise<boolean> {
    console.log(`
=========================================================
[MOCK EMAIL SERVICE] Sending Email...
TO: ${to}
SUBJECT: ${subject}
---------------------------------------------------------
${html.replace(/<[^>]*>?/gm, '')} 
(HTML content hidden for brevity in logs, normally full body)
=========================================================
    `);

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    return true;
}
