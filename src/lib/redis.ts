import Redis from 'ioredis';

let redis: Redis | null = null;

export function getRedisClient(): Redis {
    if (!redis) {
        const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

        // Detect if using TLS (Upstash uses rediss://)
        const useTLS = redisUrl.startsWith('rediss://');

        redis = new Redis(redisUrl, {
            maxRetriesPerRequest: 3,
            retryStrategy(times) {
                const delay = Math.min(times * 50, 2000);
                return delay;
            },
            // TLS configuration for Upstash and other cloud providers
            ...(useTLS && {
                tls: {
                    rejectUnauthorized: true
                }
            }),
            // Graceful degradation: if Redis is unavailable, log but don't crash
            lazyConnect: true,
        });

        redis.on('error', (err) => {
            console.error('Redis Client Error:', err);
        });

        redis.on('connect', () => {
            console.log('✓ Redis connected');
        });
    }

    return redis;
}

export async function closeRedis() {
    if (redis) {
        await redis.quit();
        redis = null;
    }
}
