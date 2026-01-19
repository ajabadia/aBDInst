'use server';

import dbConnect from '@/lib/db';
import MusicAlbum from '@/models/MusicAlbum';
import UserMusicCollection from '@/models/UserMusicCollection';
import { searchDiscogs, getDiscogsRelease } from '@/lib/music/discogs';
import { searchSpotifyAlbums, getSpotifyAlbum } from '@/lib/music/spotify';
import { revalidatePath } from 'next/cache';

export async function searchMusic(query: string) {
    if (!query) return { discogs: [], spotify: [] };

    const [discogsResults, spotifyResults] = await Promise.all([
        searchDiscogs(query),
        searchSpotifyAlbums(query)
    ]);

    return {
        discogs: discogsResults,
        spotify: spotifyResults
    };
}

export async function importAlbum(source: 'discogs' | 'spotify', externalId: string) {
    const session = await (await import('@/auth')).auth();
    if (!session) return { success: false, error: 'Unauthorized' };

    await dbConnect();

    try {
        let albumData: any = null;
        let globalAlbum: any = null;

        // 1. Fetch from Source & Check Catalog
        if (source === 'discogs') {
            globalAlbum = await MusicAlbum.findOne({ discogsId: externalId });
            if (!globalAlbum) {
                const release = await getDiscogsRelease(externalId);
                if (!release) return { success: false, error: 'Release not found on Discogs' };

                albumData = {
                    artist: release.artists?.map((a: any) => a.name).join(', ') || 'Unknown Artist',
                    title: release.title,
                    year: release.year,
                    label: release.labels?.[0]?.name,
                    genres: release.genres,
                    styles: release.styles,
                    format: release.formats?.[0]?.name,
                    discogsId: externalId,
                    coverImage: release.images?.[0]?.resource_url || release.thumb,
                    tracklist: release.tracklist?.map((t: any) => ({
                        position: t.position,
                        title: t.title,
                        duration: t.duration
                    })),
                    description: release.notes
                };
            }
        } else if (source === 'spotify') {
            globalAlbum = await MusicAlbum.findOne({ spotifyId: externalId });
            if (!globalAlbum) {
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
                        duration: Math.floor(t.duration_ms / 1000).toString() // simplified
                    })),
                    description: album.copyrights?.[0]?.text
                };
            }
        }

        // 2. Create Global Album if it doesn't exist
        if (!globalAlbum && albumData) {
            globalAlbum = await MusicAlbum.create(albumData);
        }

        if (!globalAlbum) return { success: false, error: 'Failed to find or create album' };

        // 3. Add to User Collection
        const existingInUserCollection = await UserMusicCollection.findOne({
            userId: session.user.id,
            albumId: globalAlbum._id
        });

        if (existingInUserCollection) {
            return { success: false, error: 'Album already in your collection' };
        }

        const userItem = await UserMusicCollection.create({
            userId: session.user.id,
            albumId: globalAlbum._id,
            status: 'active',
            condition: 'Near Mint'
        });

        revalidatePath('/dashboard/music');
        return { success: true, data: JSON.parse(JSON.stringify(userItem)) };

    } catch (error: any) {
        console.error('Import error:', error);
        return { success: false, error: error.message };
    }
}

export async function getUserMusicCollection() {
    const session = await (await import('@/auth')).auth();
    if (!session) return [];

    await dbConnect();
    const collection = await UserMusicCollection.find({ userId: session.user.id })
        .populate('albumId')
        .sort({ createdAt: -1 })
        .lean();

    return JSON.parse(JSON.stringify(collection));
}
