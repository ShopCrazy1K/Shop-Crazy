import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * POST /api/users/[userId]/store-credit/use
 * Use store credit for an order
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const body = await req.json();
    const { amountCents, orderId } = body;

    if (!amountCents || amountCents <= 0) {
      return NextResponse.json(
        { error: "Invalid amount" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, storeCredit: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const currentBalance = user.storeCredit || 0;

    if (currentBalance < amountCents) {
      return NextResponse.json(
        { 
          error: "Insufficient store credit",
          available: currentBalance,
          requested: amountCents,
        },
        { status: 400 }
      );
    }

    const newBalance = currentBalance - amountCents;

    // Update user's store credit
    await prisma.user.update({
      where: { id: userId },
      data: {
        storeCredit: newBalance,
      },
    });

    // Update order with store credit used (if orderId provided)
    if (orderId) {
      await prisma.order.update({
        where: { id: orderId },
        data: {
          storeCreditUsedCents: amountCents,
        },
      });
    }

    console.log(`[STORE CREDIT] Used ${amountCents} cents from user ${userId}. Order: ${orderId || 'N/A'}. New balance: ${newBalance}`);

    return NextResponse.json({
      success: true,
      storeCredit: newBalance,
      storeCreditDollars: newBalance / 100,
      used: amountCents,
      usedDollars: amountCents / 100,
    });
  } catch (error: any) {
    console.error("Error using store credit:", error);
    return NextResponse.json(
      { error: error.message || "Failed to use store credit" },
      { status: 500 }
    );
  }
}

