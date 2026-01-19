'use server';

import dbConnect from '@/lib/db';
import MusicAlbum from '@/models/MusicAlbum';
import UserMusicCollection from '@/models/UserMusicCollection';
import { searchDiscogs, getDiscogsRelease, getDiscogsMasterVersions } from '@/lib/music/discogs';
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
        // Use centralized enrichment module (DRY principle)
        const { getOrCreateAlbum } = await import('@/lib/music/enrichment');
        const result = await getOrCreateAlbum(source, externalId, session.user.id);

        if (!result.success || !result.album) {
            return { success: false, error: result.error || 'Failed to get album' };
        }

        const globalAlbum = result.album;

        // Check if user already has this album
        const existingInUserCollection = await UserMusicCollection.findOne({
            userId: session.user.id,
            albumId: globalAlbum._id
        });

        if (existingInUserCollection) {
            return { success: false, error: 'Album already in your collection' };
        }

        // Add to user's collection
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

export async function getOrCreateAlbumBatch(source: 'discogs' | 'spotify', externalIds: string[]) {
    const session = await (await import('@/auth')).auth();
    if (!session) return { success: false, error: 'Unauthorized' };

    await dbConnect();
    const { getOrCreateAlbum } = await import('@/lib/music/enrichment');

    const results = [];
    for (const id of externalIds) {
        try {
            const res = await getOrCreateAlbum(source, id, session.user.id);
            if (res.success) results.push(res.album);
        } catch (e) {
            console.error(`Batch import failed for ${id}:`, e);
        }
    }

    revalidatePath('/dashboard/music');
    return { success: true, count: results.length };
}

export async function importMasterVersions(masterId: string) {
    try {
        const session = await (await import('@/auth')).auth();
        if (!session) return { success: false, error: 'Unauthorized' };

        const versions = await getDiscogsMasterVersions(masterId);
        if (!versions || versions.length === 0) return { success: false, error: 'No versions found' };

        // Limit to top 20 versions to avoid timeout/rate limits
        const targetIds = versions.slice(0, 20).map((v: any) => v.id.toString());

        return await getOrCreateAlbumBatch('discogs', targetIds);
    } catch (error: any) {
        console.error('Import master versions error:', error);
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
