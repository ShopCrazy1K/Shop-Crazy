import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ShopifyClient } from "@/lib/platforms/shopify";
import { PrintifyClient } from "@/lib/platforms/printify";

/**
 * POST /api/webhooks/platforms
 * 
 * Handle webhooks from Shopify/Printify for real-time updates
 */
export async function POST(req: Request) {
  try {
    const { platform, event, data } = await req.json();

    if (!platform || !event) {
      return NextResponse.json(
        { error: "platform and event are required" },
        { status: 400 }
      );
    }

    // Handle Shopify webhooks
    if (platform === "SHOPIFY") {
      await handleShopifyWebhook(event, data);
    }

    // Handle Printify webhooks
    if (platform === "PRINTIFY") {
      await handlePrintifyWebhook(event, data);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("Platform webhook error:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

async function handleShopifyWebhook(event: string, data: any) {
  // Find all active Shopify connections
  const connections = await prisma.platformConnection.findMany({
    where: {
      platform: "SHOPIFY",
      isActive: true,
      syncEnabled: true,
    },
  });

  for (const connection of connections) {
    try {
      if (event === "products/create" || event === "products/update") {
        // Sync single product
        const client = new ShopifyClient({
          accessToken: connection.accessToken,
          storeName: connection.storeName || "",
        });

        const shopifyProduct = await client.getProduct(data.id.toString());
        
        // Find or update product
        const existing = await prisma.product.findFirst({
          where: {
            shopId: connection.shopId,
            externalProductId: shopifyProduct.id.toString(),
          },
        });

        if (existing) {
          await prisma.product.update({
            where: { id: existing.id },
            data: {
              title: shopifyProduct.title,
              description: shopifyProduct.body_html || "",
              price: Math.round(parseFloat(shopifyProduct.variants[0].price) * 100),
              quantity: shopifyProduct.variants[0].inventory_quantity || 0,
              images: JSON.stringify(shopifyProduct.images.map((img: any) => img.src)),
              lastSyncedAt: new Date(),
            },
          });
        }
      } else if (event === "inventory_levels/update") {
        // Update inventory for specific variant
        const product = await prisma.product.findFirst({
          where: {
            shopId: connection.shopId,
            externalProductId: data.product_id?.toString(),
          },
        });

        if (product) {
          await prisma.product.update({
            where: { id: product.id },
            data: {
              quantity: data.available || 0,
              lastSyncedAt: new Date(),
            },
          });
        }
      }
    } catch (error: any) {
      console.error(`Error handling webhook for connection ${connection.id}:`, error);
    }
  }
}

async function handlePrintifyWebhook(event: string, data: any) {
  // Find all active Printify connections
  const connections = await prisma.platformConnection.findMany({
    where: {
      platform: "PRINTIFY",
      isActive: true,
      syncEnabled: true,
    },
  });

  for (const connection of connections) {
    try {
      if (event === "product:created" || event === "product:updated") {
        // Sync single product
        const client = new PrintifyClient({
          accessToken: connection.accessToken,
          shopId: connection.storeName || "",
        });

        const printifyProduct = await client.getProduct(data.id.toString());
        
        // Find or update product
        const existing = await prisma.product.findFirst({
          where: {
            shopId: connection.shopId,
            externalProductId: printifyProduct.id.toString(),
          },
        });

        if (existing) {
          const variant = printifyProduct.variants.find((v: any) => v.is_enabled) || printifyProduct.variants[0];
          await prisma.product.update({
            where: { id: existing.id },
            data: {
              title: printifyProduct.title,
              description: printifyProduct.description || "",
              price: Math.round(variant.price * 100),
              images: JSON.stringify(printifyProduct.images.map((img: any) => img.src)),
              lastSyncedAt: new Date(),
            },
          });
        }
      }
    } catch (error: any) {
      console.error(`Error handling webhook for connection ${connection.id}:`, error);
    }
  }
}

