'use server';

import { z } from 'zod';
import { createSafeAction } from '@/lib/safe-action';
import { ExternalServiceError } from '@/lib/errors';

const UnsplashSearchSchema = z.object({
    query: z.string().min(2),
    per_page: z.number().optional().default(10),
});

/**
 * Searches high-resolution stock imagery from Unsplash.
 * Requires UNSPLASH_ACCESS_KEY in environment variables.
 */
export const searchHighResStock = createSafeAction(
    UnsplashSearchSchema,
    async ({ query, per_page }, userId, role, correlationId) => {
        const accessKey = process.env.UNSPLASH_ACCESS_KEY;

        if (!accessKey) {
            // Mocked response for development if no key is present
            return [
                {
                    id: 'mock1',
                    url: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&q=80&w=1600',
                    thumb: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&q=80&w=400',
                    full: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&q=80&w=2400',
                    attribution: 'Photo by Unsplash Mock on Unsplash',
                    user: 'Unsplash Mock',
                    userLink: 'https://unsplash.com',
                },
                {
                    id: 'mock2',
                    url: 'https://images.unsplash.com/photo-1514525253361-b83f85dfd75c?auto=format&fit=crop&q=80&w=1600',
                    thumb: 'https://images.unsplash.com/photo-1514525253361-b83f85dfd75c?auto=format&fit=crop&q=80&w=400',
                    full: 'https://images.unsplash.com/photo-1514525253361-b83f85dfd75c?auto=format&fit=crop&q=80&w=2400',
                    attribution: 'Photo by Unsplash Mock (Stage) on Unsplash',
                    user: 'Unsplash Mock',
                    userLink: 'https://unsplash.com',
                }
            ];
        }

        try {
            const response = await fetch(
                `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
                    query
                )}&per_page=${per_page}&orientation=landscape`,
                {
                    headers: {
                        Authorization: `Client-ID ${accessKey}`,
                    },
                }
            );

            if (!response.ok) {
                throw new ExternalServiceError('Unsplash', `Error de API: ${response.statusText}`);
            }

            const data = await response.json();
            return data.results.map((img: any) => ({
                id: img.id,
                url: img.urls.regular,
                thumb: img.urls.thumb,
                full: img.urls.full,
                attribution: `Photo by ${img.user.name} on Unsplash`,
                user: img.user.name,
                userLink: img.user.links.html,
            }));
        } catch (error: any) {
            if (error instanceof ExternalServiceError) throw error;
            throw new ExternalServiceError('Unsplash', error.message || 'Error desconocido');
        }
    },
    { protected: true, allowedRoles: ['admin', 'editor'], name: 'SEARCH_UNSPLASH' }
);
