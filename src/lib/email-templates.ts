import dbConnect from './db';
import EmailTemplate from '@/models/EmailTemplate';

// Default Hardcoded Templates (Fallback)
const DEFAULT_TEMPLATES: Record<string, { name: string; subject: string; htmlBody: string; vars: string[] }> = {
    WELCOME_USER: {
        name: 'Registro / Bienvenida',
        subject: '¡Bienvenido a Instrument Collector, {{name}}!',
        htmlBody: `
            <div style="font-family: sans-serif; padding: 20px;">
                <h1>¡Hola {{name}}!</h1>
                <p>Gracias por unirte a nuestra comunidad de coleccionistas.</p>
                <p>Ya puedes empezar a gestionar tu inventario y activar alertas de precio.</p>
                <a href="{{link}}" style="background: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Ir a mi Dashboard</a>
            </div>
        `,
        vars: ['name', 'link']
    },
    PRICE_ALERT: {
        name: 'Alerta de Precio',
        subject: '¡Bajada de precio detectada: {{query}}!',
        htmlBody: `
            <div style="font-family: sans-serif;">
                <h2>¡Buenas noticias, {{username}}!</h2>
                <p>Hemos encontrado nuevas ofertas para tu búsqueda: <strong>{{query}}</strong></p>
                <hr />
                {{allDealsHtml}}
                <hr />
                <p>Puedes gestionar tus alertas desde tu perfil.</p>
            </div>
        `,
        vars: ['username', 'query', 'allDealsHtml']
    },
    PASSWORD_RESET: {
        name: 'Recuperar Contraseña',
        subject: 'Instrucciones para restablecer tu contraseña',
        htmlBody: `
            <div style="font-family: sans-serif; padding: 20px;">
                <h1>Restablecer Contraseña</h1>
                <p>Hola {{name}}, has solicitado restablecer tu contraseña.</p>
                <p>Haz clic en el siguiente enlace para continuar:</p>
                <a href="{{link}}" style="background: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Restablecer mi contraseña</a>
                <p>Este enlace expirará en 1 hora.</p>
            </div>
        `,
        vars: ['name', 'link']
    },
    SYSTEM_ERROR: {
        name: 'Error del Sistema (Admin)',
        subject: 'NOTIFICACIÓN CRÍTICA: Error en {{context}}',
        htmlBody: `
            <div style="font-family: monospace; background: #fef2f2; padding: 20px; border: 1px solid #ef4444;">
                <h2 style="color: #b91c1c;">Error detectado en el sistema</h2>
                <p><strong>Contexto:</strong> {{context}}</p>
                <p><strong>Mensaje:</strong> {{message}}</p>
                <div style="background: #fff; padding: 10px; border: 1px solid #ddd;">
                    <code>{{stack}}</code>
                </div>
            </div>
        `,
        vars: ['context', 'message', 'stack']
    },
    CONTACT_FORM_ADMIN: {
        name: 'Nueva Consulta (Admin)',
        subject: '[Nuevo Mensaje] {{subject}}',
        htmlBody: `
            <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee;">
                <h1>Nueva consulta de {{name}}</h1>
                <p><strong>Email:</strong> {{email}}</p>
                <p><strong>Asunto:</strong> {{subject}}</p>
                <div style="background: #f9f9f9; padding: 15px; border-left: 4px solid #007AFF; margin: 20px 0;">
                    {{message}}
                </div>
                <p><a href="{{link}}" style="color: #007AFF; font-weight: bold;">Responder en el Dashboard</a></p>
            </div>
        `,
        vars: ['name', 'email', 'subject', 'message', 'link']
    },
    CONTACT_REPLY_USER: {
        name: 'Respuesta de Soporte (Usuario)',
        subject: 'Respuesta a tu consulta: {{subject}}',
        htmlBody: `
            <div style="font-family: sans-serif; padding: 20px;">
                <h2>Hola {{name}},</h2>
                <p>Un administrador ha respondido a tu solicitud:</p>
                <div style="background: #f0f7ff; padding: 20px; border-radius: 10px; margin: 20px 0;">
                    {{content}}
                </div>
                <hr />
                <p style="color: #666; font-size: 13px;">Tu mensaje original:</p>
                <p style="font-style: italic; color: #888;">{{originalMessage}}</p>
            </div>
        `,
        vars: ['name', 'subject', 'content', 'originalMessage']
    }
};

export async function getTemplateData(code: string) {
    try {
        await dbConnect();
        const template = await EmailTemplate.findOne({ code }).lean() as any;

        const defaults = DEFAULT_TEMPLATES[code];
        if (!defaults) throw new Error(`Template code ${code} not supported`);

        return {
            code,
            name: template?.name || defaults.name,
            subject: template?.subject || defaults.subject,
            htmlBody: template?.htmlBody || defaults.htmlBody,
            availableVariables: template?.availableVariables || defaults.vars,
            history: template?.history || []
        };
    } catch (error) {
        console.error(`[EmailTemplates] Error fetching code ${code}:`, error);
        const defaults = DEFAULT_TEMPLATES[code];
        return {
            code,
            name: defaults?.name || 'Unknown',
            subject: defaults?.subject || '',
            htmlBody: defaults?.htmlBody || '',
            availableVariables: defaults?.vars || [],
            history: []
        };
    }
}

export function renderEmail(subjectTemplate: string, bodyTemplate: string, data: Record<string, string>) {
    let subject = subjectTemplate;
    let html = bodyTemplate;

    Object.entries(data).forEach(([key, value]) => {
        const regex = new RegExp(`{{${key}}}`, 'g');
        subject = subject.replace(regex, value || '');
        html = html.replace(regex, value || '');
    });

    return { subject, html };
}

/**
 * High-level helper to fetch and render in one go
 */
export async function getAndRenderEmail(code: string, data: Record<string, string>) {
    const template = await getTemplateData(code);
    return renderEmail(
        template.subject,
        template.htmlBody,
        data
    );
}

export const SUPPORTED_TEMPLATE_CODES = Object.keys(DEFAULT_TEMPLATES);
