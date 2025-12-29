import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/orders - List all orders for a user (as buyer or seller)
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId") || req.headers.get("x-user-id");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 401 }
      );
    }

    // Fetch orders where user is either the buyer (userId) or seller (sellerId)
    // Exclude canceled orders (they should be deleted, but filter just in case)
    const orders = await prisma.order.findMany({
      where: {
        OR: [
          { userId: userId },
          { sellerId: userId },
        ],
        paymentStatus: {
          not: "canceled", // Exclude canceled orders
        },
      },
      include: {
        listing: {
          include: {
            seller: {
              select: {
                id: true,
                email: true,
                username: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(orders);
  } catch (error: any) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch orders" },
      { status: 500 }
    );
  }
}
