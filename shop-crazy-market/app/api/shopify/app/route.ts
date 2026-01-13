import { NextRequest } from "next/server";
import { verifyShopifyHmac } from "@/lib/platforms/shopify-oauth";
import { getAppUrl } from "@/lib/env";
import { createGetHandler } from "@/lib/api-wrapper";
import { unauthorizedResponse } from "@/lib/api-response";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/shopify/app
 * 
 * Handle direct access from Shopify admin panel
 * This route is called when users access the app from admin.shopify.com
 */
export const GET = createGetHandler(
  async (req: NextRequest) => {
    const { searchParams } = new URL(req.url);
    const shop = searchParams.get("shop");
    const hmac = searchParams.get("hmac");
    const timestamp = searchParams.get("timestamp");
    
    const appUrl = getAppUrl();
    
    // If no shop parameter, redirect to platforms page
    if (!shop) {
      return Response.redirect(`${appUrl}/seller/platforms`);
    }
    
    // Verify HMAC if present (Shopify sends this for security)
    if (hmac && timestamp) {
      const isValid = verifyShopifyHmac(searchParams);
      if (!isValid) {
        return unauthorizedResponse("Invalid HMAC verification");
      }
    }
    
    // Extract shop name (remove .myshopify.com if present)
    const shopName = shop.includes('.') ? shop.split('.')[0] : shop;
    
    // Redirect to platforms page with shop parameter
    return Response.redirect(`${appUrl}/seller/platforms?shop=${encodeURIComponent(shopName)}`);
  },
  {
    rateLimit: 'standard',
  }
);
