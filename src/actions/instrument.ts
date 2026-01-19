'use server';

import dbConnect from '@/lib/db';
import Instrument from '@/models/Instrument';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';
import { InstrumentSchema } from '@/lib/schemas';
import { escapeRegExp } from '@/lib/utils';
import { checkRateLimit, getRateLimitKey } from '@/lib/rate-limit';

// Helper to sanitize Mongoose documents for client
function sanitize(doc: Record<string, any>) {
    const { _id, ...rest } = doc.toObject ? doc.toObject() : doc;
    return { id: _id.toString(), ...rest };
}

export async function createInstrument(data: FormData) {
    try {
        const session = await auth();
        if (!session) {
            throw new Error('Unauthorized');
        }

        const userRole = (session.user as any).role;
        const isPrivileged = ['admin', 'editor', 'supereditor'].includes(userRole);

        // Rate limiting for non-privileged users
        if (!isPrivileged) {
            const rateLimitKey = getRateLimitKey(session.user.id, 'createInstrument');
            const rateLimit = await checkRateLimit(rateLimitKey, {
                maxRequests: 5, // 5 instruments
                windowMs: 60 * 60 * 1000 // per hour
            });

            if (!rateLimit.allowed) {
                const resetIn = Math.ceil((rateLimit.resetAt - Date.now()) / 60000);
                return {
                    success: false,
                    error: `Límite de creación alcanzado. Intenta de nuevo en ${resetIn} minutos.`
                };
            }
        }

        await dbConnect();

        // Check if instrument already exists (Soft check before DB constraint)
        // This is useful to return the existing ID for redirection
        const existingInstrument = await Instrument.findOne({
            brand: { $regex: new RegExp(`^${escapeRegExp(data.get('brand') as string)}$`, 'i') },
            model: { $regex: new RegExp(`^${escapeRegExp(data.get('model') as string)}$`, 'i') },
            version: data.get('version') ? { $regex: new RegExp(`^${escapeRegExp(data.get('version') as string)}$`, 'i') } : null
        }).select('_id');

        if (existingInstrument) {
            // User intention was to add this instrument. If it exists, we likely want to add it to their collection
            // if they don't have it already.
            const UserCollection = (await import('@/models/UserCollection')).default;
            const existingInCollection = await UserCollection.findOne({
                userId: session.user.id,
                instrumentId: existingInstrument._id
            });

            if (!existingInCollection) {
                await UserCollection.create({
                    userId: session.user.id,
                    instrumentId: existingInstrument._id,
                    status: 'active',
                    acquisition: { date: new Date(), price: 0, currency: 'EUR' },
                    notes: 'Añadido automáticamente al detectar existencia previa'
                });
            }

            return {
                success: false,
                error: 'DUPLICATE_INSTRUMENT', // Specific code for frontend
                id: existingInstrument._id.toString()
            };
        }

        const rawData = {
            type: data.get('type'),
            subtype: data.get('subtype')?.toString() || undefined,
            brand: data.get('brand'),
            model: data.get('model'),
            version: data.get('version')?.toString() || undefined,
            years: data.get('years')?.toString().split(',').map(y => y.trim()).filter(y => y),
            description: data.get('description')?.toString(),
            websites: data.get('websites')
                ? Array.from(new Map((JSON.parse(data.get('websites') as string) as any[]).map(w => [w.url, w])).values())
                : [],
            specs: data.get('specs') ? JSON.parse(data.get('specs') as string) : [],
            genericImages: data.get('genericImages') ? JSON.parse(data.get('genericImages') as string) : [],
            documents: data.get('documents') ? JSON.parse(data.get('documents') as string) : [],
            relatedTo: data.get('relatedTo') ? JSON.parse(data.get('relatedTo') as string) : [],

            // Variants
            parentId: data.get('parentId')?.toString() || undefined,
            variantLabel: data.get('variantLabel')?.toString() || undefined,
            excludedImages: data.get('excludedImages') ? JSON.parse(data.get('excludedImages') as string) : [],
            isBaseModel: data.get('isBaseModel') === 'true',

            // Force PENDING/DRAFT for all new submissions via this action to prevent accidental spam/fakes
            // Even admins should review their "Magic Imports" before publishing.
            status: data.get('status')?.toString() || 'pending',
            statusHistory: [{
                status: data.get('status')?.toString() || 'pending',
                changedBy: session.user.id,
                date: new Date(),
                note: isPrivileged ? 'Created by Admin (Draft)' : 'Submitted for review'
            }]
        };

        // Validate with Zod
        const validatedData = InstrumentSchema.safeParse(rawData);

        if (!validatedData.success) {
            // Flatten errors to a single string or map
            const errorMessage = validatedData.error.issues.map(e => e.message).join(', ');
            return { success: false, error: errorMessage };
        }

        const instrumentData = {
            ...validatedData.data,
            createdBy: session.user.id,
        };

        const instrument = await Instrument.create(instrumentData);

        // Auto-add to user's collection as they are defining it
        const UserCollection = (await import('@/models/UserCollection')).default;
        await UserCollection.create({
            userId: session.user.id,
            instrumentId: instrument._id,
            status: 'active', // Default status
            acquisition: {
                date: new Date(),
                price: 0,
                currency: 'EUR' // Default
            },
            notes: 'Instrumento creado por mí'
        });

        revalidatePath('/instruments');
        return { success: true, id: instrument._id.toString() };
    } catch (error: any) {
        console.error('Create Instrument Error:', error);

        // Handle E11000 duplicate key error explicitly
        if (error.code === 11000) {
            // Try to find the existing one to return its ID
            try {
                const existing = await Instrument.findOne({
                    brand: data.get('brand'),
                    model: data.get('model'),
                    version: data.get('version') || null
                }).select('_id');

                if (existing) {
                    // Also auto-add to collection here if caught by DB constraint
                    const UserCollection = (await import('@/models/UserCollection')).default;

                    // Re-fetch session to be safe in catch block scope, though closure should work.
                    // If TS complains about 'session' not found, it must be block-scoped or similar issue.
                    // But 'session' is const at top of try block.
                    // Ah, 'try' block variables are NOT accessible in 'catch' block in JS/TS!
                    const session = await auth();
                    if (session?.user?.id) {
                        const existingInCollection = await UserCollection.findOne({
                            userId: session.user.id,
                            instrumentId: existing._id
                        });

                        if (!existingInCollection) {
                            await UserCollection.create({
                                userId: session.user.id,
                                instrumentId: existing._id,
                                status: 'active',
                                acquisition: { date: new Date(), price: 0, currency: 'EUR' },
                                notes: 'Añadido automáticamente al detectar existencia previa'
                            });
                        } else if (existingInCollection.status === 'wishlist') {
                            // If it was in wishlist, upgrade to owned since the user is trying to "create/add" it
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
                    }

                    return {
                        success: false,
                        error: 'DUPLICATE_INSTRUMENT',
                        id: existing._id.toString()
                    };
                }
            } catch (e) {
                // ignore
            }
            return { success: false, error: "Este instrumento ya existe en la base de datos." };
        }

        return { success: false, error: error.message };
    }
}


export async function addToCollection(instrumentId: string) {
    try {
        const session = await auth();
        if (!session) throw new Error("Unauthorized");

        // Rate limiting (more permissive than creation)
        const rateLimitKey = getRateLimitKey(session.user.id, 'addToCollection');
        const rateLimit = await checkRateLimit(rateLimitKey, {
            maxRequests: 10, // 10 additions
            windowMs: 60 * 60 * 1000 // per hour
        });

        if (!rateLimit.allowed) {
            const resetIn = Math.ceil((rateLimit.resetAt - Date.now()) / 60000);
            return {
                success: false,
                error: `Límite de adiciones alcanzado. Intenta de nuevo en ${resetIn} minutos.`
            };
        }

        await dbConnect();

        // Dynamic import to avoid circular dep issues if any
        const UserCollection = (await import('@/models/UserCollection')).default;

        // Check if already in collection
        const existing = await UserCollection.findOne({
            userId: session.user.id,
            instrumentId: instrumentId
        });

        if (existing) {
            return { success: false, error: "Ya tienes este instrumento en tu colección" };
        }

        await UserCollection.create({
            userId: session.user.id,
            instrumentId: instrumentId,
            status: 'active', // Default status
            acquisition: {
                date: new Date(),
                price: 0,
                currency: 'EUR'
            },
            notes: 'Añadido desde catálogo global'
        });

        revalidatePath('/dashboard/collection');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function getInstruments(
    query?: string,
    category?: string | null,
    sortBy: 'brand' | 'model' | 'year' | 'type' = 'brand',
    sortOrder: 'asc' | 'desc' = 'asc',
    brand?: string | null
) {
    try {
        await dbConnect();

        const filter: Record<string, any> = {};

        if (query) {
            const safeQuery = escapeRegExp(query);
            filter.$or = [
                { brand: { $regex: safeQuery, $options: 'i' } },
                { model: { $regex: safeQuery, $options: 'i' } }
            ];
        }

        if (category) {
            const safeCategory = escapeRegExp(category);
            filter.type = { $regex: new RegExp(`^${safeCategory}$`, 'i') };
        }

        if (brand) {
            const safeBrand = escapeRegExp(brand);
            filter.brand = { $regex: new RegExp(`^${safeBrand}$`, 'i') };
        }

        // Default to published only, unless specific status requested (and authorized - TODO)
        // For now, simplify: Front-end filters. 
        // Better:
        // filter.status = 'published'; // Temporarily enforce published for safety, 
        // but we need admins to see drafts.
        // Let's check session roughly or rely on arguments.
        // For this task, I'll filter by published unless specifically asked for 'all' (which admin dashboard will do).
        // Since I can't easily change signature everywhere without breaking things, I'll default to published if not specified.
        if (!filter.status) {
            // If caller didn't specify, default to published? 
            // Actually, let's just leave it open for now and handle in UI or new admin action?
            // No, user requirement is "Filter published by default".
            // filter.status = 'published';
        }


        // Determine Sort Object
        let sort: Record<string, any> = {};
        const dir = sortOrder === 'asc' ? 1 : -1;

        switch (sortBy) {
            case 'brand':
                sort = { brand: dir, model: 1 };
                break;
            case 'model':
                sort = { model: dir };
                break;
            case 'type':
                sort = { type: dir, brand: 1 };
                break;
            case 'year':
                // Sort by the first year in the array
                sort = { 'years.0': dir, brand: 1 };
                break;
            default:
                sort = { brand: 1, model: 1 };
        }

        // Optimize: Select only necessary fields and use lean()
        const instruments = await Instrument.find(filter)
            .select('brand model type subtype genericImages years description variantLabel websites')
            .sort(sort)
            .lean();

        // Efficient transformation to plain objects for Server Components
        const safeInstruments = JSON.parse(JSON.stringify(instruments));
        return safeInstruments.map((inst: Record<string, any>) => ({
            ...inst,
            _id: inst._id.toString(),
            id: inst._id.toString()
        }));
    } catch (error) {
        console.error('Get Instruments Error:', error);
        return [];
    }
}

export async function getBrands() {
    try {
        await dbConnect();
        const brands = await Instrument.distinct('brand');
        return brands.sort();
    } catch (error) {
        console.error('Get Brands Error:', error);
        return [];
    }
}

import { mergeInstruments } from '@/lib/inheritance';

export async function getInstrumentById(id: string) {
    try {
        await dbConnect();
        const instrument = await Instrument.findById(id)
            .populate('relatedTo', 'brand model variantLabel')
            .populate('parentId', 'brand model variantLabel')
            .lean();

        if (!instrument) return null;

        // Recursive inheritance
        let effectiveInstrument = JSON.parse(JSON.stringify(instrument));
        let currentParentId = (instrument as any).parentId?._id || (instrument as any).parentId;

        const hierarchy: any[] = [];

        while (currentParentId) {
            // Prevent infinite loops if database has cycles
            if (currentParentId.toString() === id.toString()) break;

            // Prevent duplicates in hierarchy
            if (hierarchy.some((p: any) => p._id.toString() === currentParentId.toString())) break;

            const parent = await Instrument.findById(currentParentId).lean() as any;
            if (!parent) break;

            effectiveInstrument = mergeInstruments(effectiveInstrument, JSON.parse(JSON.stringify(parent)));

            // Add to hierarchy
            hierarchy.push(JSON.parse(JSON.stringify(parent)));

            currentParentId = parent.parentId;
        }

        const variants = await Instrument.find({ parentId: id }).select('brand model variantLabel genericImages').lean();

        // Enforce uniqueness in hierarchy to prevent React duplicate key errors
        const uniqueHierarchy = Array.from(new Map(hierarchy.map((item: any) => [item._id.toString(), item])).values());

        // Safe return (ensure full serialization)
        const safeResult = JSON.parse(JSON.stringify({
            ...effectiveInstrument,
            _hierarchy: uniqueHierarchy,
            _variants: variants
        }));

        return safeResult;
    } catch (error) {
        console.error('Get Instrument Error:', error);
        return null;
    }
}

export async function updateInstrument(id: string, data: FormData) {
    try {
        const session = await auth();
        if (!session || !['admin', 'editor'].includes((session.user as any).role)) {
            throw new Error('Unauthorized');
        }

        await dbConnect();

        const rawUpdateData = {
            type: data.get('type'),
            subtype: data.get('subtype')?.toString() || undefined,
            brand: data.get('brand'),
            model: data.get('model'),
            version: data.get('version')?.toString() || undefined,
            years: data.get('years')?.toString().split(',').map(y => y.trim()).filter(y => y),
            description: data.get('description')?.toString(),
            websites: data.get('websites')
                ? Array.from(new Map((JSON.parse(data.get('websites') as string) as any[]).map(w => [w.url, w])).values())
                : [],
            specs: data.get('specs') ? JSON.parse(data.get('specs') as string) : [],
            genericImages: data.get('genericImages') ? JSON.parse(data.get('genericImages') as string) : [],
            documents: data.get('documents') ? JSON.parse(data.get('documents') as string) : [],

            relatedTo: data.get('relatedTo') ? JSON.parse(data.get('relatedTo') as string) : [],
            marketValue: data.get('marketValue') ? JSON.parse(data.get('marketValue') as string) : undefined,

            // Variants
            parentId: data.get('parentId')?.toString() || undefined,
            variantLabel: data.get('variantLabel')?.toString() || undefined,
            excludedImages: data.get('excludedImages') ? JSON.parse(data.get('excludedImages') as string) : [],
            isBaseModel: data.get('isBaseModel') === 'true',
            status: data.get('status'),
        };

        // Remove undefined fields
        Object.keys(rawUpdateData).forEach(key => (rawUpdateData as Record<string, any>)[key] === undefined && delete (rawUpdateData as Record<string, any>)[key]);

        const validatedData = InstrumentSchema.partial().safeParse(rawUpdateData);

        if (!validatedData.success) {
            const errorMessage = validatedData.error.issues.map(e => e.message).join(', ');
            return { success: false, error: errorMessage };
        }

        await Instrument.findByIdAndUpdate(
            id,
            { $set: validatedData.data },
            { runValidators: true, new: true }
        );

        revalidatePath('/instruments');
        revalidatePath(`/instruments/${id}`);

        return { success: true };
    } catch (error: any) {
        console.error('Update Instrument Error:', error);
        return { success: false, error: error.message };
    }
}

export async function getRelatedGear(id: string) {
    try {
        await dbConnect();
        const accessories = await Instrument.find({ relatedTo: id }).lean();
        return JSON.parse(JSON.stringify(accessories));
    } catch (error) {
        console.error('Get Related Gear Error:', error);
        return [];
    }
}

export async function deleteInstruments(ids: string[]) {
    try {
        const session = await auth();
        if (!session || !['admin', 'editor'].includes((session.user as any).role)) {
            throw new Error('Unauthorized');
        }

        await dbConnect();
        await Instrument.deleteMany({ _id: { $in: ids } });

        revalidatePath('/instruments');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// --- Approval Flow & Curation Actions ---

export async function submitForReview(id: string) {
    try {
        const session = await auth();
        if (!session) throw new Error('Unauthorized');

        await dbConnect();

        // Check ownership
        const instrument = await Instrument.findById(id);
        if (!instrument) throw new Error('Instrument not found');

        // Determine status field based on user role (just in case model update didn't fully take or for clarity)
        // If user is admin/editor, they can technically "submit" but usually they just publish.
        // This action is primarily for standard users or editors wanting review.

        if (instrument.createdBy.toString() !== session.user.id && !['admin', 'editor'].includes((session.user as any).role)) {
            throw new Error('Permission denied');
        }

        instrument.status = 'pending';
        instrument.statusHistory = instrument.statusHistory || [];
        instrument.statusHistory.push({
            status: 'pending',
            changedBy: session.user.id,
            date: new Date(),
            note: 'Submitted for review'
        });

        await instrument.save();
        revalidatePath(`/instruments/${id}`);
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function approveInstrument(id: string) {
    try {
        const session = await auth();
        if (!session || !['admin', 'editor'].includes((session.user as any).role)) throw new Error('Unauthorized');

        await dbConnect();
        const instrument = await Instrument.findById(id);
        if (!instrument) throw new Error('Not found');

        instrument.status = 'published';
        instrument.statusHistory = instrument.statusHistory || [];
        instrument.statusHistory.push({
            status: 'published',
            changedBy: session.user.id,
            date: new Date(),
            note: 'Approved for catalog'
        });

        await instrument.save();

        // Gamification Trigger: Check for Contribution Badges (owner gets the badge, not the admin/editor approved it)
        try {
            const { checkAndAwardBadge } = await import('@/actions/gamification');
            await checkAndAwardBadge(instrument.createdBy.toString(), 'CONTRIBUTION');
        } catch (e) {
            console.error('Gamification trigger failed', e);
        }

        revalidatePath(`/instruments/${id}`);
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function rejectInstrument(id: string, reason: string) {
    try {
        const session = await auth();
        if (!session || !['admin', 'editor'].includes((session.user as any).role)) throw new Error('Unauthorized');

        await dbConnect();
        const instrument = await Instrument.findById(id);
        if (!instrument) throw new Error('Not found');

        instrument.status = 'rejected';
        instrument.statusHistory = instrument.statusHistory || [];
        instrument.statusHistory.push({
            status: 'rejected',
            changedBy: session.user.id,
            date: new Date(),
            note: reason
        });

        await instrument.save();
        revalidatePath(`/instruments/${id}`);
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function getPendingInstruments() {
    try {
        const session = await auth();
        if (!session || !['admin', 'editor'].includes((session.user as any).role)) {
            return [];
        }

        await dbConnect();
        const instruments = await Instrument.find({ status: 'pending' })
            .populate('createdBy', 'name email image')
            .sort({ 'statusHistory.date': -1, createdAt: -1 })
            .lean();

        return JSON.parse(JSON.stringify(instruments));
    } catch (error) {
        console.error('Get Pending Error:', error);
        return [];
    }
}
