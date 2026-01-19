import { NextRequest, NextResponse } from "next/server";
import { getShopifyAuthUrl } from "@/lib/platforms/shopify-oauth";
import { createGetHandler } from "@/lib/api-wrapper";
import { validateQuery } from "@/lib/validate";
import { z } from "zod";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const querySchema = z.object({
  shop: z.string().min(1, "Shop parameter is required (e.g., your-store.myshopify.com or your-store)"),
  shopId: z.string().uuid("shopId must be a valid UUID"),
});

/**
 * GET /api/shopify/oauth
 * 
 * Initiate Shopify OAuth flow
 * Query params: shop (shopify store name), shopId (our shop ID)
 */
export const GET = createGetHandler(
  async (req: NextRequest) => {
    const { searchParams } = new URL(req.url);
    const { shop, shopId } = await validateQuery(querySchema, searchParams);

    // Normalize shop name - remove any protocol, www, or trailing slashes
    let normalizedShop = shop.trim();
    // Remove https:// or http:// if present
    normalizedShop = normalizedShop.replace(/^https?:\/\//, '');
    // Remove www. if present
    normalizedShop = normalizedShop.replace(/^www\./, '');
    // Remove trailing slash
    normalizedShop = normalizedShop.replace(/\/$/, '');
    // Extract just the shop name (before first dot if .myshopify.com is present)
    if (normalizedShop.includes('.myshopify.com')) {
      normalizedShop = normalizedShop.split('.myshopify.com')[0];
    } else if (normalizedShop.includes('.')) {
      // If it has dots but not .myshopify.com, take the first part
      normalizedShop = normalizedShop.split('.')[0];
    }
    // Create the full shop domain
    const shopDomain = `${normalizedShop}.myshopify.com`;

    // Generate state with shopId for verification
    const state = Buffer.from(JSON.stringify({ shopId, shop: normalizedShop })).toString('base64');

    // Generate authorization URL
    const authUrl = getShopifyAuthUrl(shopDomain, state);
    
    // Log requested scopes for debugging
    const requestedScopes = process.env.SHOPIFY_SCOPES || 'read_products,write_products,read_orders,write_orders';
    console.log('Shopify OAuth - Requested scopes:', requestedScopes);
    console.log('Shopify OAuth - Authorization URL:', authUrl);

    // Redirect to Shopify OAuth
    return NextResponse.redirect(authUrl);
  },
  {
    rateLimit: 'standard',
  }
);
