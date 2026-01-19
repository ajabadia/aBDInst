const DISCOGS_BASE_URL = 'https://api.discogs.com';

export interface DiscogsSearchResult {
    id: number;
    title: string;
    cover_image: string;
    year?: string;
    label?: string[];
    genre?: string[];
    style?: string[];
}

export async function searchDiscogs(query: string): Promise<DiscogsSearchResult[]> {
    const token = process.env.DISCOGS_TOKEN;
    if (!token) {
        console.warn('DISCOGS_TOKEN not found in environment');
        return [];
    }

    const url = `${DISCOGS_BASE_URL}/database/search?q=${encodeURIComponent(query)}&type=release&token=${token}`;

    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'InstrumentCollectorApp/0.1'
            }
        });

        if (!response.ok) {
            throw new Error(`Discogs API error: ${response.statusText}`);
        }

        const data = await response.json();
        return data.results || [];
    } catch (error) {
        console.error('Error searching Discogs:', error);
        return [];
    }
}

export async function getDiscogsRelease(id: string) {
    const token = process.env.DISCOGS_TOKEN;
    if (!token) return null;

    const url = `${DISCOGS_BASE_URL}/releases/${id}?token=${token}`;

    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'InstrumentCollectorApp/0.1'
            }
        });

        if (!response.ok) return null;

        return await response.json();
    } catch (error) {
        console.error('Error fetching Discogs release:', error);
        return null;
    }
}

export async function getDiscogsMaster(id: string) {
    const token = process.env.DISCOGS_TOKEN;
    if (!token) return null;

    const url = `${DISCOGS_BASE_URL}/masters/${id}?token=${token}`;

    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'InstrumentCollectorApp/0.1'
            }
        });

        if (!response.ok) return null;

        return await response.json();
    } catch (error) {
        console.error('Error fetching Discogs master:', error);
        return null;
    }
}

export async function getDiscogsMasterVersions(masterId: string) {
    const token = process.env.DISCOGS_TOKEN;
    if (!token) return [];

    const url = `${DISCOGS_BASE_URL}/masters/${masterId}/versions?token=${token}`;

    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'InstrumentCollectorApp/0.1'
            }
        });

        if (!response.ok) return [];

        const data = await response.json();
        return data.versions || [];
    } catch (error) {
        console.error('Error fetching Discogs master versions:', error);
        return [];
    }
}
