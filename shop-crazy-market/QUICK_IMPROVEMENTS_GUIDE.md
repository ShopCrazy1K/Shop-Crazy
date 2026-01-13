# ⚡ Quick Improvements Guide

This guide provides ready-to-use code for the most critical improvements you can implement immediately.

## 1. Environment Variable Validation (30 minutes)

Create `lib/env.ts`:

```typescript
import { z } from 'zod';

const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url(),
  
  // Shopify
  SHOPIFY_API_KEY: z.string().min(1),
  SHOPIFY_API_SECRET: z.string().min(1),
  SHOPIFY_SCOPES: z.string().default('read_products,write_products,read_orders,write_orders'),
  
  // App URLs
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
  SHOPIFY_APP_URL: z.string().url().optional(),
  VERCEL_URL: z.string().optional(),
  
  // Encryption
  ENCRYPTION_KEY: z.string().min(32),
  
  // Email
  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().email().optional(),
  
  // Sentry
  NEXT_PUBLIC_SENTRY_DSN: z.string().url().optional(),
  SENTRY_DSN: z.string().url().optional(),
  SENTRY_ORG: z.string().optional(),
  SENTRY_PROJECT: z.string().optional(),
  
  // Redis
  REDIS_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
  
  // Stripe
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_LISTING_FEE_PRICE_ID: z.string().optional(),
  
  // Node Environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

export type Env = z.infer<typeof envSchema>;

function getEnv(): Env {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missing = error.errors.map(e => `${e.path.join('.')}: ${e.message}`);
      throw new Error(`Missing or invalid environment variables:\n${missing.join('\n')}`);
    }
    throw error;
  }
}

export const env = getEnv();
```

Update imports:
```typescript
// Before
const apiKey = process.env.SHOPIFY_API_KEY || '';

// After
import { env } from '@/lib/env';
const apiKey = env.SHOPIFY_API_KEY;
```

## 2. Standardized API Responses (15 minutes)

Create `lib/api-response.ts`:

```typescript
import { NextResponse } from 'next/server';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export function successResponse<T>(
  data: T,
  status: number = 200,
  message?: string
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      ...(message && { message }),
    },
    { status }
  );
}

export function errorResponse(
  error: string,
  status: number = 400,
  details?: any
): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      success: false,
      error,
      ...(details && { details }),
    },
    { status }
  );
}

export function unauthorizedResponse(message = 'Authentication required') {
  return errorResponse(message, 401);
}

export function forbiddenResponse(message = 'Access denied') {
  return errorResponse(message, 403);
}

export function notFoundResponse(message = 'Resource not found') {
  return errorResponse(message, 404);
}

export function serverErrorResponse(message = 'Internal server error', error?: any) {
  if (error) {
    console.error('[API Error]', error);
  }
  return errorResponse(message, 500);
}
```

Usage:
```typescript
// Before
return NextResponse.json({ error: 'Not found' }, { status: 404 });

// After
import { notFoundResponse } from '@/lib/api-response';
return notFoundResponse('Listing not found');
```

## 3. Security Headers (10 minutes)

Update `next.config.js`:

```javascript
async headers() {
  return [
    {
      source: "/(.*)",
      headers: [
        {
          key: "Content-Security-Policy",
          value: [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com",
            "style-src 'self' 'unsafe-inline'",
            "img-src 'self' data: https:",
            "font-src 'self' data:",
            "connect-src 'self' https://api.stripe.com https://*.supabase.co",
            "frame-src https://js.stripe.com https://admin.shopify.com https://*.myshopify.com",
            "frame-ancestors https://admin.shopify.com https://*.myshopify.com",
          ].join('; '),
        },
        {
          key: "X-Frame-Options",
          value: "SAMEORIGIN",
        },
        {
          key: "X-Content-Type-Options",
          value: "nosniff",
        },
        {
          key: "X-XSS-Protection",
          value: "1; mode=block",
        },
        {
          key: "Referrer-Policy",
          value: "strict-origin-when-cross-origin",
        },
        {
          key: "Permissions-Policy",
          value: "camera=(), microphone=(), geolocation=()",
        },
        {
          key: "Strict-Transport-Security",
          value: "max-age=31536000; includeSubDomains",
        },
      ],
    },
  ];
}
```

## 4. Error Handling Middleware (20 minutes)

Create `lib/error-handler.ts`:

