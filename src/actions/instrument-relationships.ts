'use server';

import dbConnect from '@/lib/db';
import InstrumentArtist from '@/models/InstrumentArtist';
import InstrumentAlbum from '@/models/InstrumentAlbum';
import CatalogMetadata from '@/models/CatalogMetadata';
import MusicAlbum from '@/models/MusicAlbum';
import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';
import { syncInstrumentToArtist, syncInstrumentToAlbum, syncAlbumToArtist } from '@/lib/sync/bidirectional';

/**
 * Add an artist relationship to an instrument
 */
export async function addArtistRelation(instrumentId: string, artistKey: string, details?: { yearsUsed?: string, notes?: string }) {
    try {
        const session = await auth();
        if (!session?.user) throw new Error('Unauthorized');

        await dbConnect();

        // Find the artist metadata
        const artist = await CatalogMetadata.findOne({ type: 'artist', key: artistKey });
        if (!artist) throw new Error('Artist not found in metadata');

        // Create or update relation
        await InstrumentArtist.findOneAndUpdate(
            { instrumentId, artistId: artist._id },
            {
                ...details,
                createdBy: session.user.id,
                isVerified: (session.user as any).role === 'admin'
            },
            { upsert: true, new: true }
        );

        // Bidirectional Sync (Phase 5)
        await syncInstrumentToArtist(instrumentId, artist._id.toString(), 'add');

        revalidatePath(`/instruments/${instrumentId}`);
        revalidatePath(`/instruments/${instrumentId}/edit`);
        return { success: true };
    } catch (error: any) {
        console.error('Error adding artist relation:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Remove an artist relationship
 */
export async function removeArtistRelation(relationId: string, instrumentId: string) {
    try {
        const session = await auth();
        if (!session?.user) throw new Error('Unauthorized');

        await dbConnect();

        // Get relation before deleting (for sync)
        const relation = await InstrumentArtist.findById(relationId);
        const artistId = relation?.artistId?.toString();

        await InstrumentArtist.findByIdAndDelete(relationId);

        // Bidirectional Sync (Phase 5)
        if (artistId) {
            await syncInstrumentToArtist(instrumentId, artistId, 'remove');
        }

        revalidatePath(`/instruments/${instrumentId}`);
        revalidatePath(`/instruments/${instrumentId}/edit`);
        return { success: true };
    } catch (error: any) {
        console.error('Error removing artist relation:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Add an album relationship to an instrument
 */
export async function addAlbumRelation(instrumentId: string, albumId: string, details?: { notes?: string }) {
    try {
        const session = await auth();
        if (!session?.user) throw new Error('Unauthorized');

        await dbConnect();

        // 1. Fetch album to check for Master/Version status and Artist
        const album = await MusicAlbum.findById(albumId);
        if (!album) throw new Error('Album not found');

        // 2. Determine target album (Master inheritance)
        const targetAlbumId = album.parentId || (album.isMaster ? album._id : album._id);
        // Note: If it's a version, we link to parent. If it's standalone or master, link to itself.

        // 3. Create or update album relation
        await InstrumentAlbum.findOneAndUpdate(
            { instrumentId, albumId: targetAlbumId },
            {
                ...details,
                createdBy: session.user.id,
                isVerified: (session.user as any).role === 'admin'
            },
            { upsert: true, new: true }
        );

        // 4. Bidirectional Sync (Phase 5)
        await syncInstrumentToAlbum(instrumentId, targetAlbumId.toString(), 'add');

        // 5. Sync album to artist metadata
        const artistName = album.artist;
        const syncResult = await syncAlbumToArtist(targetAlbumId.toString(), artistName);

        // 6. Relationship Propagation: Link instrument to album artist (if artist metadata exists)
        if (syncResult.success && syncResult.artistId) {
            await InstrumentArtist.findOneAndUpdate(
                { instrumentId, artistId: syncResult.artistId },
                {
                    notes: `Automated from album: ${album.title}`,
                    createdBy: session.user.id,
                    isVerified: (session.user as any).role === 'admin'
                },
                { upsert: true }
            );

            // Sync instrument to artist as well
            await syncInstrumentToArtist(instrumentId, syncResult.artistId, 'add');
        }

        revalidatePath(`/instruments/${instrumentId}`);
        revalidatePath(`/instruments/${instrumentId}/edit`);
        return { success: true };
    } catch (error: any) {
        console.error('Error adding album relation:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Remove an album relationship
 */
export async function removeAlbumRelation(relationId: string, instrumentId: string) {
    try {
        const session = await auth();
        if (!session?.user) throw new Error('Unauthorized');

        await dbConnect();

        // Get relation before deleting (for sync)
        const relation = await InstrumentAlbum.findById(relationId);
        const albumId = relation?.albumId?.toString();

        await InstrumentAlbum.findByIdAndDelete(relationId);

        // Bidirectional Sync (Phase 5)
        if (albumId) {
            await syncInstrumentToAlbum(instrumentId, albumId, 'remove');
        }

        revalidatePath(`/instruments/${instrumentId}`);
        return { success: true };
    } catch (error: any) {
        console.error('Error removing album relation:', error);
        return { success: false, error: error.message };
    }
}
