import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/shopify/debug
 * 
 * Diagnostic endpoint to check Shopify configuration
 */
export async function GET(req: Request) {
  try {
    const SHOPIFY_API_KEY = process.env.SHOPIFY_API_KEY || '';
    const SHOPIFY_API_SECRET = process.env.SHOPIFY_API_SECRET || '';
    const SHOPIFY_SCOPES = process.env.SHOPIFY_SCOPES || 'read_products,write_products,read_orders,write_orders';
    
    // Import the utility function
    const { getAppUrl } = await import('@/lib/utils/app-url');
    const APP_URL = getAppUrl();
    const redirectUri = `${APP_URL}/api/shopify/oauth/callback`;
    
    const diagnostics = {
      status: 'ok',
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
    
    if (issues.length > 0) {
      diagnostics.status = 'issues_found';
      (diagnostics as any).issues = issues;
    }
    
    return NextResponse.json(diagnostics, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      }
    });
  } catch (error: any) {
    return NextResponse.json(
      { 
        status: 'error',
        error: error.message || 'Unknown error',
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
