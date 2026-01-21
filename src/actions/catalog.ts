import dbConnect from '@/lib/db';
import Instrument from '@/models/Instrument';
import { revalidatePath } from 'next/cache';
import { GetInstrumentsSchema } from '@/lib/schemas';
import { escapeRegExp } from '@/lib/utils';
import CatalogMetadata from '@/models/CatalogMetadata';
import Resource from '@/models/Resource';
import { createSafeAction } from '@/lib/safe-action';
import { z } from 'zod';
import { DatabaseError, NotFoundError } from '@/lib/errors';
import { mergeInstruments } from '@/lib/inheritance';
import InstrumentArtist from '@/models/InstrumentArtist';
import InstrumentAlbum from '@/models/InstrumentAlbum';
import Artist from '@/models/Artist'; // Might be needed for population if not already registered
import Album from '@/models/Album';

// Helper to sanitize Mongoose documents
function sanitize(doc: any) {
    if (!doc) return null;
    return JSON.parse(JSON.stringify(doc));
}

/* --- INSTRUMENTS --- */

export const getInstruments = createSafeAction(
    GetInstrumentsSchema,
    async (params, userId, role, correlationId) => {
        await dbConnect();
        const filter: Record<string, any> = {};

        const { query, category, sortBy, sortOrder, limit, full, brand, minYear, maxYear, artists } = params;

        // Search Query
        if (query) {
            const safeQuery = escapeRegExp(query);
            filter.$or = [
                { brand: { $regex: safeQuery, $options: 'i' } },
                { model: { $regex: safeQuery, $options: 'i' } }
            ];
        }

        // Category Filter
        if (category) filter.type = { $regex: new RegExp(`^${escapeRegExp(category)}$`, 'i') };

        // Brand Filter
        if (brand) filter.brand = { $regex: new RegExp(`^${escapeRegExp(brand)}$`, 'i') };

        // Year Range Filter
        if (minYear || maxYear) {
            filter.years = {};
            if (minYear) filter.years.$gte = String(minYear);
            if (maxYear) filter.years.$lte = String(maxYear);
        }

        // Artist Filter
        if (artists && artists.length > 0) {
            filter.artists = { $in: artists };
        }

        try {
            let queryBuilder = Instrument.find(filter);
            if (!full) queryBuilder = queryBuilder.select('brand model type subtype genericImages years variantLabel websites');
            if (limit) queryBuilder = queryBuilder.limit(limit);

            const instruments = await queryBuilder
                .sort(sortBy === 'artist' ? { 'artists.0': sortOrder === 'asc' ? 1 : -1 } : { [sortBy]: sortOrder === 'asc' ? 1 : -1 })
                .lean();

            return instruments.map((inst: any) => ({
                ...inst,
                _id: inst._id.toString(),
                id: inst._id.toString()
            }));
        } catch (error: any) {
            throw new DatabaseError("Error al obtener instrumentos", error);
        }
    },
    { protected: false, name: 'GET_INSTRUMENTS' }
);

export const getBrands = createSafeAction(
    z.any().optional(),
    async () => {
        await dbConnect();
        try {
            const brands = await Instrument.distinct('brand');
            return brands.sort();
        } catch (error: any) {
            throw new DatabaseError("Error al obtener marcas", error);
        }
    },
    { protected: false, name: 'GET_BRANDS' }
);

export const getMetadataMap = createSafeAction(
    z.any().optional(),
    async () => {
        await dbConnect();
        try {
            const metadata = await CatalogMetadata.find({}).lean();
            const plainMetadata = JSON.parse(JSON.stringify(metadata));

            return plainMetadata.reduce((acc: Record<string, any>, curr: Record<string, any>) => {
                const type = curr.type;
                const key = String(curr.key).toLowerCase().trim();
                if (!acc[type]) acc[type] = {};
                acc[type][key] = curr;
                return acc;
            }, {});
        } catch (error: any) {
            throw new DatabaseError("Error al obtener mapa de metadatos", error);
        }
    },
    { protected: false, name: 'GET_METADATA_MAP' }
);

