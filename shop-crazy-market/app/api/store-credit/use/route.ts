import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * POST /api/store-credit/use
 * Use store credit (simplified endpoint)
 */
export async function POST(req: NextRequest) {
  try {
    const { userId, creditUsed } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    if (!creditUsed || creditUsed <= 0) {
      return NextResponse.json(
        { error: "Invalid credit amount" },
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

    if (currentBalance < creditUsed) {
      return NextResponse.json(
        { 
          error: "Insufficient store credit",
          available: currentBalance,
          requested: creditUsed,
        },
        { status: 400 }
      );
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        storeCredit: { decrement: creditUsed },
      },
    });

    console.log(`[STORE CREDIT] Used ${creditUsed} cents from user ${userId}. New balance: ${currentBalance - creditUsed}`);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error using store credit:", error);
    return NextResponse.json(
      { error: error.message || "Failed to use store credit" },
      { status: 500 }
    );
  }
}

