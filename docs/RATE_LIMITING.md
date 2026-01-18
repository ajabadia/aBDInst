# Rate Limiting

## Overview
The application implements rate limiting to prevent abuse and ensure fair usage of resources.

## Current Limits

### Instrument Creation (`createInstrument`)
- **Users**: 5 instruments per hour
- **Admins/Editors**: No limit
- **Purpose**: Prevent spam submissions and database saturation

### Add to Collection (`addToCollection`)
- **All Users**: 10 additions per hour
- **Purpose**: Prevent automated bulk collection building

## Implementation

### Technology Stack
- **Primary**: **Redis** with sliding window algorithm (production-ready)
- **Fallback**: In-memory Map-based storage (if Redis unavailable)
- **Algorithm**: Sliding window for accurate rate limiting

### Redis Setup

#### Local Development
```bash
# Using Docker
docker run -d -p 6379:6379 redis:alpine

# Or install Redis locally
# Windows: https://redis.io/docs/getting-started/installation/install-redis-on-windows/
# Mac: brew install redis
# Linux: sudo apt-get install redis-server
```

#### Environment Configuration
Add to your `.env.local`:
```env
REDIS_URL=redis://localhost:6379
```

For production (e.g., Redis Cloud, AWS ElastiCache):
```env
REDIS_URL=redis://username:password@your-redis-host:6379
```

### Graceful Degradation
The system automatically falls back to in-memory rate limiting if:
- Redis is not configured (`REDIS_URL` not set)
- Redis connection fails
- Redis is temporarily unavailable

**Note**: In-memory fallback works per-instance only. For multi-instance deployments, Redis is required for accurate rate limiting across all instances.

## Configuration

Rate limits are defined in `src/lib/rate-limit.ts`:

```typescript
{
    maxRequests: number,  // Maximum requests allowed
    windowMs: number      // Time window in milliseconds
}
```

## Error Handling

When rate limit is exceeded, users receive:
- Clear error message with time until reset
- HTTP-friendly response structure
- No data loss (request is rejected before processing)

## Monitoring

### Redis Keys
Rate limit data is stored in Redis with keys:
- Pattern: `ratelimit:{action}:{userId}`
- Example: `ratelimit:createInstrument:user123`
- TTL: Automatically expires after window period

### Debugging
```bash
# Connect to Redis CLI
redis-cli

# View all rate limit keys
KEYS ratelimit:*

# Check specific user's limit
ZCARD ratelimit:createInstrument:user123

# View timestamps
ZRANGE ratelimit:createInstrument:user123 0 -1 WITHSCORES
```

## Production Recommendations

### Redis Providers
- **Upstash**: Serverless Redis (great for Vercel)
- **Redis Cloud**: Managed Redis by Redis Labs
- **AWS ElastiCache**: For AWS deployments
- **Azure Cache for Redis**: For Azure deployments

### Security
- Use TLS/SSL for Redis connections in production
- Set strong passwords
- Use VPC/private networks when possible
- Enable Redis AUTH

## Future Enhancements
- [ ] Admin dashboard to view/manage rate limits
- [ ] Configurable limits via environment variables
- [ ] Per-IP rate limiting (in addition to per-user)
- [ ] CAPTCHA integration for suspicious patterns
- [ ] Rate limit analytics and reporting

