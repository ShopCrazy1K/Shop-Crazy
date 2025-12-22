import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

/**
 * POST /api/platforms/connect
 * 
 * Connect a platform (Shopify/Printify) to a shop
 */
export async function POST(req: Request) {
  try {
    const { shopId, platform, accessToken, storeName, storeUrl } = await req.json();

    if (!shopId || !platform || !accessToken) {
      return NextResponse.json(
        { error: "shopId, platform, and accessToken are required" },
        { status: 400 }
      );
    }

    if (!["SHOPIFY", "PRINTIFY"].includes(platform)) {
      return NextResponse.json(
        { error: "Platform must be SHOPIFY or PRINTIFY" },
        { status: 400 }
      );
    }

    // Check if connection already exists
    const existing = await prisma.platformConnection.findUnique({
      where: {
        shopId_platform: {
          shopId,
          platform: platform as any,
        },
      },
    });

    if (existing) {
      // Update existing connection
      const connection = await prisma.platformConnection.update({
        where: { id: existing.id },
        data: {
          accessToken, // In production, encrypt this
          storeName,
          storeUrl,
          isActive: true,
        },
      });

      return NextResponse.json({
        success: true,
        connection: {
          id: connection.id,
          platform: connection.platform,
          storeName: connection.storeName,
          isActive: connection.isActive,
        },
      });
    }

    // Create new connection
    const connection = await prisma.platformConnection.create({
      data: {
        shopId,
        platform: platform as any,
        accessToken, // In production, encrypt this
        storeName,
        storeUrl,
        isActive: true,
      },
    });

    return NextResponse.json({
      success: true,
      connection: {
        id: connection.id,
        platform: connection.platform,
        storeName: connection.storeName,
        isActive: connection.isActive,
      },
    });
  } catch (error: any) {
    console.error("Platform connection error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to connect platform" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/platforms/connect
 * 
 * Get platform connections for a shop
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const shopId = searchParams.get("shopId");

    if (!shopId) {
      return NextResponse.json(
        { error: "shopId is required" },
        { status: 400 }
      );
    }

    const connections = await prisma.platformConnection.findMany({
      where: { shopId, isActive: true },
      select: {
        id: true,
        platform: true,
        storeName: true,
        storeUrl: true,
        syncEnabled: true,
        createdAt: true,
        _count: {
          select: {
            products: true,
          },
        },
      },
    });

    return NextResponse.json({ connections });
  } catch (error: any) {
    console.error("Error fetching platform connections:", error);
    return NextResponse.json(
      { error: "Failed to fetch platform connections" },
      { status: 500 }
    );
  }
}

