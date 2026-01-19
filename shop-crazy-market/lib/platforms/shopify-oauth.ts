// Shopify OAuth utilities
import crypto from 'crypto';
import { getAppUrl } from '@/lib/env';

// Lazy getters to avoid accessing env at module load time
function getShopifyApiKey(): string {
  return process.env.SHOPIFY_API_KEY || '';
}

function getShopifyApiSecret(): string {
  return process.env.SHOPIFY_API_SECRET || '';
}

function getShopifyScopes(): string {
  const envScopes = process.env.SHOPIFY_SCOPES || 'read_products,write_products,read_orders,write_orders';
  
  // Always ensure read_products is included (required for product sync)
  const scopeList = envScopes.split(',').map(s => s.trim()).filter(Boolean);
  
  // Add read_products if not present
  if (!scopeList.includes('read_products')) {
    console.warn('[Shopify OAuth] read_products scope missing from SHOPIFY_SCOPES, adding it automatically');
    scopeList.unshift('read_products'); // Add to beginning
  }
  
  // Ensure other essential scopes are present
  const essentialScopes = ['write_products', 'read_orders', 'write_orders'];
  essentialScopes.forEach(scope => {
    if (!scopeList.includes(scope)) {
      console.warn(`[Shopify OAuth] ${scope} scope missing from SHOPIFY_SCOPES, adding it automatically`);
      scopeList.push(scope);
    }
  });
  
  return scopeList.join(',');
}

/**
 * Generate Shopify OAuth authorization URL
 * @param shop - Shopify store domain (e.g., "press-go-transfers.myshopify.com")
 * @param state - Optional state parameter for OAuth flow
 * @param callbackPath - Optional custom callback path (defaults to "/api/shopify/oauth/callback")
 */
export function getShopifyAuthUrl(
  shop: string, 
  state?: string, 
  callbackPath: string = '/api/shopify/oauth/callback'
): string {
  const apiKey = getShopifyApiKey();
  if (!apiKey) {
    throw new Error('SHOPIFY_API_KEY is not configured');
  }

  const redirectUri = `${getAppUrl()}${callbackPath}`;
  const scopes = getShopifyScopes();
  const nonce = state || crypto.randomBytes(16).toString('hex');

  const params = new URLSearchParams({
    client_id: apiKey,
    scope: scopes,
    redirect_uri: redirectUri,
    state: nonce,
  });

  return `https://${shop}/admin/oauth/authorize?${params.toString()}`;
}

/**
 * Generate Shopify OAuth authorization URL with /api/shopify/auth/callback path
 * This is a convenience function for code that uses the /auth/callback path
 */
export function getShopifyAuthUrlWithAuthCallback(shop: string, state?: string): string {
  return getShopifyAuthUrl(shop, state, '/api/shopify/auth/callback');
}

/**
 * Verify Shopify OAuth HMAC
 */
export function verifyShopifyHmac(query: URLSearchParams): boolean {
  const apiSecret = getShopifyApiSecret();
  if (!apiSecret) {
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
    .createHmac('sha256', apiSecret)
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
  const apiKey = getShopifyApiKey();
  const apiSecret = getShopifyApiSecret();
  
  if (!apiKey || !apiSecret) {
    throw new Error('Shopify API credentials are not configured');
  }

  const response = await fetch(`https://${shop}/admin/oauth/access_token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      client_id: apiKey,
      client_secret: apiSecret,
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
