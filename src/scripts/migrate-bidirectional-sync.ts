/**
 * Migration Script: Bidirectional Sync (Phase 5)
 * 
 * Populates reverse links for existing relationships:
 * - CatalogMetadata.instruments (for artists)
 * - MusicAlbum.instruments
 * - MusicAlbum.artistRefs
 * 
 * Run this once after deploying Phase 5 schema changes.
 * 
 * Usage: npx tsx src/scripts/migrate-bidirectional-sync.ts
 */

import dbConnect from '@/lib/db';
import InstrumentArtist from '@/models/InstrumentArtist';
import InstrumentAlbum from '@/models/InstrumentAlbum';
import CatalogMetadata from '@/models/CatalogMetadata';
import MusicAlbum from '@/models/MusicAlbum';

async function migrateBidirectionalSync() {
    console.log('🚀 Starting bidirectional sync migration...\n');

    try {
        await dbConnect();

        // Step 1: Populate CatalogMetadata.instruments (artists only)
        console.log('📊 Step 1: Populating artist → instrument links...');
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

        let artistsUpdated = 0;
        for (const [artistId, instrumentIds] of artistInstrumentMap.entries()) {
            await CatalogMetadata.findByIdAndUpdate(
                artistId,
                { $set: { instruments: Array.from(instrumentIds) } },
                { new: true }
            );
            artistsUpdated++;
        }
        console.log(`✅ Updated ${artistsUpdated} artists with ${artistRelations.length} instrument links\n`);

        // Step 2: Populate MusicAlbum.instruments
        console.log('📊 Step 2: Populating album → instrument links...');
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

        let albumsUpdated = 0;
        for (const [albumId, instrumentIds] of albumInstrumentMap.entries()) {
            await MusicAlbum.findByIdAndUpdate(
                albumId,
                { $set: { instruments: Array.from(instrumentIds) } },
                { new: true }
            );
            albumsUpdated++;
        }
        console.log(`✅ Updated ${albumsUpdated} albums with ${albumRelations.length} instrument links\n`);

        // Step 3: Populate MusicAlbum.artistRefs
        console.log('📊 Step 3: Populating album → artist metadata links...');
        const albums = await MusicAlbum.find({}).lean();

        let artistRefsUpdated = 0;
        for (const album of albums) {
            if (!album.artist) continue;

            // Find artist metadata by name (case-insensitive)
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
                artistRefsUpdated++;
            }
        }
        console.log(`✅ Updated ${artistRefsUpdated} albums with artist metadata links\n`);

        // Summary
        console.log('🎉 Migration complete!');
        console.log(`   - ${artistsUpdated} artists updated`);
        console.log(`   - ${albumsUpdated} albums updated with instrument links`);
        console.log(`   - ${artistRefsUpdated} albums updated with artist metadata links`);

    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }

    process.exit(0);
}

// Run migration
migrateBidirectionalSync();
