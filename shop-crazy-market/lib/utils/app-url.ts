/**
 * Get the application URL consistently across the app
 * Handles VERCEL_URL (which doesn't include protocol) and NEXT_PUBLIC_APP_URL
 * Also supports SHOPIFY_APP_URL for backward compatibility
 */
export function getAppUrl(): string {
  // Check NEXT_PUBLIC_APP_URL first (preferred)
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }
  // Check SHOPIFY_APP_URL for backward compatibility
  if (process.env.SHOPIFY_APP_URL) {
    return process.env.SHOPIFY_APP_URL;
  }
  // Check VERCEL_URL (doesn't include protocol)
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return 'http://localhost:3000';
}
