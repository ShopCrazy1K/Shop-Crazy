/**
 * Rate limiting utility with Redis support for production
 * Falls back to in-memory store in development
 */

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

interface RateLimitOptions {
  identifier: string; // Unique identifier (e.g., IP address, user ID)
  limit: number; // Maximum requests per window
  window: number; // Time window in seconds
}

interface RateLimitResult {
  success: boolean;
  remaining: number;
  retryAfter?: number;
}

/**
 * Get Redis client (if available)
 */
async function getRedisClient() {
  // Check if Redis is configured
  if (!process.env.REDIS_URL && !process.env.UPSTASH_REDIS_REST_URL) {
    return null;
  }

  try {
    // Try to use Upstash Redis (serverless-friendly)
    if (process.env.UPSTASH_REDIS_REST_URL) {
      const { Redis } = await import('@upstash/redis');
      return new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN!,
      });
    }

    // Try to use standard Redis
    if (process.env.REDIS_URL) {
      const Redis = (await import('ioredis')).default;
      return new Redis(process.env.REDIS_URL);
    }
  } catch (error) {
    console.warn('[RATE LIMIT] Redis not available, using in-memory store:', error);
    return null;
  }

  return null;
}

/**
 * Rate limit check with Redis support
 */
export async function rateLimit(options: RateLimitOptions): Promise<RateLimitResult> {
  const { identifier, limit, window } = options;
  const redis = await getRedisClient();
  const key = `ratelimit:${identifier}`;
  const windowMs = window * 1000;

  // Use Redis if available (production)
  if (redis) {
    try {
      const now = Date.now();
      const windowStart = now - windowMs;

      // Use Redis sorted set for sliding window
      if ('zadd' in redis && typeof redis.zadd === 'function') {
        // Upstash Redis
        const pipeline = (redis as any).pipeline();
        pipeline.zremrangebyscore(key, 0, windowStart);
        pipeline.zcard(key);
        pipeline.zadd(key, { score: now, member: `${now}-${Math.random()}` });
        pipeline.expire(key, window);
        const results = await pipeline.exec();

        const count = results[1] as number;
        const remaining = Math.max(0, limit - count);

        if (count >= limit) {
          // Get oldest entry to calculate retry after
          const oldest = await (redis as any).zrange(key, 0, 0, { withScores: true });
          const retryAfter = oldest.length > 0 
            ? Math.ceil((oldest[0].score + windowMs - now) / 1000)
            : window;

          return {
            success: false,
            remaining: 0,
            retryAfter,
          };
        }

        return {
          success: true,
          remaining,
        };
      } else {
        // Standard Redis (ioredis)
        const pipeline = (redis as any).pipeline();
        pipeline.zremrangebyscore(key, 0, windowStart);
        pipeline.zcard(key);
        pipeline.zadd(key, now, `${now}-${Math.random()}`);
        pipeline.expire(key, window);
        const results = await pipeline.exec();

        const count = results[1][1] as number;
        const remaining = Math.max(0, limit - count);

        if (count >= limit) {
          const oldest = await (redis as any).zrange(key, 0, 0, 'WITHSCORES');
          const retryAfter = oldest.length > 0 
            ? Math.ceil((parseFloat(oldest[1]) + windowMs - now) / 1000)
            : window;

          return {
            success: false,
            remaining: 0,
            retryAfter,
          };
        }

        return {
          success: true,
          remaining,
        };
      }
    } catch (error) {
      console.error('[RATE LIMIT] Redis error, falling back to in-memory:', error);
      // Fall through to in-memory store
    }
  }

  // Fallback to in-memory store (development)
  const now = Date.now();
  const record = store[key];

  // Clean up expired entries periodically
  if (Math.random() < 0.001) {
    cleanupExpiredEntries(now);
  }

  if (!record || now > record.resetTime) {
    store[key] = {
      count: 1,
      resetTime: now + windowMs,
    };
    return {
      success: true,
      remaining: limit - 1,
    };
  }

  if (record.count >= limit) {
    return {
      success: false,
      remaining: 0,
      retryAfter: Math.ceil((record.resetTime - now) / 1000),
    };
  }

  record.count++;
  return {
    success: true,
    remaining: limit - record.count,
  };
}

