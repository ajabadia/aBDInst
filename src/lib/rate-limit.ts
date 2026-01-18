import { getRedisClient } from './redis';

export interface RateLimitConfig {
    maxRequests: number;
    windowMs: number;
}

export interface RateLimitResult {
    allowed: boolean;
    remaining: number;
    resetAt: number;
}

/**
 * Redis-based rate limiter using sliding window algorithm
 * Falls back to in-memory if Redis is unavailable
 */

// Fallback in-memory store
interface RateLimitEntry {
    count: number;
    resetAt: number;
}
const memoryStore = new Map<string, RateLimitEntry>();

export async function checkRateLimit(
    identifier: string,
    config: RateLimitConfig
): Promise<RateLimitResult> {
    try {
        const redis = getRedisClient();

        // Try to connect if not connected
        if (redis.status !== 'ready') {
            await redis.connect().catch(() => {
                // If connection fails, use memory fallback
                return checkRateLimitMemory(identifier, config);
            });
        }

        const now = Date.now();
        const windowStart = now - config.windowMs;
        const key = `ratelimit:${identifier}`;

        // Use Redis sorted set for sliding window
        const multi = redis.multi();

        // Remove old entries outside the window
        multi.zremrangebyscore(key, 0, windowStart);

        // Count current requests in window
        multi.zcard(key);

        // Add current request with timestamp as score
        multi.zadd(key, now, `${now}-${Math.random()}`);

        // Set expiry on the key
        multi.expire(key, Math.ceil(config.windowMs / 1000));

        const results = await multi.exec();

        if (!results) {
            return checkRateLimitMemory(identifier, config);
        }

        // Get count before adding current request
        const currentCount = (results[1][1] as number) || 0;

        const allowed = currentCount < config.maxRequests;
        const remaining = Math.max(0, config.maxRequests - currentCount - 1);
        const resetAt = now + config.windowMs;

        // If limit exceeded, remove the request we just added
        if (!allowed) {
            await redis.zremrangebyrank(key, -1, -1);
        }

        return { allowed, remaining, resetAt };

    } catch (error) {
        console.error('Redis rate limit error, falling back to memory:', error);
        return checkRateLimitMemory(identifier, config);
    }
}

/**
 * Fallback in-memory rate limiter
 */
function checkRateLimitMemory(
    identifier: string,
    config: RateLimitConfig
): RateLimitResult {
    const now = Date.now();
    let entry = memoryStore.get(identifier);

    if (!entry || entry.resetAt < now) {
        entry = {
            count: 0,
            resetAt: now + config.windowMs
        };
        memoryStore.set(identifier, entry);
    }

    if (entry.count >= config.maxRequests) {
        return {
            allowed: false,
            remaining: 0,
            resetAt: entry.resetAt
        };
    }

    entry.count++;

    return {
        allowed: true,
        remaining: config.maxRequests - entry.count,
        resetAt: entry.resetAt
    };
}

export function getRateLimitKey(userId: string, action: string): string {
    return `${action}:${userId}`;
}

// Cleanup memory store periodically
setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of memoryStore.entries()) {
        if (entry.resetAt < now) {
            memoryStore.delete(key);
        }
    }
}, 5 * 60 * 1000);
