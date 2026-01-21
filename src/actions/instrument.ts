'use server';

import dbConnect from '@/lib/db';
import Instrument from '@/models/Instrument';
import { revalidatePath } from 'next/cache';
import { InstrumentSchema } from '@/lib/schemas';
import { escapeRegExp } from '@/lib/utils';
import { checkRateLimit, getRateLimitKey } from '@/lib/rate-limit';
import { createSafeAction } from '@/lib/safe-action';
import { z } from 'zod';
import { DatabaseError, NotFoundError, AppError, ValidationError, AuthError } from '@/lib/errors';
import { logEvent } from '@/lib/logger';
import InstrumentArtist from '@/models/InstrumentArtist';
import InstrumentAlbum from '@/models/InstrumentAlbum';
import { auth } from '@/auth'; // Needed for manual checks if any, or createSafeAction handles it if passed

// Helper to sanitize Mongoose documents for client
function sanitize(doc: any) {
    if (!doc) return null;
    return JSON.parse(JSON.stringify(doc));
}

export const createInstrument = createSafeAction(
    InstrumentSchema,
    async (data, userId, role, correlationId) => {
        const isPrivileged = ['admin', 'editor', 'supereditor'].includes(role);

        // 1. Rate limiting for non-privileged users
        if (!isPrivileged) {
            const rateLimitKey = getRateLimitKey(userId, 'createInstrument');
            const rateLimit = await checkRateLimit(rateLimitKey, {
                maxRequests: 5,
                windowMs: 60 * 60 * 1000 // per hour
            });

            if (!rateLimit.allowed) {
                const resetIn = Math.ceil((rateLimit.resetAt - Date.now()) / 60000);
                throw new AppError(`Límite de creación alcanzado. Intenta de nuevo en ${resetIn} minutos.`, 429, 'RATE_LIMIT_EXCEEDED');
            }
        }

        await dbConnect();

        // 2. Duplicate Check
        const existingInstrument = await Instrument.findOne({
            brand: { $regex: new RegExp(`^${escapeRegExp(data.brand)}$`, 'i') },
            model: { $regex: new RegExp(`^${escapeRegExp(data.model)}$`, 'i') },
            version: data.version ? { $regex: new RegExp(`^${escapeRegExp(data.version)}$`, 'i') } : null
        }).select('_id');

        if (existingInstrument) {
            // Auto-add to collection if it exists but user doesn't have it
            const UserCollection = (await import('@/models/UserCollection')).default;
            const existingInCollection = await UserCollection.findOne({
                userId: userId,
                instrumentId: existingInstrument._id
            });

            if (!existingInCollection) {
                await UserCollection.create({
                    userId: userId,
                    instrumentId: existingInstrument._id,
                    status: 'active',
                    acquisition: { date: new Date(), price: 0, currency: 'EUR' },
                    notes: 'Añadido automáticamente al detectar existencia previa'
                });
            } else if (existingInCollection.status === 'wishlist') {
                // If it was in wishlist, upgrade to owned
                await UserCollection.findByIdAndUpdate(existingInCollection._id, {
                    status: 'active',
                    acquisition: { date: new Date() },
                    $push: {
                        events: {
                            type: 'status_change',
                            date: new Date(),
                            title: 'Adquirido',
                            description: 'Movido de Wishlist a Colección al re-intentar creación'
                        }
                    }
                });
            }

            throw new AppError('Este instrumento ya existe en el catálogo global', 409, 'DUPLICATE_INSTRUMENT', { id: existingInstrument._id.toString() });
        }

        try {
            // 3. Create Instrument
            const instrumentStatus = data.status || (isPrivileged ? 'published' : 'pending');
            const instrument = await Instrument.create({
                ...data,
                createdBy: userId,
                status: instrumentStatus,
                statusHistory: [{
                    status: instrumentStatus,
                    changedBy: userId,
                    date: new Date(),
                    note: isPrivileged ? 'Created by Admin' : 'Submitted for review'
                }]
            });

            // 4. Auto-add to user's collection
            const UserCollection = (await import('@/models/UserCollection')).default;
            await UserCollection.create({
                userId: userId,
                instrumentId: instrument._id,
                status: 'active',
                acquisition: { date: new Date(), price: 0, currency: 'EUR' },
                notes: 'Instrumento creado por mí'
            });

            // 5. Music Enrichment
            if ((data.artists && data.artists.length > 0) || (data.albums && data.albums.length > 0)) {
                try {
                    const { enrichInstrumentWithMusic } = await import('@/lib/music/enrichment');
                    await enrichInstrumentWithMusic(
                        instrument._id.toString(),
                        {
                            artists: data.artists || [],
                            albums: (data.albums || []).map(a => ({
                                ...a,
                                year: a.year ? Number(a.year) : undefined
                            }))
                        },
                        userId
                    );
                } catch (enrichmentError) {
                    console.error('⚠️ Music enrichment failed (non-critical):', enrichmentError);
                }
            }

            await logEvent({
                nivel: 'INFO',
                origen: 'catalog',
                accion: 'instrument_create_success',
                mensaje: `Instrumento creado exitosamente: ${data.brand} ${data.model}`,
                correlacion_id: correlationId,
                detalles: { instrumentId: instrument._id }
            });

            revalidatePath('/instruments');
            return sanitize(instrument);
        } catch (error: any) {
            if (error instanceof AppError) throw error;
            throw new DatabaseError("Error al crear el instrumento", error);
        }
    },
    { protected: true, name: 'CREATE_INSTRUMENT' }
);


