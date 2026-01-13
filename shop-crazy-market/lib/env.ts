import { z } from 'zod';

const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url(),
  
  // Shopify
  SHOPIFY_API_KEY: z.string().min(1).optional(),
  SHOPIFY_API_SECRET: z.string().min(1).optional(),
  SHOPIFY_SCOPES: z.string().default('read_products,write_products,read_orders,write_orders'),
  
  // App URLs
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
  SHOPIFY_APP_URL: z.string().url().optional(),
  VERCEL_URL: z.string().optional(),
  NEXT_PUBLIC_SITE_URL: z.string().url().optional(),
  
  // Encryption
  ENCRYPTION_KEY: z.string().min(32).optional(),
  
  // Email
  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().email().optional(),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_SECURE: z.string().optional(),
  
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

let cachedEnv: Env | null = null;

function getEnv(): Env {
  if (cachedEnv) {
    return cachedEnv;
  }
  
  try {
    cachedEnv = envSchema.parse(process.env);
    return cachedEnv;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missing = error.issues.map(e => {
        const path = e.path.join('.');
        return `  - ${path}: ${e.message}`;
      });
      const errorMessage = `Missing or invalid environment variables:\n${missing.join('\n')}\n\nPlease check your .env.local file or Vercel environment variables.`;
      
      // Don't throw during build time - log warning instead
      if (process.env.NEXT_PHASE === 'phase-production-build' || process.env.NODE_ENV === 'test') {
        console.warn('[ENV] Environment validation warning (build time):', errorMessage);
        // Return a partial env object for build time
        cachedEnv = process.env as any;
        return cachedEnv;
      }
      
      console.error(errorMessage);
      throw new Error(errorMessage);
    }
    throw error;
  }
}

// Lazy getter - validate on first access
export const env = new Proxy({} as Env, {
  get(target, prop) {
    const validatedEnv = getEnv();
    return validatedEnv[prop as keyof Env];
  }
});

// Helper functions for common env access patterns
export function getAppUrl(): string {
  if (env.NEXT_PUBLIC_APP_URL) {
    return env.NEXT_PUBLIC_APP_URL;
  }
  if (env.SHOPIFY_APP_URL) {
    return env.SHOPIFY_APP_URL;
  }
  if (env.VERCEL_URL) {
    return `https://${env.VERCEL_URL}`;
  }
  return 'http://localhost:3000';
}

export function isProduction(): boolean {
  return env.NODE_ENV === 'production';
}

export function isDevelopment(): boolean {
  return env.NODE_ENV === 'development';
}
