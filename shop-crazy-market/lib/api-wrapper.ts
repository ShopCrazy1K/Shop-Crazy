import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, optionalAuth } from './auth-middleware';
import { rateLimiters } from './rate-limit';
import { handleError } from './error-handler';
import { rateLimitResponse } from './api-response';

type RouteHandler = (
  req: NextRequest,
  context?: { params?: any }
) => Promise<NextResponse>;

interface RouteOptions {
  requireAuth?: boolean;
  optionalAuth?: boolean;
  rateLimit?: keyof typeof rateLimiters;
  methods?: string[];
}

/**
 * Wrap API route handlers with common middleware
 * - Method validation
 * - Rate limiting
 * - Authentication
 * - Error handling
 */
export function withApiHandler(
  handler: RouteHandler,
  options: RouteOptions = {}
) {
  return async (req: NextRequest, context?: { params?: any }): Promise<NextResponse> => {
    try {
      // Method check
      if (options.methods && !options.methods.includes(req.method)) {
        return NextResponse.json(
          { success: false, error: 'Method not allowed' },
          { status: 405, headers: { Allow: options.methods.join(', ') } }
        );
      }

      // Rate limiting
      if (options.rateLimit) {
        const limiter = rateLimiters[options.rateLimit];
        const result = await limiter(req);
        if (!result.success) {
          const retryAfter = Math.ceil((result.resetTime - Date.now()) / 1000);
          return rateLimitResponse('Too many requests', retryAfter);
        }
      }

      // Authentication
      if (options.requireAuth) {
        const authResult = await requireAuth(req);
        if (authResult.error) {
          return authResult.error;
        }
        // Attach user to request
        (req as any).user = authResult.user;
      } else if (options.optionalAuth) {
        const authResult = await optionalAuth(req);
        (req as any).user = authResult.user;
      }

      // Execute handler
      return await handler(req, context);
    } catch (error) {
      return handleError(error);
    }
  };
}

/**
 * Create a GET handler with options
 */
export function createGetHandler(
  handler: RouteHandler,
  options: Omit<RouteOptions, 'methods'> = {}
) {
  return withApiHandler(handler, { ...options, methods: ['GET'] });
}

/**
 * Create a POST handler with options
 */
export function createPostHandler(
  handler: RouteHandler,
  options: Omit<RouteOptions, 'methods'> = {}
) {
  return withApiHandler(handler, { ...options, methods: ['POST'] });
}

/**
 * Create a PUT handler with options
 */
export function createPutHandler(
  handler: RouteHandler,
  options: Omit<RouteOptions, 'methods'> = {}
) {
  return withApiHandler(handler, { ...options, methods: ['PUT'] });
}

/**
 * Create a DELETE handler with options
 */
export function createDeleteHandler(
  handler: RouteHandler,
  options: Omit<RouteOptions, 'methods'> = {}
) {
  return withApiHandler(handler, { ...options, methods: ['DELETE'] });
}