export const addToCollection = createSafeAction(
    z.string(),
    async (instrumentId, userId) => {
        // Rate limiting
        const rateLimitKey = getRateLimitKey(userId, 'addToCollection');
        const rateLimit = await checkRateLimit(rateLimitKey, {
            maxRequests: 10,
            windowMs: 60 * 60 * 1000
        });

        if (!rateLimit.allowed) {
            throw new AppError('Rate limit exceeded', 429, 'RATE_LIMIT_EXCEEDED');
        }

        await dbConnect();
        const UserCollection = (await import('@/models/UserCollection')).default;

        const existing = await UserCollection.findOne({
            userId: userId,
            instrumentId: instrumentId
        });

        if (existing) {
            throw new ValidationError('Instrument already in collection');
        }

        await UserCollection.create({
            userId: userId,
            instrumentId: instrumentId,
            status: 'active',
            acquisition: { date: new Date(), price: 0, currency: 'EUR' },
            notes: 'Añadido desde catálogo global'
        });

        revalidatePath('/dashboard/collection');
        return { success: true };
    },
    { protected: true }
);

// Note: Legacy search functions (getInstruments, getBrands, getInstrumentById) moved to catalog.ts

export const updateInstrument = createSafeAction(
    z.object({
        id: z.string(),
        data: InstrumentSchema.partial()
    }),
    async ({ id, data }, userId, role, correlationId) => {
        await dbConnect();

        const instrument = await Instrument.findById(id);
        if (!instrument) {
            throw new NotFoundError('Instrumento');
        }

        const isStaff = ['admin', 'editor'].includes(role);
        const isCreator = instrument.createdBy.toString() === userId;

        if (!isStaff && !isCreator) {
            throw new AuthError('Permission denied');
        }

        try {
            const updatedInstrument = await Instrument.findByIdAndUpdate(
                id,
                { $set: data },
                { runValidators: true, new: true }
            );

            if (data.artists || data.albums) {
                try {
                    const { enrichInstrumentWithMusic } = await import('@/lib/music/enrichment');
                    await enrichInstrumentWithMusic(
                        id,
                        {
                            artists: data.artists,
                            albums: data.albums
                        },
                        userId
                    );
                } catch (e) {
                    await logEvent({
                        nivel: 'WARN',
                        origen: 'catalog',
                        accion: 'enrichment_failed',
                        mensaje: `Error en enriquecimiento musical para ${id}`,
                        correlacion_id: correlationId,
                        detalles: { error: e instanceof Error ? e.message : String(e) }
                    });
                }
            }

            await logEvent({
                nivel: 'INFO',
                origen: 'catalog',
                accion: 'instrument_update_success',
                mensaje: `Instrumento ${id} actualizado`,
                correlacion_id: correlationId,
                detalles: { instrumentId: id }
            });

            revalidatePath('/instruments');
            revalidatePath(`/instruments/${id}`);

            return sanitize(updatedInstrument);
        } catch (error: any) {
            throw new DatabaseError("Error al actualizar instrumento", error);
        }
    },
    { protected: true }
);

