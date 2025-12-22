import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const shopId = searchParams.get("shopId");

    if (!shopId) {
      return NextResponse.json(
        { error: "Shop ID is required" },
        { status: 400 }
      );
    }

    const strikes = await prisma.sellerStrike.findMany({
      where: { sellerId: shopId },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(strikes);
  } catch (error: any) {
    console.error("Error fetching strikes:", error);
    return NextResponse.json(
      { error: "Failed to fetch strikes" },
      { status: 500 }
    );
  }
}

