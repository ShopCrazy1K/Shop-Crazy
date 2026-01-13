import { NextResponse } from "next/server";
import { getShopifyAuthUrlWithAuthCallback } from "@/lib/platforms/shopify-oauth";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/shopify/auth
 * 
 * Alternative OAuth initiation route that uses /api/shopify/auth/callback
 * This matches the pattern: /api/shopify/auth/callback
 * 
 * Usage: /api/shopify/auth?shop=press-go-transfers.myshopify.com&shopId=your-shop-id
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const shop = searchParams.get("shop");
    const shopId = searchParams.get("shopId");

    if (!shop) {
      return NextResponse.json(
        { error: "Shop parameter is required (e.g., press-go-transfers.myshopify.com)" },
        { status: 400 }
      );
    }

    if (!shopId) {
      return NextResponse.json(
        { error: "shopId parameter is required" },
        { status: 400 }
      );
    }

    // Normalize shop name (add .myshopify.com if not present)
    const normalizedShop = shop.includes('.') ? shop.split('.')[0] : shop;
    const shopDomain = `${normalizedShop}.myshopify.com`;

    // Generate state with shopId for verification
    const state = Buffer.from(JSON.stringify({ shopId, shop: normalizedShop })).toString('base64');

    // Generate authorization URL with /api/shopify/auth/callback path
    const authUrl = getShopifyAuthUrlWithAuthCallback(shopDomain, state);

    // Redirect to Shopify OAuth
    return NextResponse.redirect(authUrl);
  } catch (error: any) {
    console.error("Shopify OAuth initiation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to initiate Shopify OAuth" },
      { status: 500 }
    );
  }
}
