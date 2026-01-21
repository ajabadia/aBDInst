import dbConnect from '@/lib/db';
import UserCollection from '@/models/UserCollection';
import Instrument from '@/models/Instrument';
import { revalidatePath } from 'next/cache';
import { createSafeAction } from '@/lib/safe-action';
import { z } from 'zod';
import { DatabaseError, NotFoundError, AppError, ValidationError, AuthError } from '@/lib/errors';
import { logEvent } from '@/lib/logger';
import { UserCollectionSchema, MaintenanceRecordSchema, LoanSchema } from '@/lib/schemas';
import { logActivity } from './social';

// Helper to sanitize
function sanitize(doc: any) {
    if (!doc) return null;
    return JSON.parse(JSON.stringify(doc));
}

export const getUserCollection = createSafeAction(
    z.any().optional(),
    async (_, userId) => {
        await dbConnect();
        // Force model registration
        await Instrument.init();

        const collection = await UserCollection.find({
            userId: userId,
            deletedAt: null
        })
            .populate('instrumentId')
            .sort({ createdAt: -1 })
            .lean();

        return sanitize(collection);
    },
    { protected: true }
);

export const addToCollection = createSafeAction(
    z.string(),
    async (instrumentId, userId, role, correlationId) => {
        await dbConnect();

        const newItem = await UserCollection.create({
            userId: userId,
            instrumentId: instrumentId,
            status: 'active',
            acquisition: { date: new Date(), currency: 'EUR' }
        });

        await logEvent({
            nivel: 'INFO',
            origen: 'COLLECTION_ACTION',
            accion: 'ADD_TO_COLLECTION',
            mensaje: `Instrumento ${instrumentId} añadido a la colección del usuario ${userId}`,
            correlacion_id: correlationId,
            detalles: { instrumentId, collectionId: newItem._id.toString() }
        });

        revalidatePath('/dashboard');

        // Log activity (Fire & Forget)
        const instrument = await Instrument.findById(instrumentId).select('brand model');
        if (instrument) {
            logActivity('add_collection', {
                instrumentId,
                instrumentName: `${instrument.brand} ${instrument.model}`
            }).catch(e => console.error('Social log failed', e));
        }

        return { success: true, id: newItem._id.toString() };
    },
    { protected: true }
);

export const getCollectionItemById = createSafeAction(
    z.string(),
    async (id, userId) => {
        await dbConnect();
        const item = await UserCollection.findOne({
            _id: id,
            userId: userId
        }).populate('instrumentId').lean();

        if (!item) throw new NotFoundError('Ítem de colección');

        const serialized = sanitize(item);

        // Format date for UI input if needed
        if (serialized.acquisition?.date) {
            serialized.acquisition.date = serialized.acquisition.date.split('T')[0];
        }

        // Fallback for missing instrument
        if (!serialized.instrumentId) {
            serialized.instrumentId = { brand: 'Incógnito', model: 'Instrumento', type: 'Eliminado', genericImages: [] };
        }

        return serialized;
    },
    { protected: true }
);

export const updateCollectionItem = createSafeAction(
    z.object({
        id: z.string(),
        data: UserCollectionSchema.partial()
    }),
    async ({ id, data }, userId) => {
        await dbConnect();

        const updateOps: Record<string, any> = { $set: data };

        // Handle market value history logic if current value is provided
        if (data.marketValue?.current !== undefined) {
            updateOps.$set['marketValue.lastUpdated'] = new Date();
            updateOps.$push = {
                'marketValue.history': {
                    date: new Date(),
                    value: data.marketValue.current
                }
            };
        }

        const updated = await UserCollection.findOneAndUpdate(
            { _id: id, userId: userId },
            updateOps,
            { new: true }
        ).lean();

        if (!updated) throw new NotFoundError('Ítem');

        revalidatePath('/dashboard');
        revalidatePath(`/dashboard/collection/${id}`);
        return { success: true };
    },
    { protected: true }
);

export const addMaintenanceRecord = createSafeAction(
    z.object({
        collectionId: z.string(),
        record: MaintenanceRecordSchema
    }),
    async ({ collectionId, record }, userId) => {
        await dbConnect();
        const updated = await UserCollection.findOneAndUpdate(
            { _id: collectionId, userId: userId },
            { $push: { maintenanceHistory: record } },
            { new: true }
        );

        if (!updated) throw new NotFoundError('Ítem');

        revalidatePath(`/dashboard/collection/${collectionId}`);
        return { success: true };
    },
    { protected: true }
);

export const deleteCollectionItem = createSafeAction(
    z.string(),
    async (id, userId, role, correlationId) => {
        await dbConnect();
        const result = await UserCollection.findOneAndUpdate(
            { _id: id, userId: userId },
            { deletedAt: new Date(), status: 'archived' }
        );

        if (!result) throw new NotFoundError('Ítem');

        await logEvent({
            nivel: 'INFO',
            origen: 'COLLECTION_ACTION',
            accion: 'DELETE_ITEM',
            mensaje: `Item ${id} eliminado`,
            correlacion_id: correlationId,
            detalles: { userId, collectionId: id }
        });

        revalidatePath('/dashboard');
        return { success: true };
    },
    { protected: true }
);

export const restoreCollectionItem = createSafeAction(
    z.string(),
    async (id, userId) => {
        await dbConnect();
        const result = await UserCollection.findOneAndUpdate(
            { _id: id, userId: userId },
            {
                deletedAt: null,
                status: 'active',
                $push: {
                    events: {
                        type: 'note',
                        date: new Date(),
                        title: 'Restaurado',
                        description: 'Recuperado de la papelera (Undo)'
                    }
                }
            }
        );

        if (!result) throw new NotFoundError('Ítem');

        revalidatePath('/dashboard');
        return { success: true };
    },
    { protected: true }
);

export const toggleLoan = createSafeAction(
    z.object({
        collectionId: z.string(),
        loanData: LoanSchema
    }),
    async ({ collectionId, loanData }, userId, role, correlationId) => {
        await dbConnect();
        const item = await UserCollection.findOne({
            _id: collectionId,
            userId: userId
        });

        if (!item) throw new NotFoundError('Ítem de colección');

        const { action, loanee, expectedReturn, notes } = loanData;

        if (action === 'lend') {
            if (!loanee) throw new ValidationError('El nombre del prestatario es obligatorio para el préstamo');

            item.loan = {
                active: true,
                loanee,
                date: new Date(),
                expectedReturn: expectedReturn ? new Date(expectedReturn) : undefined,
                notes
            };

            item.events.push({
                date: new Date(),
                type: 'status_change',
                title: `Prestado a ${loanee}`,
                description: notes || `Instrumento prestado a ${loanee}`
            });
        } else {
            const previousLoanee = item.loan?.loanee;
            item.events.push({
                date: new Date(),
                type: 'status_change',
                title: previousLoanee ? `Devuelto por ${previousLoanee}` : 'Devuelto',
                description: 'Instrumento devuelto'
            });

            item.loan = {
                active: false,
                loanee: undefined,
                date: undefined,
                expectedReturn: undefined,
                notes: undefined
            };
        }

        await item.save();

        await logEvent({
            nivel: 'INFO',
            origen: 'COLLECTION_ACTION',
            accion: action === 'lend' ? 'LOAN_STARTED' : 'LOAN_RETURNED',
            mensaje: `Préstamo ${action === 'lend' ? 'iniciado' : 'finalizado'} para ${collectionId}`,
            correlacion_id: correlationId,
            detalles: { collectionId, loanee }
        });

        revalidatePath(`/dashboard/collection/${collectionId}`);
        return { success: true };
    },
    { protected: true }
);
