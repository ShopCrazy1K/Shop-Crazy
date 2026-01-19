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
    
    // Return HTML that can be embedded in Shopify iframe
    // For Shopify embedded apps, we need to serve content that works in iframe
    // Using a full-page redirect that breaks out of iframe
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Shop Crazy Market - Platform Management</title>
    <style>
        body {
            margin: 0;
            padding: 20px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #f5f5f5;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
        }
        .container {
            background: white;
            padding: 40px;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            text-align: center;
            max-width: 500px;
        }
        h1 {
            color: #333;
            margin-bottom: 20px;
        }
        p {
            color: #666;
            margin-bottom: 30px;
        }
        .button {
            display: inline-block;
            padding: 12px 24px;
            background: #7c3aed;
            color: white;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            transition: background 0.2s;
        }
        .button:hover {
            background: #6d28d9;
        }
    </style>
    <script>
        // Try to break out of iframe and redirect
        (function() {
            try {
                if (window.top !== window.self) {
                    // We're in an iframe - redirect parent window
                    window.top.location.href = '${redirectUrl}';
                } else {
                    // Not in iframe - redirect normally
                    window.location.href = '${redirectUrl}';
                }
            } catch (e) {
                // Cross-origin error - redirect self
                window.location.href = '${redirectUrl}';
            }
        })();
    </script>
</head>
<body>
    <div class="container">
        <h1>Shop Crazy Market</h1>
        <p>Redirecting to platform management...</p>
        <p>If you are not redirected automatically, click the button below:</p>
        <a href="${redirectUrl}" class="button">Go to Platform Management</a>
    </div>
</body>
</html>`;
    
    return new NextResponse(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        // Allow iframe embedding from Shopify admin
        'Content-Security-Policy': "frame-ancestors https://admin.shopify.com https://*.myshopify.com; default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';",
        // Don't use X-Frame-Options as it conflicts with CSP
      },
    });
  },
  {
    rateLimit: 'standard',
  }
);
