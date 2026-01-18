'use server';

import { auth } from '@/auth';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { revalidatePath } from 'next/cache';
import SystemConfig from '@/models/SystemConfig';
import { escapeRegExp } from '@/lib/utils';

// Helper to check if current user is admin
async function checkAdmin() {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) throw new Error("No autorizado");

    await dbConnect();
    const currentUser = await User.findById(userId);

    if (!currentUser || currentUser.role !== 'admin') {
        throw new Error("Acceso denegado: Requiere rol de Administrador");
    }
    return currentUser;
}

export async function getUsers(page = 1, limit = 20, search = '') {
    try {
        await checkAdmin();

        const query: Record<string, any> = {};
        if (search) {
            const safeSearch = escapeRegExp(search);
            query.$or = [
                { name: { $regex: safeSearch, $options: 'i' } },
                { email: { $regex: safeSearch, $options: 'i' } }
            ];
        }

        const skip = (page - 1) * limit;

        const users = await User.find(query)
            .select('name email image role isBanned createdAt lastLogin')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        const total = await User.countDocuments(query);

        return {
            success: true,
            users: JSON.parse(JSON.stringify(users)),
            total,
            pages: Math.ceil(total / limit)
        };
    } catch (error: unknown) {
        return { success: false, error: error instanceof Error ? error.message : "Error desconocido" };
    }
}