/**
 * Clean up expired entries from the store
 */
function cleanupExpiredEntries(now: number) {
  Object.keys(store).forEach((key) => {
    if (store[key].resetTime < now) {
      delete store[key];
    }
  });
}

/**
 * Helper function for rate limiting with identifier
 */
export async function checkRateLimit(
  identifier: string,
  limit: number,
  window: number
): Promise<RateLimitResult> {
  return rateLimit({ identifier, limit, window });
}

/**
 * Legacy rate limiters for backward compatibility
 * These wrap the new rateLimit function to match the old API
 */
export const rateLimiters = {
  // Strict: 10 requests per minute
  strict: async (req: Request) => {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
               req.headers.get('x-real-ip') || 
               'unknown';
    const result = await rateLimit({ identifier: `strict:${ip}`, limit: 10, window: 60 });
    return {
      success: result.success,
      remaining: result.remaining,
      resetTime: Date.now() + (result.retryAfter || 60) * 1000,
    };
  },

  // Standard: 100 requests per 15 minutes
  standard: async (req: Request) => {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
               req.headers.get('x-real-ip') || 
               'unknown';
    const result = await rateLimit({ identifier: `standard:${ip}`, limit: 100, window: 900 });
    return {
      success: result.success,
      remaining: result.remaining,
      resetTime: Date.now() + (result.retryAfter || 900) * 1000,
    };
  },

  // Lenient: 1000 requests per hour
  lenient: async (req: Request) => {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
               req.headers.get('x-real-ip') || 
               'unknown';
    const result = await rateLimit({ identifier: `lenient:${ip}`, limit: 1000, window: 3600 });
    return {
      success: result.success,
      remaining: result.remaining,
      resetTime: Date.now() + (result.retryAfter || 3600) * 1000,
    };
  },

  // Auth endpoints: 5 requests per 15 minutes
  auth: async (req: Request) => {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const ua = req.headers.get('user-agent') || 'unknown';
    const identifier = `auth:${ip}:${ua.substring(0, 50)}`;
    const result = await rateLimit({ identifier, limit: 5, window: 900 });
    return {
      success: result.success,
      remaining: result.remaining,
      resetTime: Date.now() + (result.retryAfter || 900) * 1000,
    };
  },

  // Upload endpoints: 20 requests per hour
  upload: async (req: Request) => {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
               req.headers.get('x-real-ip') || 
               'unknown';
    const result = await rateLimit({ identifier: `upload:${ip}`, limit: 20, window: 3600 });
    return {
      success: result.success,
      remaining: result.remaining,
      resetTime: Date.now() + (result.retryAfter || 3600) * 1000,
    };
  },

  // Payment endpoints: 10 requests per minute
  payment: async (req: Request) => {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
               req.headers.get('x-real-ip') || 
               'unknown';
    const result = await rateLimit({ identifier: `payment:${ip}`, limit: 10, window: 60 });
    return {
      success: result.success,
      remaining: result.remaining,
      resetTime: Date.now() + (result.retryAfter || 60) * 1000,
    };
  },
};

/**
 * Helper function to create rate-limited API route handler
 */
export function withRateLimit(
  handler: (req: Request) => Promise<Response>,
  limiter: (req: Request) => Promise<{ success: boolean; remaining: number; resetTime: number }>
) {
  return async (req: Request): Promise<Response> => {
    const result = await limiter(req);

    if (!result.success) {
      return new Response(
        JSON.stringify({
          error: 'Too many requests',
          message: 'Rate limit exceeded. Please try again later.',
          retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000),
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'X-RateLimit-Limit': '100',
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': result.resetTime.toString(),
            'Retry-After': Math.ceil((result.resetTime - Date.now()) / 1000).toString(),
          },
        }
      );
    }

    // Add rate limit headers to successful responses
    const response = await handler(req);
    response.headers.set('X-RateLimit-Limit', '100');
    response.headers.set('X-RateLimit-Remaining', result.remaining.toString());
    response.headers.set('X-RateLimit-Reset', result.resetTime.toString());

    return response;
  };
}

