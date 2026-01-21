/**
 * API Route: Run Bidirectional Sync Migration
 * 
 * Access: http://localhost:3000/api/admin/migrate-bidirectional-sync
 * 
 * This is a safer alternative to running the migration script directly.
 * Requires admin authentication.
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import dbConnect from '@/lib/db';
import InstrumentArtist from '@/models/InstrumentArtist';
import InstrumentAlbum from '@/models/InstrumentAlbum';
import CatalogMetadata from '@/models/CatalogMetadata';
import MusicAlbum from '@/models/MusicAlbum';

export async function POST(req: NextRequest) {
    try {
        // Auth check
        const session = await auth();
        if (!session || (session.user as any).role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        const results = {
            artistsUpdated: 0,
            albumsUpdated: 0,
            artistRefsUpdated: 0,
            errors: [] as string[]
        };

        // Step 1: Populate CatalogMetadata.instruments (artists only)
        const artistRelations = await InstrumentArtist.find({}).lean();

        const artistInstrumentMap = new Map<string, Set<string>>();
        for (const relation of artistRelations) {
            const artistId = relation.artistId.toString();
            const instrumentId = relation.instrumentId.toString();

            if (!artistInstrumentMap.has(artistId)) {
                artistInstrumentMap.set(artistId, new Set());
            }
            artistInstrumentMap.get(artistId)!.add(instrumentId);
        }

        for (const [artistId, instrumentIds] of artistInstrumentMap.entries()) {
            try {
                await CatalogMetadata.findByIdAndUpdate(
                    artistId,
                    { $set: { instruments: Array.from(instrumentIds) } },
                    { new: true }
                );
                results.artistsUpdated++;
            } catch (error: any) {
                results.errors.push(`Artist ${artistId}: ${error.message}`);
            }
        }

        // Step 2: Populate MusicAlbum.instruments
        const albumRelations = await InstrumentAlbum.find({}).lean();

        const albumInstrumentMap = new Map<string, Set<string>>();
        for (const relation of albumRelations) {
            const albumId = relation.albumId.toString();
            const instrumentId = relation.instrumentId.toString();

            if (!albumInstrumentMap.has(albumId)) {
                albumInstrumentMap.set(albumId, new Set());
            }
            albumInstrumentMap.get(albumId)!.add(instrumentId);
        }

        for (const [albumId, instrumentIds] of albumInstrumentMap.entries()) {
            try {
                await MusicAlbum.findByIdAndUpdate(
                    albumId,
                    { $set: { instruments: Array.from(instrumentIds) } },
                    { new: true }
                );
                results.albumsUpdated++;
            } catch (error: any) {
                results.errors.push(`Album ${albumId}: ${error.message}`);
            }
        }

        // Step 3: Populate MusicAlbum.artistRefs
        const albums = await MusicAlbum.find({}).lean();

        for (const album of albums) {
            if (!album.artist) continue;

            try {
                const artist = await CatalogMetadata.findOne({
                    type: 'artist',
                    label: { $regex: new RegExp(`^${album.artist}$`, 'i') }
                });

                if (artist) {
                    await MusicAlbum.findByIdAndUpdate(
                        album._id,
                        { $addToSet: { artistRefs: artist._id } },
                        { new: true }
                    );
                    results.artistRefsUpdated++;
                }
            } catch (error: any) {
                results.errors.push(`Album artistRef ${album._id}: ${error.message}`);
            }
        }

        return NextResponse.json({
            success: true,
            message: 'Migration completed',
            results
        });

    } catch (error: any) {
        console.error('Migration error:', error);
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}
