import { NextResponse } from "next/server";
import { verifyShopifyHmac, exchangeCodeForToken, getShopInfo } from "@/lib/platforms/shopify-oauth";
import { encrypt } from "@/lib/encryption";
import { prisma } from "@/lib/prisma";
import { getAppUrl } from "@/lib/utils/app-url";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/shopify/oauth/callback
 * 
 * Handle Shopify OAuth callback
 */
export async function GET(req: Request) {
  const appUrl = getAppUrl();
  
  try {
    const { searchParams } = new URL(req.url);
    
    // Check for OAuth errors from Shopify first
    const error = searchParams.get("error");
    const errorDescription = searchParams.get("error_description");
    if (error) {
      console.error("Shopify OAuth error:", error, errorDescription);
      return NextResponse.redirect(
        `${appUrl}/seller/platforms?error=${encodeURIComponent(error)}&description=${encodeURIComponent(errorDescription || '')}`
      );
    }
    
    // Verify HMAC (log if verification fails for debugging)
    const hmac = searchParams.get("hmac");
    if (hmac) {
      const isValid = verifyShopifyHmac(searchParams);
      if (!isValid) {
        console.error("HMAC verification failed", {
          shop: searchParams.get("shop"),
          hasHmac: !!hmac,
          params: Object.fromEntries(searchParams.entries())
        });
        return NextResponse.redirect(
          `${appUrl}/seller/platforms?error=invalid_hmac`
        );
      }
    } else {
      // HMAC is optional for some Shopify flows, but log it
      console.warn("No HMAC in OAuth callback", {
        shop: searchParams.get("shop"),
        params: Object.fromEntries(searchParams.entries())
      });
    }

    const code = searchParams.get("code");
    const shop = searchParams.get("shop");
    const state = searchParams.get("state");

    if (!code || !shop || !state) {
      console.error("Missing required OAuth parameters", {
        hasCode: !!code,
        hasShop: !!shop,
        hasState: !!state,
        params: Object.fromEntries(searchParams.entries())
      });
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

    // Extract shop domain name (e.g., "shopcrazymarket" from "shopcrazymarket.myshopify.com")
    const shopDomain = normalizedShop || shop.split('.')[0];
    
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
          storeName: shopDomain, // Use shop domain, not display name, for API calls
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
          storeName: shopDomain, // Use shop domain, not display name, for API calls
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
    console.error("Error details:", {
      message: error.message,
      stack: error.stack,
      code: error.code,
      statusCode: error.statusCode,
    });
    
    // Provide more detailed error messages
    let errorMessage = 'oauth_failed';
    if (error.message?.includes('redirect_uri_mismatch')) {
      errorMessage = 'redirect_uri_mismatch';
    } else if (error.message?.includes('invalid_request')) {
      errorMessage = 'invalid_request';
    } else if (error.message?.includes('access_denied')) {
      errorMessage = 'access_denied';
    } else if (error.message) {
      errorMessage = encodeURIComponent(error.message.substring(0, 100));
    }
    
    return NextResponse.redirect(
      `${appUrl}/seller/platforms?error=${errorMessage}`
    );
  }
}
