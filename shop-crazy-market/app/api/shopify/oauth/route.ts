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

    // Normalize shop name (add .myshopify.com if not present)
    const normalizedShop = shop.includes('.') ? shop.split('.')[0] : shop;
    const shopDomain = `${normalizedShop}.myshopify.com`;

    // Generate state with shopId for verification
    const state = Buffer.from(JSON.stringify({ shopId, shop: normalizedShop })).toString('base64');

    // Generate authorization URL
    const authUrl = getShopifyAuthUrl(shopDomain, state);

    // Redirect to Shopify OAuth
    return NextResponse.redirect(authUrl);
  },
  {
    rateLimit: 'standard',
  }
);
