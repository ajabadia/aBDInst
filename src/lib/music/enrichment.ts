/**
 * Music Enrichment Module
 * 
 * Centralizes logic for enriching instruments with musical relationships:
 * - Auto-creates artists in metadata
 * - Searches and caches albums from Discogs
 * - Creates instrument-artist-album relationships
 * 
 * Used by:
 * - AI import wizard
 * - Manual instrument editing
 * - Bulk imports
 */

import dbConnect from '../db';
import CatalogMetadata from '@/models/CatalogMetadata';
import MusicAlbum from '@/models/MusicAlbum';
import InstrumentArtist from '@/models/InstrumentArtist';
import InstrumentAlbum from '@/models/InstrumentAlbum';
import { searchDiscogs, getDiscogsRelease, getDiscogsMaster } from './discogs';
import { notifyAdmins } from '@/actions/notifications';

interface AIArtist {
    name: string;
    key?: string;
    yearsUsed?: string;
    notes?: string;
}

interface AIAlbum {
    title: string;
    artist: string;
    year?: number;
    notes?: string;
}

/**
 * Sanitize artist key to ensure consistency
 * "Pink Floyd" → "pink-floyd"
 * "Kraftwerk" → "kraftwerk"
 */
function sanitizeArtistKey(key: string): string {
    return key
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

/**
 * Ensure artists exist in CatalogMetadata
 * Creates them if they don't exist (no duplicates)
 */
export async function ensureArtistsExist(artists: AIArtist[], userId?: string): Promise<Map<string, string>> {
    await dbConnect();

    const artistMap = new Map<string, string>(); // key → _id

    for (const artist of artists) {
        const sanitizedKey = sanitizeArtistKey(artist.key || artist.name);

        // Check if exists
        let existing = await CatalogMetadata.findOne({
            type: 'artist',
            key: sanitizedKey
        });

        if (!existing) {
            // Create new artist in metadata
            existing = await CatalogMetadata.create({
                type: 'artist',
                key: sanitizedKey,
                label: artist.name,
                description: `Auto-created from AI detection${userId ? ` by user ${userId}` : ''}`
            });

            console.log(`✅ Created artist: ${artist.name} (${sanitizedKey})`);

            // Notify admins about new metadata entry
            await notifyAdmins('metadata_alert', {
                category: 'artist',
                key: sanitizedKey,
                label: artist.name,
                message: `Nuevo artista detectado por AI: ${artist.name}. Requiere revisión y logo.`
            });
        }

        artistMap.set(sanitizedKey, existing._id.toString());
    }

    return artistMap;
}

/**
 * Ensure albums exist in MusicAlbum cache
 * Searches Discogs if not found
 */
export async function ensureAlbumsExist(albums: AIAlbum[], userId?: string): Promise<Map<string, string>> {
    await dbConnect();

    const albumMap = new Map<string, string>(); // title+artist → _id

    for (const album of albums) {
        const searchKey = `${album.artist}-${album.title}`.toLowerCase();

        // Check if exists in cache
        let existing = await MusicAlbum.findOne({
            $or: [
                {
                    artist: { $regex: new RegExp(album.artist, 'i') },
                    title: { $regex: new RegExp(album.title, 'i') }
                },
                // Also check by exact title
                { title: album.title }
            ]
        });

        if (!existing) {
            // Search Discogs
            try {
                const searchQuery = `${album.artist} ${album.title}`;
                const discogsResults = await searchDiscogs(searchQuery);

                if (discogsResults && discogsResults.length > 0) {
                    // Use getOrCreateAlbum to handle hierarchy (DRY)
                    const firstResult = discogsResults[0];
                    const importResult = await getOrCreateAlbum('discogs', firstResult.id.toString(), userId);

                    if (importResult.success && importResult.album) {
                        existing = importResult.album;
                    }
                } else {
                    // Discogs not found, create minimal entry
                    existing = await MusicAlbum.create({
                        artist: album.artist,
                        title: album.title,
                        year: album.year,
                        description: `Auto-created from AI detection (Discogs search failed)`,
                        createdBy: userId
                    });

                    console.log(`⚠️ Created minimal album (Discogs not found): ${album.title}`);
                }
            } catch (error) {
                console.error(`❌ Error fetching album from Discogs:`, error);

                // Fallback: create minimal entry
                existing = await MusicAlbum.create({
                    artist: album.artist,
                    title: album.title,
                    year: album.year,
                    description: `Auto-created from AI detection (Discogs error)`,
                    createdBy: userId
                });
            }
        }

        if (existing) {
            albumMap.set(searchKey, existing._id.toString());
        }
    }

    return albumMap;
}

/**
 * Create instrument-artist relationships
 */
export async function createInstrumentArtistRelations(
    instrumentId: string,
    artists: AIArtist[],
    artistMap: Map<string, string>,
    userId?: string
): Promise<void> {
    await dbConnect();

    for (const artist of artists) {
        const sanitizedKey = sanitizeArtistKey(artist.key || artist.name);
        const artistMetadataId = artistMap.get(sanitizedKey);

        if (!artistMetadataId) continue;

        // Check if relation already exists
        const existing = await InstrumentArtist.findOne({
            instrumentId,
            artistId: artistMetadataId
        });

        if (!existing) {
            await InstrumentArtist.create({
                instrumentId,
                artistId: artistMetadataId,
                notes: artist.notes,
                yearsUsed: artist.yearsUsed,
                isVerified: false, // AI-generated, not verified
                createdBy: userId
            });

            console.log(`✅ Linked instrument to artist: ${artist.name}`);
        }
    }
}

/**
 * Create instrument-album relationships
 */
export async function createInstrumentAlbumRelations(
    instrumentId: string,
    albums: AIAlbum[],
    albumMap: Map<string, string>,
    userId?: string
): Promise<void> {
    await dbConnect();

    for (const album of albums) {
        const searchKey = `${album.artist}-${album.title}`.toLowerCase();
        const albumId = albumMap.get(searchKey);

        if (!albumId) continue;

        // Check if relation already exists
        const existing = await InstrumentAlbum.findOne({
            instrumentId,
            albumId
        });

        if (!existing) {
            await InstrumentAlbum.create({
                instrumentId,
                albumId,
                notes: album.notes,
                isVerified: false, // AI-generated, not verified
                createdBy: userId
            });

            console.log(`✅ Linked instrument to album: ${album.title}`);
        }
    }
}

/**
 * Main enrichment function
 * Call this after AI analysis to enrich instrument with musical data
 */
export async function enrichInstrumentWithMusic(
    instrumentId: string,
    aiData: { artists?: AIArtist[], albums?: AIAlbum[] },
    userId?: string
): Promise<{ success: boolean, stats: { artistsCreated: number, albumsCreated: number, relationsCreated: number } }> {
    const stats = { artistsCreated: 0, albumsCreated: 0, relationsCreated: 0 };

    try {
        // 1. Ensure artists exist
        if (aiData.artists && aiData.artists.length > 0) {
            const artistMap = await ensureArtistsExist(aiData.artists, userId);
            stats.artistsCreated = artistMap.size;

            // 2. Create instrument-artist relations
            await createInstrumentArtistRelations(instrumentId, aiData.artists, artistMap, userId);
            stats.relationsCreated += aiData.artists.length;
        }

        // 3. Ensure albums exist (search Discogs if needed)
        if (aiData.albums && aiData.albums.length > 0) {
            const albumMap = await ensureAlbumsExist(aiData.albums, userId);
            stats.albumsCreated = albumMap.size;

            // 4. Create instrument-album relations
            await createInstrumentAlbumRelations(instrumentId, aiData.albums, albumMap, userId);
            stats.relationsCreated += aiData.albums.length;
        }

        return { success: true, stats };
    } catch (error) {
        console.error('❌ Error enriching instrument with music:', error);
        return { success: false, stats };
    }
}

/**
 * Get or create a single album from Discogs/Spotify
 * Reusable for both user imports and AI enrichment
 */
export async function getOrCreateAlbum(
    source: 'discogs' | 'spotify',
    externalId: string,
    userId?: string
): Promise<{ success: boolean, album?: any, error?: string }> {
    await dbConnect();

    try {
        let globalAlbum: any = null;

        // 1. Check if specific release already exists in cache
        if (source === 'discogs') {
            globalAlbum = await MusicAlbum.findOne({ discogsId: externalId });
        } else if (source === 'spotify') {
            globalAlbum = await MusicAlbum.findOne({ spotifyId: externalId });
        }

        if (globalAlbum) {
            console.log(`✅ Album found in cache: ${globalAlbum.title}`);
            return { success: true, album: globalAlbum };
        }

        // 2. Fetch and Create
        let albumData: any = null;
        let parentId: string | undefined = undefined;

        if (source === 'discogs') {
            const release = await getDiscogsRelease(externalId);
            if (!release) return { success: false, error: 'Release not found on Discogs' };

            // Handle Master Release hierarchy
            if (release.master_id) {
                const masterDiscogsId = release.master_id.toString();
                let masterRecord = await MusicAlbum.findOne({ masterId: masterDiscogsId, isMaster: true });

                if (!masterRecord) {
                    const masterData = await getDiscogsMaster(masterDiscogsId);
                    if (masterData) {
                        masterRecord = await MusicAlbum.create({
                            artist: masterData.artists?.map((a: any) => a.name).join(', ') || release.artists?.[0]?.name,
                            title: masterData.title,
                            year: masterData.year,
                            genres: masterData.genres,
                            styles: masterData.styles,
                            masterId: masterDiscogsId,
                            isMaster: true,
                            coverImage: masterData.images?.[0]?.resource_url || release.thumb,
                            description: masterData.notes,
                            createdBy: userId
                        });
                        console.log(`✅ Created Master Release: ${masterData.title}`);
                    }
                }
                if (masterRecord) {
                    parentId = masterRecord._id.toString();
                }
            }

            const coverImage = release.images?.[0]?.resource_url || release.thumb;
            const validCoverImage = coverImage && !coverImage.includes('spacer.gif') ? coverImage : null;

            albumData = {
                artist: release.artists?.map((a: any) => a.name).join(', ') || 'Unknown Artist',
                title: release.title,
                year: release.year,
                label: release.labels?.[0]?.name,
                genres: release.genres,
                styles: release.styles,
                format: release.formats?.[0]?.name,
                discogsId: externalId,
                masterId: release.master_id?.toString(),
                parentId,
                coverImage: validCoverImage,
                tracklist: release.tracklist?.map((t: any) => ({
                    position: t.position,
                    title: t.title,
                    duration: t.duration
                })),
                description: release.notes,
                createdBy: userId
            };
        } else if (source === 'spotify') {
            const album = await getSpotifyAlbum(externalId);
            if (!album) return { success: false, error: 'Album not found on Spotify' };

            albumData = {
                artist: album.artists?.map((a: any) => a.name).join(', '),
                title: album.name,
                year: album.release_date ? new Date(album.release_date).getFullYear() : null,
                label: album.label,
                genres: album.genres,
                spotifyId: externalId,
                coverImage: album.images?.[0]?.url,
                tracklist: album.tracks?.items?.map((t: any) => ({
                    position: t.track_number.toString(),
                    title: t.name,
                    duration: Math.floor(t.duration_ms / 1000).toString()
                })),
                description: album.copyrights?.[0]?.text,
                createdBy: userId
            };
        }

        if (albumData) {
            globalAlbum = await MusicAlbum.create(albumData);
            console.log(`✅ Created album Edition: ${albumData.title} by ${albumData.artist}`);
            return { success: true, album: globalAlbum };
        }

        return { success: false, error: 'Failed to find or create album' };
    } catch (error: any) {
        console.error('❌ Error in getOrCreateAlbum:', error);
        return { success: false, error: error.message };
    }
}

// Re-export for convenience
export { searchDiscogs, getDiscogsRelease } from './discogs';
export { searchSpotifyAlbums, getSpotifyAlbum } from './spotify';
