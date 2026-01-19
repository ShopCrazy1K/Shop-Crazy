import { createGetHandler } from "@/lib/api-wrapper";
import { getAppUrl } from "@/lib/env";
import { successResponse } from "@/lib/api-response";
import { getShopifyAuthUrl } from "@/lib/platforms/shopify-oauth";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/shopify/debug
 * 
 * Diagnostic endpoint to check Shopify configuration
 */
export const GET = createGetHandler(
  async () => {
    const SHOPIFY_API_KEY = process.env.SHOPIFY_API_KEY || '';
    const SHOPIFY_API_SECRET = process.env.SHOPIFY_API_SECRET || '';
    const SHOPIFY_SCOPES = process.env.SHOPIFY_SCOPES || 'read_products,write_products,read_orders,write_orders';
    
    const APP_URL = getAppUrl();
    const redirectUri = `${APP_URL}/api/shopify/oauth/callback`;
    
    const diagnostics = {
      status: 'ok' as const,
      configuration: {
        hasApiKey: !!SHOPIFY_API_KEY,
        hasApiSecret: !!SHOPIFY_API_SECRET,
        apiKeyLength: SHOPIFY_API_KEY.length,
        apiSecretLength: SHOPIFY_API_SECRET.length,
        scopes: SHOPIFY_SCOPES,
        appUrl: APP_URL,
        redirectUri: redirectUri,
        vercelUrl: process.env.VERCEL_URL || 'not set',
        nextPublicAppUrl: process.env.NEXT_PUBLIC_APP_URL || 'not set',
      },
      checks: {
        apiKeyConfigured: !!SHOPIFY_API_KEY,
        apiSecretConfigured: !!SHOPIFY_API_SECRET,
        redirectUriValid: redirectUri.startsWith('http'),
        redirectUriMatches: redirectUri.includes('/api/shopify/oauth/callback'),
      },
      instructions: {
        redirectUri: `Make sure this exact redirect URI is configured in your Shopify app settings: ${redirectUri}`,
        appUrl: `Your app URL is: ${APP_URL}`,
        note: 'If using Vercel, ensure NEXT_PUBLIC_APP_URL is set to your production domain',
      }
    };
    
    // Check for common issues
    const issues: string[] = [];
    if (!SHOPIFY_API_KEY) {
      issues.push('SHOPIFY_API_KEY is not set');
    }
    if (!SHOPIFY_API_SECRET) {
      issues.push('SHOPIFY_API_SECRET is not set');
    }
    if (!redirectUri.startsWith('https') && APP_URL !== 'http://localhost:3000') {
      issues.push('Redirect URI should use HTTPS in production');
    }
    if (!hasReadProducts) {
      issues.push('WARNING: read_products scope is missing! This will cause sync to fail. The code will auto-add it, but you should fix SHOPIFY_SCOPES in Vercel.');
    }
    
    if (issues.length > 0) {
      (diagnostics as any).status = 'issues_found';
      (diagnostics as any).issues = issues;
    }
    
    return successResponse(diagnostics, 200, undefined);
  },
  {
    rateLimit: 'lenient',
  }
);
