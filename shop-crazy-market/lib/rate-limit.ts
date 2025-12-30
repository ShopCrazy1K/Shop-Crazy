/**
 * Simple in-memory rate limiting utility
 * For production, consider using Redis or Upstash for distributed rate limiting
 */

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

interface RateLimitOptions {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  keyGenerator?: (req: Request) => string; // Custom key generator
}

/**
 * Rate limit middleware for Next.js API routes
 */
export function rateLimit(options: RateLimitOptions) {
  const { windowMs, maxRequests, keyGenerator } = options;

  return async (req: Request): Promise<{ success: boolean; remaining: number; resetTime: number }> => {
    // Generate key (default: IP address)
    const key = keyGenerator 
      ? keyGenerator(req)
      : req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
        req.headers.get('x-real-ip') || 
        'unknown';

    const now = Date.now();
    const record = store[key];

    // Clean up expired entries periodically (every 1000 requests)
    if (Math.random() < 0.001) {
      cleanupExpiredEntries(now);
    }

    if (!record || now > record.resetTime) {
      // Create new record or reset expired one
      store[key] = {
        count: 1,
        resetTime: now + windowMs,
      };
      return {
        success: true,
        remaining: maxRequests - 1,
        resetTime: now + windowMs,
      };
    }

    if (record.count >= maxRequests) {
      // Rate limit exceeded
      return {
        success: false,
        remaining: 0,
        resetTime: record.resetTime,
      };
    }

    // Increment count
    record.count++;
    return {
      success: true,
      remaining: maxRequests - record.count,
      resetTime: record.resetTime,
    };
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
 * Pre-configured rate limiters for common use cases
 */
export const rateLimiters = {
  // Strict: 10 requests per minute
  strict: rateLimit({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 10,
  }),

  // Standard: 100 requests per 15 minutes
  standard: rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100,
  }),

  // Lenient: 1000 requests per hour
  lenient: rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 1000,
  }),

  // Auth endpoints: 5 requests per 15 minutes
  auth: rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5,
    keyGenerator: (req) => {
      // Use IP + user agent for auth endpoints
      const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
      const ua = req.headers.get('user-agent') || 'unknown';
      return `auth:${ip}:${ua.substring(0, 50)}`;
    },
  }),

  // Upload endpoints: 20 requests per hour
  upload: rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 20,
  }),

  // Payment endpoints: 10 requests per minute
  payment: rateLimit({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 10,
  }),
};

/**
 * Helper function to create rate-limited API route handler
 */
export function withRateLimit(
  handler: (req: Request) => Promise<Response>,
  limiter: ReturnType<typeof rateLimit>
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

