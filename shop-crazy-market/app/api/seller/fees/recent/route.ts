import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/seller/fees/recent
 * 
 * Get recent fee transactions for a seller's shop
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const shopId = searchParams.get("shopId");
    const limit = parseInt(searchParams.get("limit") || "20");

    if (!shopId) {
      return NextResponse.json(
        { error: "shopId is required" },
        { status: 400 }
      );
    }

    const fees = await prisma.feeTransaction.findMany({
      where: {
        shopId,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
      include: {
        order: {
          select: {
            id: true,
            createdAt: true,
          },
        },
      },
    });

    return NextResponse.json({
      fees: fees.map((fee) => ({
        id: fee.id,
        type: fee.type,
        amount: fee.amount,
        description: fee.description || `${fee.type} fee`,
        createdAt: fee.createdAt.toISOString(),
        orderId: fee.orderId,
      })),
    });
  } catch (error: any) {
    console.error("Error fetching recent fees:", error);
    return NextResponse.json(
      { error: "Failed to fetch recent fees" },
      { status: 500 }
    );
  }
}

