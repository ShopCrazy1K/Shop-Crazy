// Shopify OAuth utilities
import crypto from 'crypto';

const SHOPIFY_API_KEY = process.env.SHOPIFY_API_KEY || '';
const SHOPIFY_API_SECRET = process.env.SHOPIFY_API_SECRET || '';
const SHOPIFY_SCOPES = process.env.SHOPIFY_SCOPES || 'read_products,write_products,read_orders,write_orders';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL || 'http://localhost:3000';

/**
 * Generate Shopify OAuth authorization URL
 */
export function getShopifyAuthUrl(shop: string, state?: string): string {
  if (!SHOPIFY_API_KEY) {
    throw new Error('SHOPIFY_API_KEY is not configured');
  }

  const redirectUri = `${APP_URL}/api/shopify/oauth/callback`;
  const scopes = SHOPIFY_SCOPES;
  const nonce = state || crypto.randomBytes(16).toString('hex');

  const params = new URLSearchParams({
    client_id: SHOPIFY_API_KEY,
    scope: scopes,
    redirect_uri: redirectUri,
    state: nonce,
  });

  return `https://${shop}/admin/oauth/authorize?${params.toString()}`;
}

/**
 * Verify Shopify OAuth HMAC
 */
export function verifyShopifyHmac(query: URLSearchParams): boolean {
  if (!SHOPIFY_API_SECRET) {
    throw new Error('SHOPIFY_API_SECRET is not configured');
  }

  const hmac = query.get('hmac');
  if (!hmac) return false;

  // Remove hmac and signature from params
  const params = new URLSearchParams(query);
  params.delete('hmac');
  params.delete('signature');

  // Sort and stringify
  const sortedParams = Array.from(params.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join('&');

  // Calculate HMAC
  const calculatedHmac = crypto
    .createHmac('sha256', SHOPIFY_API_SECRET)
    .update(sortedParams)
    .digest('hex');

  return calculatedHmac === hmac;
}

/**
 * Exchange authorization code for access token
 */
export async function exchangeCodeForToken(
  shop: string,
  code: string
): Promise<{ access_token: string; scope: string }> {
  if (!SHOPIFY_API_KEY || !SHOPIFY_API_SECRET) {
    throw new Error('Shopify API credentials are not configured');
  }

  const response = await fetch(`https://${shop}/admin/oauth/access_token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      client_id: SHOPIFY_API_KEY,
      client_secret: SHOPIFY_API_SECRET,
      code,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to exchange code for token: ${error}`);
  }

  return response.json();
}

/**
 * Get shop information from Shopify
 */
export async function getShopInfo(shop: string, accessToken: string): Promise<{
  name: string;
  domain: string;
  email: string;
}> {
  const response = await fetch(`https://${shop}/admin/api/2024-01/shop.json`, {
    headers: {
      'X-Shopify-Access-Token': accessToken,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch shop information');
  }

  const data = await response.json();
  return {
    name: data.shop.name,
    domain: data.shop.domain,
    email: data.shop.email,
  };
}
