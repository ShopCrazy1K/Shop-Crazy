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
  { params }: { params: { platformId: string } }
) {
  try {
    const platformId = params.platformId;
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
      const client = new ShopifyClient({
        accessToken: connection.accessToken,
        storeName: connection.storeName || "",
      });

      const shopifyProducts = await client.getProducts();

      for (const shopifyProduct of shopifyProducts) {
        try {
          const productData = convertShopifyProduct(
            shopifyProduct,
            connection.shopId,
            zone || "SHOP_4_US"
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
          results.errors.push(`Product ${shopifyProduct.id}: ${error.message}`);
        }
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
    return NextResponse.json(
      { error: error.message || "Failed to sync products" },
      { status: 500 }
    );
  }
}