```typescript
import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public isPublic: boolean = false,
    public code?: string
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string, public errors?: any) {
    super(message, 400, true, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource') {
    super(`${resource} not found`, 404, true, 'NOT_FOUND');
    this.name = 'NotFoundError';
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(message, 401, true, 'UNAUTHORIZED');
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Access denied') {
    super(message, 403, true, 'FORBIDDEN');
    this.name = 'ForbiddenError';
  }
}

export function handleError(error: unknown): NextResponse {
  // Zod validation errors
  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        success: false,
        error: 'Validation failed',
        details: error.errors,
      },
      { status: 400 }
    );
  }

  // App errors
  if (error instanceof AppError) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        code: error.code,
        ...(error instanceof ValidationError && { details: error.errors }),
      },
      { status: error.statusCode }
    );
  }

  // Prisma errors
  if (error && typeof error === 'object' && 'code' in error) {
    const prismaError = error as { code: string; message: string };
    if (prismaError.code === 'P2002') {
      return NextResponse.json(
        {
          success: false,
          error: 'Duplicate entry',
          code: 'DUPLICATE_ENTRY',
        },
        { status: 409 }
      );
    }
  }

  // Unknown errors
  console.error('[Unhandled Error]', error);
  return NextResponse.json(
    {
      success: false,
      error: 'Internal server error',
      code: 'INTERNAL_ERROR',
    },
    { status: 500 }
  );
}
```

Usage:
```typescript
try {
  // Your code
} catch (error) {
  return handleError(error);
}
```

## 5. API Route Wrapper (15 minutes)

Create `lib/api-wrapper.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from './auth-middleware';
import { rateLimiters } from './rate-limit';
import { handleError } from './error-handler';

type RouteHandler = (
  req: NextRequest,
  context?: any
) => Promise<NextResponse>;

interface RouteOptions {
  requireAuth?: boolean;
  rateLimit?: keyof typeof rateLimiters;
  methods?: string[];
}

export function withApiHandler(
  handler: RouteHandler,
  options: RouteOptions = {}
) {
  return async (req: NextRequest, context?: any): Promise<NextResponse> => {
    try {
      // Method check
      if (options.methods && !options.methods.includes(req.method)) {
        return NextResponse.json(
          { success: false, error: 'Method not allowed' },
          { status: 405 }
        );
      }

      // Rate limiting
      if (options.rateLimit) {
        const limiter = rateLimiters[options.rateLimit];
        const result = await limiter(req);
        if (!result.success) {
          return NextResponse.json(
            {
              success: false,
              error: 'Too many requests',
              retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000),
            },
            {
              status: 429,
              headers: {
                'Retry-After': Math.ceil((result.resetTime - Date.now()) / 1000).toString(),
                'X-RateLimit-Limit': '100',
                'X-RateLimit-Remaining': '0',
                'X-RateLimit-Reset': result.resetTime.toString(),
              },
            }
          );
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
      }

      // Execute handler
      return await handler(req, context);
    } catch (error) {
      return handleError(error);
    }
  };
}
```

Usage:
```typescript
// Before
export async function GET(req: Request) {
  try {
    // handler code
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

// After
import { withApiHandler } from '@/lib/api-wrapper';

export const GET = withApiHandler(
  async (req) => {
    // handler code - no try/catch needed
    return successResponse(data);
  },
  {
    requireAuth: true,
    rateLimit: 'standard',
    methods: ['GET'],
  }
);
```

## 6. Input Validation Helper (10 minutes)

Create `lib/validate.ts`:

```typescript
import { z } from 'zod';
import { ValidationError } from './error-handler';

export async function validateRequest<T extends z.ZodType>(
  schema: T,
  data: unknown
): Promise<z.infer<T>> {
  try {
    return await schema.parseAsync(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ValidationError('Invalid input', error.errors);
    }
    throw error;
  }
}

export async function validateQuery<T extends z.ZodType>(
  schema: T,
  searchParams: URLSearchParams
): Promise<z.infer<T>> {
  const params = Object.fromEntries(searchParams.entries());
  return validateRequest(schema, params);
}

export async function validateBody<T extends z.ZodType>(
  schema: T,
  request: Request
): Promise<z.infer<T>> {
  const body = await request.json().catch(() => ({}));
  return validateRequest(schema, body);
}
```

Usage:
```typescript
import { z } from 'zod';
import { validateQuery } from '@/lib/validate';

const querySchema = z.object({
  shop: z.string().min(1),
  shopId: z.string().uuid(),
});

export const GET = withApiHandler(async (req) => {
  const { searchParams } = new URL(req.url);
  const { shop, shopId } = await validateQuery(querySchema, searchParams);
  
  // Use validated data
});
```

## Implementation Checklist

- [ ] Add environment variable validation (`lib/env.ts`)
- [ ] Create API response utilities (`lib/api-response.ts`)
- [ ] Add security headers to `next.config.js`
- [ ] Create error handling utilities (`lib/error-handler.ts`)
- [ ] Create API wrapper (`lib/api-wrapper.ts`)
- [ ] Add input validation helpers (`lib/validate.ts`)
- [ ] Update existing API routes to use new utilities
- [ ] Test all changes
- [ ] Deploy to staging
- [ ] Monitor for errors

## Estimated Time

Total: ~2-3 hours for all improvements

## Next Steps

After implementing these quick wins:
1. Review `IMPROVEMENTS_AND_RECOMMENDATIONS.md`
2. Prioritize Phase 1 items
3. Set up testing infrastructure
4. Plan authentication security improvements
