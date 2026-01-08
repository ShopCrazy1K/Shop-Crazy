import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/seller/orders
 * Get recent orders for seller dashboard
 */
export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    const limit = parseInt(req.nextUrl.searchParams.get("limit") || "10");

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const orders = await prisma.order.findMany({
      where: {
        sellerId: userId,
        paymentStatus: "paid",
      },
      include: {
        listing: {
          select: {
            id: true,
            title: true,
            images: true,
            priceCents: true,
          },
        },
        user: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return NextResponse.json({
      ok: true,
      orders,
    });
  } catch (error: any) {
    console.error("[SELLER ORDERS] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch orders" },
      { status: 500 }
    );
  }
}