export const getRelatedGear = createSafeAction(
    z.string(),
    async (id) => {
        await dbConnect();
        const accessories = await Instrument.find({ relatedTo: id }).lean();
        return sanitize(accessories);
    }
);

export const deleteInstruments = createSafeAction(
    z.array(z.string()),
    async (ids, userId, role, correlationId) => {
        await dbConnect();
        const result = await Instrument.deleteMany({ _id: { $in: ids } });

        await logEvent({
            nivel: 'INFO',
            origen: 'catalog',
            accion: 'instruments_deleted',
            mensaje: `${result.deletedCount} instrumentos eliminados`,
            correlacion_id: correlationId,
            detalles: { count: result.deletedCount, ids }
        });

        revalidatePath('/instruments');
        return { success: true, count: result.deletedCount };
    },
    { allowedRoles: ['admin', 'editor'] }
);

// --- Approval Flow & Curation Actions ---

export const submitForReview = createSafeAction(
    z.string(),
    async (id, userId, role) => {
        await dbConnect();
        const instrument = await Instrument.findById(id);
        if (!instrument) throw new NotFoundError(`Instrument ${id} not found`);

        const isCreator = instrument.createdBy.toString() === userId;
        const isStaff = ['admin', 'editor'].includes(role);

        if (!isCreator && !isStaff) {
            throw new AuthError('Permission denied');
        }

        instrument.status = 'pending';
        instrument.statusHistory = instrument.statusHistory || [];
        instrument.statusHistory.push({
            status: 'pending',
            changedBy: userId,
            date: new Date(),
            note: 'Submitted for review'
        });

        await instrument.save();
        revalidatePath(`/instruments/${id}`);
        return { success: true };
    }
);

export const approveInstrument = createSafeAction(
    z.string(),
    async (id, userId, role, correlationId) => {
        await dbConnect();
        const instrument = await Instrument.findById(id);
        if (!instrument) throw new NotFoundError('Instrument not found');

        instrument.status = 'published';
        instrument.statusHistory = instrument.statusHistory || [];
        instrument.statusHistory.push({
            status: 'published',
            changedBy: userId,
            date: new Date(),
            note: 'Approved for catalog'
        });

        await instrument.save();

        // Gamification Trigger
        try {
            const { checkAndAwardBadge } = await import('@/actions/gamification');
            await checkAndAwardBadge(instrument.createdBy.toString(), 'CONTRIBUTION');
        } catch (e) {
            await logEvent({
                nivel: 'WARN',
                origen: 'gamification',
                accion: 'badge_award_failed',
                mensaje: `Fallo al otorgar badge de contribución a ${instrument.createdBy.toString()}`,
                correlacion_id: correlationId,
                detalles: { error: e instanceof Error ? e.message : String(e) }
            });
        }

        revalidatePath(`/instruments/${id}`);
        revalidatePath('/instruments');
        return { success: true };
    },
    { allowedRoles: ['admin', 'editor'] }
);

export const rejectInstrument = createSafeAction(
    z.object({
        id: z.string(),
        reason: z.string()
    }),
    async ({ id, reason }, userId) => {
        await dbConnect();
        const instrument = await Instrument.findById(id);
        if (!instrument) throw new NotFoundError('Instrument not found');

        instrument.status = 'rejected';
        instrument.statusHistory = instrument.statusHistory || [];
        instrument.statusHistory.push({
            status: 'rejected',
            changedBy: userId,
            date: new Date(),
            note: reason
        });

        await instrument.save();
        revalidatePath(`/instruments/${id}`);
        return { success: true };
    },
    { allowedRoles: ['admin', 'editor'] }
);

export const getPendingInstruments = createSafeAction(
    z.any().optional(),
    async () => {
        await dbConnect();
        const pending = await Instrument.find({ status: 'pending' })
            .populate('createdBy', 'name email image')
            .sort({ updatedAt: -1 })
            .lean();

        return sanitize(pending);
    },
    { allowedRoles: ['admin', 'editor'] }
);
