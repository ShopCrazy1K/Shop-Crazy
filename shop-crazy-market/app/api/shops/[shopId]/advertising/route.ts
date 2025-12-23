import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * PUT /api/shops/[shopId]/advertising
 * 
 * Toggle advertising opt-in/opt-out for a shop
 */
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ shopId: string }> }
) {
  try {
    const { enabled } = await req.json();
    const { shopId } = await params;

    if (typeof enabled !== "boolean") {
      return NextResponse.json(
        { error: "enabled must be a boolean" },
        { status: 400 }
      );
    }

    const shop = await prisma.shop.update({
      where: { id: shopId },
      data: { hasAdvertising: enabled },
      select: {
        id: true,
        name: true,
        hasAdvertising: true,
      },
    });

    return NextResponse.json({
      success: true,
      shop,
      message: enabled
        ? "Advertising enabled. Your products will have enhanced visibility with a 15% advertising fee."
        : "Advertising disabled. Your products will use standard visibility.",
    });
  } catch (error: any) {
    console.error("Error updating advertising setting:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update advertising setting" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/shops/[shopId]/advertising
 * 
 * Get current advertising status
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ shopId: string }> }
) {
  try {
    const { shopId } = await params;

    const shop = await prisma.shop.findUnique({
      where: { id: shopId },
      select: {
        id: true,
        name: true,
        hasAdvertising: true,
      },
    });

    if (!shop) {
      return NextResponse.json(
        { error: "Shop not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      hasAdvertising: shop.hasAdvertising,
      shop,
    });
  } catch (error: any) {
    console.error("Error fetching advertising status:", error);
    return NextResponse.json(
      { error: "Failed to fetch advertising status" },
      { status: 500 }
    );
  }
}

