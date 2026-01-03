# Redis Rate Limiting Setup

## Overview

The upload system now uses Redis for rate limiting in production, with automatic fallback to in-memory storage in development.

## Setup Options

### Option 1: Upstash Redis (Recommended for Serverless)

Upstash is serverless-friendly and works great with Vercel.

1. **Create Upstash Redis Database**:
   - Go to https://upstash.com/
   - Create a new Redis database
   - Copy the REST URL and Token

2. **Add Environment Variables to Vercel**:
   ```
   UPSTASH_REDIS_REST_URL=https://your-db.upstash.io
   UPSTASH_REDIS_REST_TOKEN=your-token-here
   ```

3. **Install Package** (already installed):
   ```bash
   npm install @upstash/redis
   ```

### Option 2: Standard Redis

If you have a Redis server (e.g., Redis Cloud, AWS ElastiCache):

1. **Add Environment Variable to Vercel**:
   ```
   REDIS_URL=redis://username:password@host:port
   ```

2. **Install Package** (already installed):
   ```bash
   npm install ioredis
   ```

## How It Works

- **Production**: Uses Redis for distributed rate limiting across all server instances
- **Development**: Falls back to in-memory store if Redis is not configured
- **Automatic**: No code changes needed - just set environment variables

## Rate Limits

Current upload rate limits:
- **20 uploads per minute** per IP address
- Configurable in `app/api/upload/route.ts`

## Testing

To test rate limiting:
1. Make 20 upload requests quickly
2. The 21st request should return a 429 status
3. Wait 1 minute and try again

## Monitoring

Check your Redis dashboard to see rate limit keys:
- Keys follow pattern: `ratelimit:upload:{ip-address}`
- Keys expire automatically after the rate limit window

