import { NextResponse } from "next/server";
import { verifyShopifyHmac, exchangeCodeForToken, getShopInfo } from "@/lib/platforms/shopify-oauth";
import { encrypt } from "@/lib/encryption";
import { prisma } from "@/lib/prisma";
import { getAppUrl } from "@/lib/utils/app-url";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/shopify/auth/callback
 * 
 * Handle Shopify OAuth callback (alias for /api/shopify/oauth/callback)
 * This route exists for compatibility with code that uses /api/shopify/auth/callback
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    
    const appUrl = getAppUrl();
    
    // Verify HMAC
    if (!verifyShopifyHmac(searchParams)) {
      return NextResponse.redirect(
        `${appUrl}/seller/platforms?error=invalid_hmac`
      );
    }

    const code = searchParams.get("code");
    const shop = searchParams.get("shop");
    const state = searchParams.get("state");

    if (!code || !shop || !state) {
      return NextResponse.redirect(
        `${appUrl}/seller/platforms?error=missing_params`
      );
    }

    // Decode state to get shopId
    let shopId: string;
    let normalizedShop: string;
    try {
      const stateData = JSON.parse(Buffer.from(state, 'base64').toString('utf-8'));
      shopId = stateData.shopId;
      normalizedShop = stateData.shop || shop.split('.')[0];
    } catch (error) {
      return NextResponse.redirect(
        `${appUrl}/seller/platforms?error=invalid_state`
      );
    }

    // Exchange code for access token
    const tokenData = await exchangeCodeForToken(shop, code);
    const accessToken = tokenData.access_token;

    // Get shop information
    const shopInfo = await getShopInfo(shop, accessToken);

    // Encrypt access token
    const encryptedToken = encrypt(accessToken);

    // Check if connection already exists
    const existing = await prisma.platformConnection.findUnique({
      where: {
        shopId_platform: {
          shopId,
          platform: "SHOPIFY",
        },
      },
    });

    if (existing) {
      // Update existing connection
      await prisma.platformConnection.update({
        where: { id: existing.id },
        data: {
          accessToken: encryptedToken,
          storeName: shopInfo.name,
          storeUrl: `https://${shopInfo.domain}`,
          isActive: true,
        },
      });
    } else {
      // Create new connection
      await prisma.platformConnection.create({
        data: {
          shopId,
          platform: "SHOPIFY",
          accessToken: encryptedToken,
          storeName: shopInfo.name,
          storeUrl: `https://${shopInfo.domain}`,
          isActive: true,
          syncEnabled: false,
        },
      });
    }

    // Redirect back to platforms page with success
    return NextResponse.redirect(
      `${appUrl}/seller/platforms?success=connected&platform=shopify`
    );
  } catch (error: any) {
    console.error("Shopify OAuth callback error:", error);
    const appUrl = getAppUrl();
    return NextResponse.redirect(
      `${appUrl}/seller/platforms?error=${encodeURIComponent(error.message || 'oauth_failed')}`
    );
  }
}
