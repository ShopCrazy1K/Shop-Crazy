/**
 * Get the application URL consistently across the app
 * Handles VERCEL_URL (which doesn't include protocol) and NEXT_PUBLIC_APP_URL
 * Also supports SHOPIFY_APP_URL for backward compatibility
 * 
 * @deprecated Use getAppUrl from '@/lib/env' instead
 */
export function getAppUrl(): string {
  // Try to use the new env utility if available
  try {
    const { getAppUrl: getAppUrlFromEnv } = require('@/lib/env');
    return getAppUrlFromEnv();
  } catch {
    // Fallback to direct env access
    if (process.env.NEXT_PUBLIC_APP_URL) {
      return process.env.NEXT_PUBLIC_APP_URL;
    }
    if (process.env.SHOPIFY_APP_URL) {
      return process.env.SHOPIFY_APP_URL;
    }
    if (process.env.VERCEL_URL) {
      return `https://${process.env.VERCEL_URL}`;
    }
    return 'http://localhost:3000';
  }
}
