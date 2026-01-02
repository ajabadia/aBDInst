'use server';

import dbConnect from '@/lib/db';
import UserCollection from '@/models/UserCollection';
import Instrument from '@/models/Instrument';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';
import { logActivity } from './social';

export async function getUserCollection() {
    try {
        const session = await auth();
        if (!session?.user) return [];

        await dbConnect();

        // Force model registration (fix for schema not registered error)
        await Instrument.init();

        const collection = await UserCollection.find({
            userId: (session.user as any).id,
            deletedAt: null
        })
            .populate('instrumentId')
            .sort({ createdAt: -1 });

        return JSON.parse(JSON.stringify(collection));
    } catch (error) {
        console.error('Get Collection Error:', error);
        return [];
    }
}

export async function addToCollection(instrumentId: string) {
    try {
        const session = await auth();
        if (!session?.user) throw new Error('Unauthorized');

        await dbConnect();

        // Check if already in collection? (Optional: allow duplicates)

        const newItem = await UserCollection.create({
            userId: (session.user as any).id,
            instrumentId: instrumentId,
            status: 'active',
            acquisition: { date: new Date() } // Default to now
        });



        // ... existing imports

        // ... inside addToCollection
        // ...
        revalidatePath('/dashboard');

        // Log activity
        const instrument = await Instrument.findById(instrumentId).select('brand model');
        if (instrument) {
            await logActivity('add_collection', {
                instrumentId,
                instrumentName: `${instrument.brand} ${instrument.model}`
            });
        }

        return { success: true, id: newItem._id.toString() };
    } catch (error: any) {
        console.error('Add to Collection Error:', error);
        return { success: false, error: error.message };
    }
}

export async function getCollectionItemById(id: string) {
    try {
        const session = await auth();
        if (!session?.user) return null;

        await dbConnect();

        const item = await UserCollection.findOne({
            _id: id,
            userId: (session.user as any).id
        }).populate('instrumentId');

        if (!item) return null;

        const obj = item.toObject();

        // Deep serialize to handle all nested _id (like in specs, documents)
        const serialized = JSON.parse(JSON.stringify(obj));

        return {
            ...serialized,
            // Ensure dates are strings if stringify didn't handle it the way we want (it usually does ISO)
            // But we specifically need acquisition.date formatted for input if needed, or            ...serialized,
            // Ensure dates are strings if stringify didn't handle it the way we want
            acquisition: {
                ...serialized.acquisition,
                date: serialized.acquisition?.date ? serialized.acquisition.date.split('T')[0] : ''
            },
            // Fallback for missing populated instrument (e.g. if deleted)
            instrumentId: serialized.instrumentId || { brand: 'Unknown', model: 'Instrument', type: 'Deleted', genericImages: [] }
        };

    } catch (error) {
        console.error('Get Collection Item Error:', error);
        return null;
    }
}

export async function updateCollectionItem(id: string, formData: FormData) {
    try {
        const session = await auth();
        if (!session?.user) throw new Error('Unauthorized');

        await dbConnect();

        const data: any = {
            status: formData.get('status'),
            condition: formData.get('condition'),
            serialNumber: formData.get('serialNumber'),
            acquisition: {
                date: formData.get('acquisition.date') ? new Date(formData.get('acquisition.date') as string) : undefined,
                price: Number(formData.get('acquisition.price')) || undefined,
                currency: formData.get('acquisition.currency'),
                seller: formData.get('acquisition.seller'),
                source: formData.get('acquisition.source'),
            },
            customNotes: formData.get('customNotes'),
            location: formData.get('location'),
        };

        const marketVal = formData.get('marketValue.current');
        const updateOps: any = { $set: data };

        if (marketVal) {
            const val = Number(marketVal);
            if (!isNaN(val)) {
                updateOps.$set['marketValue.current'] = val;
                updateOps.$set['marketValue.lastUpdated'] = new Date();
                updateOps.$push = {
                    'marketValue.history': {
                        date: new Date(),
                        value: val
                    }
                };
            }
        }

        const updated = await UserCollection.findOneAndUpdate(
            { _id: id, userId: (session.user as any).id },
            updateOps,
            { new: true }
        );

        if (!updated) throw new Error('Item not found or unauthorized');

        revalidatePath('/dashboard');
        revalidatePath(`/dashboard/collection/${id}`);
        return { success: true };
    } catch (error: any) {
        console.error('Update Collection Item Error:', error);
        return { success: false, error: error.message };
    }
}

export async function addMaintenanceRecord(collectionId: string, formData: FormData) {
    try {
        const session = await auth();
        if (!session?.user) throw new Error('Unauthorized');

        await dbConnect();

        const newRecord = {
            date: new Date(formData.get('date') as string),
            type: formData.get('type') as string,
            description: formData.get('description') as string,
            cost: Number(formData.get('cost')) || 0,
            technician: formData.get('technician') as string,
            documents: [] // Handle documents later if needed
        };

        const updated = await UserCollection.findOneAndUpdate(
            { _id: collectionId, userId: (session.user as any).id },
            { $push: { maintenanceHistory: newRecord } },
            { new: true }
        );

        if (!updated) throw new Error('Item not found or unauthorized');

        revalidatePath(`/dashboard/collection/${collectionId}`);
        return { success: true };
    } catch (error: any) {
        console.error('Add Maintenance Record Error:', error);
        return { success: false, error: error.message };
    }
}

export async function deleteCollectionItem(id: string) {
    try {
        const session = await auth();
        if (!session?.user) throw new Error('Unauthorized');

        await dbConnect();

        // Soft delete
        await UserCollection.findOneAndUpdate(
            { _id: id, userId: (session.user as any).id },
            { deletedAt: new Date(), status: 'archived' }
        );

        revalidatePath('/dashboard');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function restoreCollectionItem(id: string) {
    try {
        const session = await auth();
        if (!session?.user) throw new Error('Unauthorized');

        await dbConnect();

        await UserCollection.findOneAndUpdate(
            { _id: id, userId: (session.user as any).id },
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

        revalidatePath('/dashboard');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function toggleLoan(collectionId: string, formData: FormData) {
    try {
        const session = await auth();
        if (!session?.user?.id) throw new Error('No autorizado');

        await dbConnect();

        const action = formData.get('action'); // 'lend' or 'return'
        const item = await UserCollection.findOne({
            _id: collectionId,
            userId: session.user.id
        });

        if (!item) {
            return { success: false, error: 'Item not found' };
        }

        if (action === 'lend') {
            // Start loan
            const loanee = formData.get('loanee') as string;
            const expectedReturn = formData.get('expectedReturn') as string;
            const notes = formData.get('notes') as string;

            item.loan = {
                active: true,
                loanee,
                date: new Date(),
                expectedReturn: expectedReturn ? new Date(expectedReturn) : undefined,
                notes
            };

            // Add event
            item.events.push({
                date: new Date(),
                type: 'status_change',
                title: `Prestado a ${loanee}`,
                description: notes || `Instrumento prestado a ${loanee}`
            });
        } else if (action === 'return') {
            // End loan
            if (item.loan?.loanee) {
                item.events.push({
                    date: new Date(),
                    type: 'status_change',
                    title: `Devuelto por ${item.loan.loanee}`,
                    description: 'Instrumento devuelto'
                });
            }

            item.loan = {
                active: false,
                loanee: undefined,
                date: undefined,
                expectedReturn: undefined,
                notes: undefined
            };
        }

        await item.save();
        revalidatePath(`/dashboard/collection/${collectionId}`);
        return { success: true };
    } catch (error: any) {
        console.error('Toggle loan error:', error);
        return { success: false, error: error.message };
    }
}
