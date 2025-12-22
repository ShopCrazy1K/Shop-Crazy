import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Mark as dynamic to prevent static generation
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID required" },
        { status: 400 }
      );
    }

    // Find or create shop for user
    let shop = await prisma.shop.findUnique({
      where: { ownerId: userId },
      include: {
        owner: {
          select: {
            id: true,
            email: true,
            username: true,
          },
        },
        _count: {
          select: {
            products: true,
          },
        },
      },
    });

    if (!shop) {
      // Create shop if it doesn't exist
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        return NextResponse.json(
          { error: "User not found" },
          { status: 404 }
        );
      }

      shop = await prisma.shop.create({
        data: {
          name: `${user.username || user.email.split("@")[0]}'s Shop`,
          ownerId: userId,
        },
        include: {
          owner: {
            select: {
              id: true,
              email: true,
              username: true,
            },
          },
          _count: {
            select: {
              products: true,
            },
          },
        },
      });
    }

    return NextResponse.json(shop);
  } catch (error) {
    console.error("Error fetching shop:", error);
    return NextResponse.json(
      { error: "Failed to fetch shop" },
      { status: 500 }
    );
  }
}