export const getInstrumentById = createSafeAction(
    z.string(),
    async (id) => {
        await dbConnect();
        try {
            const instrument = await Instrument.findById(id)
                .populate('relatedTo', 'brand model variantLabel')
                .populate('parentId', 'brand model variantLabel')
                .lean();

            if (!instrument) throw new NotFoundError("Instrumento");

            let effectiveInstrument = JSON.parse(JSON.stringify(instrument));
            let currentParentId = (instrument as any).parentId?._id || (instrument as any).parentId;
            const hierarchy: any[] = [];

            while (currentParentId) {
                if (currentParentId.toString() === id.toString()) break;
                if (hierarchy.some((p: any) => p._id.toString() === currentParentId.toString())) break;

                const parent = await Instrument.findById(currentParentId).lean() as any;
                if (!parent) break;

                effectiveInstrument = mergeInstruments(effectiveInstrument, JSON.parse(JSON.stringify(parent)));
                hierarchy.push(JSON.parse(JSON.stringify(parent)));
                currentParentId = parent.parentId;
            }

            const variants = await Instrument.find({ parentId: id }).select('brand model variantLabel genericImages').lean();
            const uniqueHierarchy = Array.from(new Map(hierarchy.map((item: any) => [item._id.toString(), item])).values());

            // Fetch confirmed relationships (InstrumentArtist, InstrumentAlbum)
            const [artistRelations, albumRelations] = await Promise.all([
                InstrumentArtist.find({ instrumentId: id }).populate('artistId').lean(),
                InstrumentAlbum.find({ instrumentId: id }).populate('albumId').lean()
            ]);

            // Map relationships to the same format as internal AI-detected fields
            const confirmedArtists = artistRelations.map((rel: any) => ({
                _id: rel._id.toString(),
                name: (rel.artistId as any)?.label || 'Artista Desconocido',
                key: (rel.artistId as any)?.key || '',
                assetUrl: (rel.artistId as any)?.assetUrl,
                yearsUsed: rel.yearsUsed,
                notes: rel.notes
            }));

            const confirmedAlbums = albumRelations.map((rel: any) => ({
                _id: rel._id.toString(),
                title: (rel.albumId as any)?.title || 'Álbum Desconocido',
                artist: (rel.albumId as any)?.artist || 'Varios',
                year: (rel.albumId as any)?.year,
                coverImage: (rel.albumId as any)?.coverImage,
                notes: rel.notes
            }));

            return {
                ...effectiveInstrument,
                artists: confirmedArtists,
                albums: confirmedAlbums,
                _hierarchy: uniqueHierarchy,
                _variants: JSON.parse(JSON.stringify(variants))
            };
        } catch (error: any) {
            if (error instanceof NotFoundError) throw error;
            throw new DatabaseError("Error al obtener detalles del instrumento", error);
        }
    },
    { protected: false, name: 'GET_INSTRUMENT_BY_ID' }
);

export const getRelatedGear = createSafeAction(
    z.string(),
    async (id) => {
        await dbConnect();
        try {
            const accessories = await Instrument.find({ relatedTo: id }).lean();
            return JSON.parse(JSON.stringify(accessories));
        } catch (error: any) {
            throw new DatabaseError("Error al obtener gear relacionado", error);
        }
    },
    { protected: false, name: 'GET_RELATED_GEAR' }
);

export const getResources = createSafeAction(
    z.record(z.any()).optional(),
    async (filter = {}) => {
        await dbConnect();
        try {
            const resources = await Resource.find(filter).sort({ createdAt: -1 }).lean();
            return JSON.parse(JSON.stringify(resources));
        } catch (error: any) {
            throw new DatabaseError("Error al obtener recursos", error);
        }
    },
    { protected: false, name: 'GET_RESOURCES' }
);
