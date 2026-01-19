const SPOTIFY_TOKEN_URL = 'https://accounts.spotify.com/api/token';
const SPOTIFY_API_BASE_URL = 'https://api.spotify.com/v1';

async function getSpotifyToken() {
    const clientId = process.env.SPOTIFY_CLIENT_ID;
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
        console.warn('SPOTIFY_CLIENT_ID or SPOTIFY_CLIENT_SECRET not found');
        return null;
    }

    const response = await fetch(SPOTIFY_TOKEN_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': 'Basic ' + Buffer.from(clientId + ':' + clientSecret).toString('base64'),
        },
        body: 'grant_type=client_credentials',
    });

    if (!response.ok) return null;
    const data = await response.json();
    return data.access_token;
}

export async function searchSpotifyAlbums(query: string) {
    const token = await getSpotifyToken();
    if (!token) return [];

    const url = `${SPOTIFY_API_BASE_URL}/search?q=${encodeURIComponent(query)}&type=album&limit=10`;

    try {
        const response = await fetch(url, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) return [];
        const data = await response.json();
        return data.albums?.items || [];
    } catch (error) {
        console.error('Error searching Spotify:', error);
        return [];
    }
}

export async function getSpotifyAlbum(id: string) {
    const token = await getSpotifyToken();
    if (!token) return null;

    const url = `${SPOTIFY_API_BASE_URL}/albums/${id}`;

    try {
        const response = await fetch(url, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) return null;
        return await response.json();
    } catch (error) {
        console.error('Error fetching Spotify album:', error);
        return null;
    }
}
