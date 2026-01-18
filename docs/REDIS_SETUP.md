# Redis Setup Guide

## Quick Start

### Option 1: Docker (Recommended for Development)

```bash
# Start Redis container
docker run -d \
  --name redis-ratelimit \
  -p 6379:6379 \
  redis:alpine

# Verify it's running
docker ps | grep redis
```

### Option 2: Local Installation

#### Windows
Download and install from: https://redis.io/docs/getting-started/installation/install-redis-on-windows/

Or use WSL2:
```bash
sudo apt-get update
sudo apt-get install redis-server
sudo service redis-server start
```

#### macOS
```bash
brew install redis
brew services start redis
```

#### Linux (Ubuntu/Debian)
```bash
sudo apt-get update
sudo apt-get install redis-server
sudo systemctl start redis-server
sudo systemctl enable redis-server
```

## Configuration

### 1. Update Environment Variables

Add to `.env.local`:
```env
REDIS_URL=redis://localhost:6379
```

### 2. Verify Connection

```bash
# Test Redis connection
redis-cli ping
# Should return: PONG
```

### 3. Restart Your Application

```bash
npm run dev
```

Check console for:
```
✓ Redis connected
```

## Production Setup

### Upstash (Recommended for Vercel/Serverless)

1. Create account at https://upstash.com
2. Create a Redis database
3. Copy the connection string
4. Add to production environment:
   ```env
   REDIS_URL=rediss://default:YOUR_PASSWORD@YOUR_HOST.upstash.io:6379
   ```

### Redis Cloud

1. Sign up at https://redis.com/try-free/
2. Create a database
3. Get connection details
4. Update `REDIS_URL` in production

### AWS ElastiCache

1. Create ElastiCache cluster in AWS Console
2. Note the endpoint
3. Configure VPC security groups
4. Set `REDIS_URL`:
   ```env
   REDIS_URL=redis://your-cluster.cache.amazonaws.com:6379
   ```

## Monitoring

### View Rate Limit Data

```bash
# Connect to Redis
redis-cli

# List all rate limit keys
KEYS ratelimit:*

# Check user's current count
ZCARD ratelimit:createInstrument:user123

# View all timestamps for a user
ZRANGE ratelimit:createInstrument:user123 0 -1 WITHSCORES
```

### Clear Rate Limits (Development Only)

```bash
# Clear all rate limit data
redis-cli KEYS "ratelimit:*" | xargs redis-cli DEL

# Clear specific user
redis-cli DEL ratelimit:createInstrument:user123
```

## Troubleshooting

### Connection Refused
```
Error: connect ECONNREFUSED 127.0.0.1:6379
```
**Solution**: Ensure Redis is running
```bash
# Docker
docker ps | grep redis

# Local
redis-cli ping
```

### Fallback to Memory
If you see "falling back to memory" in logs, check:
1. `REDIS_URL` is set correctly
2. Redis is accessible from your app
3. No firewall blocking port 6379

### Performance Issues
- Monitor Redis memory usage: `redis-cli INFO memory`
- Check key count: `redis-cli DBSIZE`
- Set maxmemory policy in redis.conf

## Security Best Practices

### Development
- Use default settings (no password for localhost)
- Bind to localhost only

### Production
1. **Enable AUTH**:
   ```bash
   # In redis.conf
   requirepass your_strong_password
   ```

2. **Use TLS**:
   ```env
   REDIS_URL=rediss://... # Note the 'rediss' (with SSL)
   ```

3. **Network Security**:
   - Use VPC/private networks
   - Whitelist IP addresses
   - Disable public access

4. **Monitor Access**:
   ```bash
   # View connected clients
   redis-cli CLIENT LIST
   ```

## Maintenance

### Backup (if using persistence)
```bash
# Trigger save
redis-cli BGSAVE

# Check last save time
redis-cli LASTSAVE
```

### Flush Data (CAUTION)
```bash
# Clear ALL data
redis-cli FLUSHALL

# Clear current database only
redis-cli FLUSHDB
```