export async function updateUserRole(userId: string, newRole: 'admin' | 'editor' | 'normal') {
    try {
        const admin = await checkAdmin();

        // Prevent self-demotion to lock out admin
        if (userId === admin._id.toString() && newRole !== 'admin') {
            throw new Error("No te puedes quitar el rol de admin a ti mismo");
        }

        await User.findByIdAndUpdate(userId, { role: newRole });
        revalidatePath('/dashboard/admin');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function toggleUserBan(userId: string) {
    try {
        const admin = await checkAdmin();

        if (userId === admin._id.toString()) {
            throw new Error("No te puedes banear a ti mismo");
        }

        const user = await User.findById(userId);
        if (!user) throw new Error("Usuario no encontrado");

        user.isBanned = !user.isBanned;
        await user.save();

        revalidatePath('/dashboard/admin');
        return { success: true, isBanned: user.isBanned };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function getSystemConfig(key: string) {
    try {
        await dbConnect();
        const config = await SystemConfig.findOne({ key });
        return config ? config.value : null;
    } catch (error) {
        console.error(`Error getting config ${key}:`, error);
        return null;
    }
}

export async function updateSystemConfig(key: string, value: any, description?: string) {
    try {
        const admin = await checkAdmin();

        // Find existing config to track history
        const existing = await SystemConfig.findOne({ key });
        console.log(`[updateSystemConfig] Key: ${key}, Existing found: ${!!existing}`);

        let historyEntry = null;
        if (existing) {
            historyEntry = {
                value: existing.value,
                updatedAt: new Date(),
                updatedBy: admin._id.toString()
            };
            console.log(`[updateSystemConfig] History entry created:`, historyEntry);
        }

        const update: any = {
            value,
            $push: historyEntry ? { history: historyEntry } : {}
        };

        if (description) update.description = description;

        // Clean up empty $push if no history
        if (!historyEntry) delete update.$push;

        console.log(`[updateSystemConfig] Update object:`, JSON.stringify(update, null, 2));

        await SystemConfig.findOneAndUpdate(
            { key },
            update,
            { upsert: true, new: true }
        );

        revalidatePath('/dashboard/admin/ai');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function getAdminStats() {
    try {
        await checkAdmin();
        const Comment = (await import('@/models/Comment')).default;

        const [userCount, instrumentCount, reports, banned] = await Promise.all([
            User.countDocuments({}),
            (await import('@/models/Instrument')).default.countDocuments({}),
            Comment.countDocuments({ reportCount: { $gt: 0 }, isDeleted: false }),
            User.countDocuments({ isBanned: true })
        ]);

        return {
            users: userCount,
            instruments: instrumentCount,
            reports: reports,
            banned
        };
    } catch (error) {
        console.error('Error getting admin stats:', error);
        return { users: 0, instruments: 0, reports: 0, banned: 0 };
    }
}

export async function getModerationQueue() {
    try {
        await checkAdmin();
        const Comment = (await import('@/models/Comment')).default;

        const reported = await Comment.find({ reportCount: { $gt: 0 }, isDeleted: false })
            .populate('userId', 'name email role isBanned')
            .sort({ reportCount: -1, createdAt: -1 })
            .lean();

        return JSON.parse(JSON.stringify(reported));
    } catch (error) {
        console.error('Error fetching moderation queue:', error);
        return [];
    }
}

export async function getAllSystemConfigs() {
    try {
        await checkAdmin();
        const configs = await SystemConfig.find({});
        return JSON.parse(JSON.stringify(configs));
    } catch (error) {
        return [];
    }
}

export async function getDefaultConfig() {
    await checkAdmin();
    return {
        prompt: "You are an expert instrument appraiser. Analyze the provided image/text and return a JSON object with brand, model, type, year, description, specs (array of category/label/value), originalPrice (price/currency/year), and marketValue (estimatedPrice/currency/priceRange).",
        model: 'gemini-2.0-flash-exp'
    };
}


// --- CATALOG MANAGEMENT ---

export async function getAllInstrumentsAdmin(filter: 'all' | 'published' | 'draft' = 'all', search: string = '') {
    try {
        await checkAdmin();
        const Instrument = (await import('@/models/Instrument')).default;

        const query: Record<string, any> = {};

        if (filter !== 'all') {
            query.status = filter;
        }

        if (search) {
            const safeSearch = escapeRegExp(search);
            query.$or = [
                { brand: { $regex: safeSearch, $options: 'i' } },
                { model: { $regex: safeSearch, $options: 'i' } }
            ];
        }

        const instruments = await Instrument.find(query)
            .sort({ updatedAt: -1 })
            .lean();

        return { success: true, data: JSON.parse(JSON.stringify(instruments)) };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function setInstrumentStatus(id: string, status: 'published' | 'draft' | 'archived') {
    try {
        const admin = await checkAdmin();
        const Instrument = (await import('@/models/Instrument')).default;

        await Instrument.findByIdAndUpdate(id, {
            status,
            $push: {
                statusHistory: {
                    status,
                    changedBy: admin._id,
                    date: new Date(),
                    note: 'Admin manual update'
                }
            }
        });

        revalidatePath('/dashboard/admin/catalog');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}


// --- MODERATION ACTIONS ---

export async function manageReport(commentId: string, action: 'dismiss' | 'delete') {
    try {
        await checkAdmin();
        const Comment = (await import('@/models/Comment')).default;

        if (action === 'delete') {
            await Comment.findByIdAndUpdate(commentId, {
                isDeleted: true,
                status: 'hidden',
                content: '[Comentario eliminado por moderación]'
            });
        } else if (action === 'dismiss') {
            await Comment.findByIdAndUpdate(commentId, { reports: [], reportCount: 0 });
        }

        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function punishUser(userId: string, action: 'strike' | 'ban') {
    try {
        const admin = await checkAdmin();
        if (userId === admin._id.toString()) throw new Error("No puedes sancionarte a ti mismo");

        if (action === 'ban') {
            await User.findByIdAndUpdate(userId, { isBanned: true });
        } else if (action === 'strike') {
            await User.findByIdAndUpdate(userId, { $inc: { strikes: 1 } });
        }

        revalidatePath('/dashboard/admin');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}


// --- EMAIL TEST ---

export async function sendTestEmail(emailAccountId: string | null, to: string) {
    try {
        await checkAdmin();
        const { sendEmail } = await import('@/lib/email');

        const result = await sendEmail({
            to,
            subject: `[Test] Verificación de Configuración SMTP`,
            html: `
                <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                    <h2 style="color: #007AFF;">Prueba de Configuración SMTP</h2>
                    <p>Esta es una prueba de envío para verificar la cuenta seleccionada.</p>
                    <p>Si estás leyendo esto, la configuración de credenciales y el servidor son correctos.</p>
                    <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
                    <p style="font-size: 12px; color: #888;">Enviado desde Instrument Collector Admin Panel.</p>
                </div>
            `,
            emailAccountId: emailAccountId || undefined
        });

        if (!result.success) throw new Error(result.error);
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
// --- EMAIL TEMPLATES ---

export async function getEmailTemplates() {
    try {
        await checkAdmin();
        const EmailTemplate = (await import('@/models/EmailTemplate')).default;
        const { SUPPORTED_TEMPLATE_CODES, getTemplateData } = await import('@/lib/email-templates');

        const templates = await Promise.all(
            SUPPORTED_TEMPLATE_CODES.map(code => getTemplateData(code))
        );

        return { success: true, data: JSON.parse(JSON.stringify(templates)) };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function updateEmailTemplate(code: string, data: { subject: string; htmlBody: string; emailAccountId: string | null }) {
    try {
        const admin = await checkAdmin();
        const EmailTemplate = (await import('@/models/EmailTemplate')).default;
        const { getTemplateData } = await import('@/lib/email-templates');

        // Fetch existing defaults for metadata (name, variables) if it doesn't exist yet
        const existing = await EmailTemplate.findOne({ code });
        const meta = await getTemplateData(code) as any;

        const update: any = {
            code,
            subject: data.subject,
            htmlBody: data.htmlBody,
            emailAccountId: data.emailAccountId,
            name: meta.name,
            availableVariables: meta.availableVariables
        };

        if (existing) {
            const historyEntry = {
                subject: existing.subject,
                htmlBody: existing.htmlBody,
                emailAccountId: existing.emailAccountId,
                updatedAt: new Date(),
                updatedBy: admin._id.toString()
            };
            update.$push = { history: historyEntry };
        }

        await EmailTemplate.findOneAndUpdate(
            { code },
            update,
            { upsert: true, new: true }
        );

        revalidatePath('/dashboard/admin/emails');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// --- EMAIL ACCOUNTS (MULTI-SMTP) ---

export async function getEmailAccounts() {
    try {
        await checkAdmin();
        const EmailAccount = (await import('@/models/EmailAccount')).default;
        const accounts = await EmailAccount.find({}).sort({ isDefault: -1, name: 1 }).lean();
        return { success: true, data: JSON.parse(JSON.stringify(accounts)) };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function updateEmailAccount(id: string | null, data: any) {
    try {
        await checkAdmin();
        const EmailAccount = (await import('@/models/EmailAccount')).default;

        if (id) {
            await EmailAccount.findByIdAndUpdate(id, data);
        } else {
            // If it's the first account ever, make it default
            const count = await EmailAccount.countDocuments({});
            if (count === 0) data.isDefault = true;
            await EmailAccount.create(data);
        }

        revalidatePath('/dashboard/admin/settings');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function deleteEmailAccount(id: string) {
    try {
        await checkAdmin();
        const EmailAccount = (await import('@/models/EmailAccount')).default;
        const account = await EmailAccount.findById(id);

        if (!account) throw new Error("Cuenta no encontrada");
        if (account.isDefault) throw new Error("No puedes eliminar la cuenta por defecto");

        await EmailAccount.findByIdAndDelete(id);
        revalidatePath('/dashboard/admin/settings');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

/**
 * Migrates legacy smtp_settings from SystemConfig to EmailAccount collection.
 * This should be called once when the new system is deployed.
 */
export async function migrateLegacySmtp() {
    try {
        await checkAdmin();
        const EmailAccount = (await import('@/models/EmailAccount')).default;

        // Check if migration already happened
        const existingCount = await EmailAccount.countDocuments({});
        if (existingCount > 0) return { success: true, message: 'La migración ya se realizó anteriormente' };

        const legacySettings = await getSystemConfig('smtp_settings');
        if (!legacySettings) return { success: false, error: 'No se encontraron configuraciones antiguas' };

        // Create the primary/general account from legacy settings
        await EmailAccount.create({
            name: 'General / Sistema',
            host: legacySettings.host,
            port: legacySettings.port,
            user: legacySettings.user,
            pass: legacySettings.pass,
            secure: legacySettings.secure,
            fromEmail: legacySettings.senders?.general || legacySettings.user,
            isDefault: true
        });

        // Optionally create support/alerts if they were different
        if (legacySettings.senders?.support && legacySettings.senders.support !== legacySettings.senders.general) {
            await EmailAccount.create({
                name: 'Soporte y Contacto',
                host: legacySettings.host,
                port: legacySettings.port,
                user: legacySettings.user,
                pass: legacySettings.pass,
                secure: legacySettings.secure,
                fromEmail: legacySettings.senders.support,
                isDefault: false
            });
        }

        if (legacySettings.senders?.alerts && legacySettings.senders.alerts !== legacySettings.senders.general) {
            await EmailAccount.create({
                name: 'Alertas de Precio',
                host: legacySettings.host,
                port: legacySettings.port,
                user: legacySettings.user,
                pass: legacySettings.pass,
                secure: legacySettings.secure,
                fromEmail: legacySettings.senders.alerts,
                isDefault: false
            });
        }

        return { success: true, message: 'Migración completada con éxito' };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
