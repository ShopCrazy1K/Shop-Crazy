import { NextRequest, NextResponse } from "next/server";
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
 * Returns HTML that can be embedded in an iframe (Shopify loads apps in iframes)
 */
export const GET = createGetHandler(
  async (req: NextRequest) => {
    const { searchParams } = new URL(req.url);
    const shop = searchParams.get("shop");
    const hmac = searchParams.get("hmac");
    const timestamp = searchParams.get("timestamp");
    
    const appUrl = getAppUrl();
    
    // Verify HMAC if present (Shopify sends this for security)
    if (hmac && timestamp) {
      const isValid = verifyShopifyHmac(searchParams);
      if (!isValid) {
        return unauthorizedResponse("Invalid HMAC verification");
      }
    }
    
    // Extract shop name (remove .myshopify.com if present)
    const shopName = shop ? (shop.includes('.') ? shop.split('.')[0] : shop) : '';
    const redirectUrl = shopName 
      ? `${appUrl}/seller/platforms?shop=${encodeURIComponent(shopName)}`
      : `${appUrl}/seller/platforms`;
    
    // Return HTML that redirects using JavaScript (works in iframes)
    // Also includes meta refresh as fallback
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="refresh" content="0;url=${redirectUrl}">
    <title>Redirecting...</title>
    <script>
        // Immediate redirect for iframe compatibility
        if (window.top !== window.self) {
            // We're in an iframe - try to redirect parent or self
            try {
                window.top.location.href = '${redirectUrl}';
            } catch (e) {
                // Cross-origin iframe - redirect self
                window.location.href = '${redirectUrl}';
            }
        } else {
            // Not in iframe - normal redirect
            window.location.href = '${redirectUrl}';
        }
    </script>
</head>
<body>
    <p>Redirecting to your platform management page...</p>
    <p>If you are not redirected automatically, <a href="${redirectUrl}">click here</a>.</p>
</body>
</html>`;
    
    return new NextResponse(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        // Allow iframe embedding from Shopify
        'X-Frame-Options': 'ALLOW-FROM https://admin.shopify.com',
        'Content-Security-Policy': "frame-ancestors https://admin.shopify.com https://*.myshopify.com;",
      },
    });
  },
  {
    rateLimit: 'standard',
  }
);
