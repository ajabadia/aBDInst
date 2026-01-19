'use server';

import dbConnect from '@/lib/db';
import MusicAlbum from '@/models/MusicAlbum';
import UserMusicCollection from '@/models/UserMusicCollection';
import { searchDiscogs, getDiscogsRelease } from '@/lib/music/discogs';
import { searchSpotifyAlbums, getSpotifyAlbum } from '@/lib/music/spotify';
import { revalidatePath } from 'next/cache';

export async function searchMusic(query: string) {
    'use server';

    if (!query) return { success: true, discogs: [], spotify: [] };

    try {
        const [discogsResults, spotifyResults] = await Promise.all([
            searchDiscogs(query).catch(err => {
                console.error('Discogs search error:', err);
                return [];
            }),
            searchSpotifyAlbums(query).catch(err => {
                console.error('Spotify search error:', err);
                return [];
            })
        ]);

        return {
            success: true,
            discogs: discogsResults,
            spotify: spotifyResults
        };
    } catch (error: any) {
        console.error('Search music error:', error);
        return {
            success: false,
            error: error.message || 'Error en la búsqueda',
            discogs: [],
            spotify: []
        };
    }
}

export async function importAlbum(source: 'discogs' | 'spotify', externalId: string) {
    const session = await (await import('@/auth')).auth();
    if (!session) return { success: false, error: 'Unauthorized' };

    await dbConnect();

    try {
        let globalAlbum: any = null;

        // 1. Check if album already exists in our catalog (CACHE)
        if (source === 'discogs') {
            globalAlbum = await MusicAlbum.findOne({ discogsId: externalId });
        } else if (source === 'spotify') {
            globalAlbum = await MusicAlbum.findOne({ spotifyId: externalId });
        }

        // 2. If not in cache, fetch from API and save
        if (!globalAlbum) {
            let albumData: any = null;

            if (source === 'discogs') {
                const release = await getDiscogsRelease(externalId);
                if (!release) return { success: false, error: 'Release not found on Discogs' };

                // Filter out spacer.gif
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
                    coverImage: validCoverImage,
                    tracklist: release.tracklist?.map((t: any) => ({
                        position: t.position,
                        title: t.title,
                        duration: t.duration
                    })),
                    description: release.notes,
                    createdBy: session.user.id
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
                    createdBy: session.user.id
                };
            }

            if (albumData) {
                globalAlbum = await MusicAlbum.create(albumData);
            }
        }

        if (!globalAlbum) return { success: false, error: 'Failed to find or create album' };

        // 3. Check if user already has this album
        const existingInUserCollection = await UserMusicCollection.findOne({
            userId: session.user.id,
            albumId: globalAlbum._id
        });

        if (existingInUserCollection) {
            return { success: false, error: 'Album already in your collection' };
        }

        // 4. Add to user's collection
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
