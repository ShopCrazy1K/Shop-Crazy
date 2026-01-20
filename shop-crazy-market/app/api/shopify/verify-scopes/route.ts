import { createGetHandler } from "@/lib/api-wrapper";
import { successResponse } from "@/lib/api-response";
import { getShopifyAuthUrl } from "@/lib/platforms/shopify-oauth";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/shopify/verify-scopes
 * 
 * Verify what scopes are being requested in OAuth URL
 */
export const GET = createGetHandler(
  async (req: Request) => {
    const { searchParams } = new URL(req.url);
    const testShop = searchParams.get('shop') || 'example.myshopify.com';
    
    try {
      // Generate a test OAuth URL to see what scopes are being requested
      const authUrl = getShopifyAuthUrl(testShop, 'test-state');
      const urlObj = new URL(authUrl);
      const requestedScopes = urlObj.searchParams.get('scope') || '';
      
      const scopeList = requestedScopes.split(',').map(s => s.trim()).filter(Boolean);
      const hasReadProducts = scopeList.includes('read_products');
      
      return successResponse({
        status: 'ok',
        requestedScopes: requestedScopes,
        scopeList: scopeList,
        hasReadProducts: hasReadProducts,
        oauthUrl: authUrl,
        message: hasReadProducts 
          ? '✅ read_products is being requested in OAuth URL' 
          : '❌ WARNING: read_products is NOT being requested in OAuth URL',
        instructions: {
          ifMissing: 'If read_products is missing, check your SHOPIFY_SCOPES environment variable in Vercel',
          nextStep: 'Make sure "Read products" permission is enabled in Shopify Partners Dashboard → App setup → Permissions',
          afterEnabling: 'You MUST uninstall and reinstall the app from your Shopify store for new permissions to take effect',
        }
      }, 200, undefined);
    } catch (error: any) {
      return successResponse({
        status: 'error',
        error: error.message,
        message: 'Failed to generate OAuth URL. Check your SHOPIFY_API_KEY configuration.'
      }, 500, undefined);
    }
  },
  {
    rateLimit: 'lenient',
  }
);
