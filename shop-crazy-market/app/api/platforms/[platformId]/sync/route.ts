import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ShopifyClient, convertShopifyProduct } from "@/lib/platforms/shopify";
import { PrintifyClient, convertPrintifyProduct } from "@/lib/platforms/printify";

/**
 * POST /api/platforms/[platformId]/sync
 * 
 * Sync products from connected platform
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ platformId: string }> }
) {
  const { platformId } = await params;
  
  try {
    const { zone } = await req.json().catch(() => ({}));

    const connection = await prisma.platformConnection.findUnique({
      where: { id: platformId },
      include: { shop: true },
    });

    if (!connection || !connection.isActive) {
      return NextResponse.json(
        { error: "Platform connection not found or inactive" },
        { status: 404 }
      );
    }

    const results = {
      created: 0,
      updated: 0,
      errors: [] as string[],
    };

    if (connection.platform === "SHOPIFY") {
      // Extract store name from storeUrl or use storeName
      let storeName = connection.storeName || "";
      
      // If storeName is not set, try to extract from storeUrl
      if (!storeName && connection.storeUrl) {
        try {
          const url = new URL(connection.storeUrl);
          storeName = url.hostname.replace('.myshopify.com', '').replace('https://', '').replace('http://', '');
        } catch (e) {
          console.error("Error parsing storeUrl:", e);
        }
      }
      
      // If still no storeName, we can't proceed
      if (!storeName) {
        throw new Error("Store name is required for Shopify sync. Please reconnect your Shopify store.");
      }

      console.log(`Starting Shopify sync for store: ${storeName}`);
      console.log(`Access token present: ${!!connection.accessToken}`);
      console.log(`Access token length: ${connection.accessToken?.length || 0}`);
      
      try {
        const client = new ShopifyClient({
          accessToken: connection.accessToken,
          storeName: storeName,
        });

        console.log(`Fetching products from Shopify...`);
        const shopifyProducts = await client.getProducts(250); // Get up to 250 products
        console.log(`Fetched ${shopifyProducts.length} products from Shopify`);

      for (const shopifyProduct of shopifyProducts) {
        try {
          const productData = convertShopifyProduct(
            shopifyProduct,
            connection.shopId,
            zone || "SHOP_4_US"
          );

          // Check if listing already exists by externalProductId
          const existingListing = await prisma.listing.findFirst({
            where: {
              sellerId: connection.shop.ownerId,
              externalProductId: productData.externalProductId,
              platformConnectionId: platformId,
            },
          });

          if (existingListing) {
            // Update existing listing
            await prisma.listing.update({
              where: { id: existingListing.id },
              data: {
                title: productData.title,
                description: productData.description,
                priceCents: productData.priceCents,
                images: productData.images,
                thumbnails: productData.thumbnails,
                tags: productData.tags,
                brand: productData.brand,
                category: productData.category,
                sku: productData.sku,
                syncEnabled: productData.syncEnabled,
                lastSyncedAt: new Date(),
                updatedAt: new Date(),
              },
            });
            results.updated++;
          } else {
            // Generate slug from title
            const slug = productData.title
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, '-')
              .replace(/(^-|-$)/g, '') + '-' + Date.now();

            // Create new listing from Shopify product
            await prisma.listing.create({
              data: {
                title: productData.title,
                description: productData.description,
                slug,
                priceCents: productData.priceCents,
                currency: "usd",
                images: productData.images,
                thumbnails: productData.thumbnails,
                tags: productData.tags,
                brand: productData.brand,
                category: productData.category,
                sku: productData.sku,
                sellerId: connection.shop.ownerId,
                isDraft: productData.isDraft || false,
                platformConnectionId: platformId,
                externalProductId: productData.externalProductId,
                syncEnabled: productData.syncEnabled,
                lastSyncedAt: new Date(),
              },
            });
            results.created++;
          }
        } catch (error: any) {
          console.error(`Error syncing Shopify product ${shopifyProduct.id}:`, error);
          results.errors.push(`Product ${shopifyProduct.id}: ${error.message}`);
        }
      }
      } catch (error: any) {
        // Catch errors from ShopifyClient initialization or getProducts
        console.error('Shopify client error:', error);
        if (error.message.includes('decrypt') || error.message.includes('ENCRYPTION_KEY')) {
          throw new Error('Access token decryption failed. Please disconnect and reconnect your Shopify store. The ENCRYPTION_KEY may have changed.');
        }
        if (error.message.includes('Invalid API key') || error.message.includes('unrecognized login')) {
          throw new Error('Invalid access token. The token may have expired or been revoked. Please disconnect and reconnect your Shopify store.');
        }
        throw error;
      }
    } else if (connection.platform === "PRINTIFY") {
      const client = new PrintifyClient({
        accessToken: connection.accessToken,
        shopId: connection.storeName || "", // Printify uses shopId in storeName field
      });

      const printifyProducts = await client.getProducts();

      for (const printifyProduct of printifyProducts) {
        try {
          const productData = convertPrintifyProduct(
            printifyProduct,
            connection.shopId,
            zone || "FRESH_OUT_WORLD"
          );

          // Check if product already exists
          const existing = await prisma.product.findFirst({
            where: {
              shopId: connection.shopId,
              externalProductId: productData.externalProductId,
            },
          });

          if (existing) {
            // Update existing product
            await prisma.product.update({
              where: { id: existing.id },
              data: {
                ...productData,
                images: JSON.stringify(productData.images || []),
                lastSyncedAt: new Date(),
              },
            });
            results.updated++;
          } else {
            // Create new product
            await prisma.product.create({
              data: {
                ...productData,
                images: JSON.stringify(productData.images || []),
                platformConnectionId: platformId,
                lastSyncedAt: new Date(),
              },
            });
            results.created++;
          }
        } catch (error: any) {
          results.errors.push(`Product ${printifyProduct.id}: ${error.message}`);
        }
      }
    }

    // Update connection sync status
    await prisma.platformConnection.update({
      where: { id: platformId },
      data: { syncEnabled: true },
    });

    return NextResponse.json({
      success: true,
      results,
      message: `Synced ${results.created} new products, updated ${results.updated} existing products`,
    });
  } catch (error: any) {
    console.error("Product sync error:", error);
    
    // Try to get connection info for better error logging
    let connectionInfo = null;
    try {
      const connection = await prisma.platformConnection.findUnique({
        where: { id: platformId },
        select: { platform: true, storeName: true, storeUrl: true },
      });
      connectionInfo = connection;
    } catch (e) {
      // Ignore errors fetching connection info
    }
    
    console.error("Error details:", {
      message: error.message,
      stack: error.stack,
      connectionId: platformId,
      platform: connectionInfo?.platform,
      storeName: connectionInfo?.storeName,
      hasStoreUrl: !!connectionInfo?.storeUrl,
    });
    
    return NextResponse.json(
      { 
        error: error.message || "Failed to sync products",
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

