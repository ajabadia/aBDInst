/**
 * Bidirectional Synchronization Utilities (Phase 5)
 * 
 * Ensures that relationships between Instruments, Artists, and Albums
 * are automatically maintained in both directions.
 * 
 * Core Principles:
 * - When an instrument is linked to an artist, the artist's `instruments` array is updated
 * - When an instrument is linked to an album, the album's `instruments` array is updated
 * - When an album is created, it's automatically linked to its artist metadata
 * - All operations are idempotent and safe to retry
 */

import dbConnect from '../db';
import CatalogMetadata from '@/models/CatalogMetadata';
import MusicAlbum from '@/models/MusicAlbum';
import Instrument from '@/models/Instrument';

/**
 * Sync instrument to artist metadata (bidirectional)
 * Updates the artist's `instruments` array
 */
export async function syncInstrumentToArtist(
    instrumentId: string,
    artistId: string,
    action: 'add' | 'remove'
): Promise<{ success: boolean; error?: string }> {
    try {
        await dbConnect();

        const artist = await CatalogMetadata.findById(artistId);
        if (!artist || artist.type !== 'artist') {
            return { success: false, error: 'Artist not found or invalid type' };
        }

        if (action === 'add') {
            // Add instrument to artist's instruments array (if not already present)
            if (!artist.instruments?.includes(instrumentId as any)) {
                await CatalogMetadata.findByIdAndUpdate(
                    artistId,
                    { $addToSet: { instruments: instrumentId } },
                    { new: true }
                );
                console.log(`✅ Synced instrument ${instrumentId} → artist ${artist.label}`);
            }
        } else {
            // Remove instrument from artist's instruments array
            await CatalogMetadata.findByIdAndUpdate(
                artistId,
                { $pull: { instruments: instrumentId } },
                { new: true }
            );
            console.log(`✅ Removed instrument ${instrumentId} ← artist ${artist.label}`);
        }

        return { success: true };
    } catch (error: any) {
        console.error('❌ Error syncing instrument to artist:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Sync instrument to album (bidirectional)
 * Updates the album's `instruments` array
 */
export async function syncInstrumentToAlbum(
    instrumentId: string,
    albumId: string,
    action: 'add' | 'remove'
): Promise<{ success: boolean; error?: string }> {
    try {
        await dbConnect();

        const album = await MusicAlbum.findById(albumId);
        if (!album) {
            return { success: false, error: 'Album not found' };
        }

        if (action === 'add') {
            // Add instrument to album's instruments array (if not already present)
            if (!album.instruments?.includes(instrumentId as any)) {
                await MusicAlbum.findByIdAndUpdate(
                    albumId,
                    { $addToSet: { instruments: instrumentId } },
                    { new: true }
                );
                console.log(`✅ Synced instrument ${instrumentId} → album ${album.title}`);
            }
        } else {
            // Remove instrument from album's instruments array
            await MusicAlbum.findByIdAndUpdate(
                albumId,
                { $pull: { instruments: instrumentId } },
                { new: true }
            );
            console.log(`✅ Removed instrument ${instrumentId} ← album ${album.title}`);
        }

        return { success: true };
    } catch (error: any) {
        console.error('❌ Error syncing instrument to album:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Sync album to artist metadata
 * Links album to artist via `artistRefs` array
 */
export async function syncAlbumToArtist(
    albumId: string,
    artistName: string
): Promise<{ success: boolean; artistId?: string; error?: string }> {
    try {
        await dbConnect();

        // Find artist metadata by name (case-insensitive)
        const artist = await CatalogMetadata.findOne({
            type: 'artist',
            label: { $regex: new RegExp(`^${artistName}$`, 'i') }
        });

        if (!artist) {
            console.log(`⚠️ Artist metadata not found for: ${artistName}`);
            return { success: false, error: 'Artist metadata not found' };
        }

        // Add artist to album's artistRefs array (if not already present)
        const album = await MusicAlbum.findById(albumId);
        if (album && !album.artistRefs?.includes(artist._id as any)) {
            await MusicAlbum.findByIdAndUpdate(
                albumId,
                { $addToSet: { artistRefs: artist._id } },
                { new: true }
            );
            console.log(`✅ Synced album ${album.title} → artist ${artist.label}`);
        }

        return { success: true, artistId: artist._id.toString() };
    } catch (error: any) {
        console.error('❌ Error syncing album to artist:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Batch sync all relationships for an instrument
 * Called after enrichment or bulk operations
 */
export async function batchSyncInstrument(
    instrumentId: string,
    artistIds: string[],
    albumIds: string[]
): Promise<{ success: boolean; stats: { artistsSynced: number; albumsSynced: number }; error?: string }> {
    const stats = { artistsSynced: 0, albumsSynced: 0 };

    try {
        // Sync all artists
        for (const artistId of artistIds) {
            const result = await syncInstrumentToArtist(instrumentId, artistId, 'add');
            if (result.success) stats.artistsSynced++;
        }

        // Sync all albums
        for (const albumId of albumIds) {
            const result = await syncInstrumentToAlbum(instrumentId, albumId, 'add');
            if (result.success) stats.albumsSynced++;
        }

        console.log(`✅ Batch sync complete: ${stats.artistsSynced} artists, ${stats.albumsSynced} albums`);
        return { success: true, stats };
    } catch (error: any) {
        console.error('❌ Error in batch sync:', error);
        return { success: false, stats, error: error.message };
    }
}

/**
 * Cleanup orphaned relationships
 * Removes instrument references from artists/albums when relationships are deleted
 */
export async function cleanupOrphanedReferences(instrumentId: string): Promise<void> {
    try {
        await dbConnect();

        // Remove from all artists
        await CatalogMetadata.updateMany(
            { type: 'artist', instruments: instrumentId },
            { $pull: { instruments: instrumentId } }
        );

        // Remove from all albums
        await MusicAlbum.updateMany(
            { instruments: instrumentId },
            { $pull: { instruments: instrumentId } }
        );

        console.log(`✅ Cleaned up orphaned references for instrument ${instrumentId}`);
    } catch (error) {
        console.error('❌ Error cleaning up orphaned references:', error);
    }
}
