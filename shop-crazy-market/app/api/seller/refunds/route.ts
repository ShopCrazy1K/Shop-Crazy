import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/seller/refunds
 * Get refund requests for seller's orders
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sellerId = searchParams.get("sellerId") || req.headers.get("x-user-id");

    if (!sellerId) {
      return NextResponse.json(
        { error: "Seller ID is required" },
        { status: 401 }
      );
    }

    const status = searchParams.get("status"); // Optional filter by status

    const whereClause: any = {
      sellerId,
      refundStatus: { not: "NONE" },
    };

    if (status) {
      whereClause.refundStatus = status;
    }

    const refunds = await prisma.order.findMany({
      where: whereClause,
      include: {
        listing: {
          select: {
            id: true,
            title: true,
            images: true,
          },
        },
        user: {
          select: {
            id: true,
            email: true,
            username: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Count by status
    const counts = await prisma.order.groupBy({
      by: ["refundStatus"],
      where: {
        sellerId,
        refundStatus: { not: "NONE" },
      },
      _count: true,
    });

    const statusCounts: Record<string, number> = {};
    counts.forEach((count) => {
      statusCounts[count.refundStatus || "NONE"] = count._count;
    });

    return NextResponse.json({
      refunds,
      counts: {
        total: refunds.length,
        requested: statusCounts["REQUESTED"] || 0,
        approved: statusCounts["APPROVED"] || 0,
        processing: statusCounts["PROCESSING"] || 0,
        completed: statusCounts["COMPLETED"] || 0,
        rejected: statusCounts["REJECTED"] || 0,
      },
    });
  } catch (error: any) {
    console.error("Error fetching seller refunds:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch refunds" },
      { status: 500 }
    );
  }
}

