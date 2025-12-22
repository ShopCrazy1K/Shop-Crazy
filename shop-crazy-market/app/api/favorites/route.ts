import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { productId, userId } = body;

    if (!productId || !userId) {
      return NextResponse.json(
        { error: "Product ID and user ID are required" },
        { status: 400 }
      );
    }

    // Check if already favorited
    const existing = await prisma.favorite.findFirst({
      where: {
        productId,
        userId,
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Product already in favorites" },
        { status: 400 }
      );
    }

    const favorite = await prisma.favorite.create({
      data: {
        productId,
        userId,
      },
    });

    return NextResponse.json(favorite, { status: 201 });
  } catch (error: any) {
    console.error("Error adding favorite:", error);
    return NextResponse.json(
      { error: error.message || "Failed to add favorite" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");
    const userId = searchParams.get("userId");

    if (!productId || !userId) {
      return NextResponse.json(
        { error: "Product ID and user ID are required" },
        { status: 400 }
      );
    }

    await prisma.favorite.deleteMany({
      where: {
        productId,
        userId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error removing favorite:", error);
    return NextResponse.json(
      { error: error.message || "Failed to remove favorite" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const productId = searchParams.get("productId");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID required" },
        { status: 400 }
      );
    }

    if (productId) {
      // Check if specific product is favorited
      const favorite = await prisma.favorite.findFirst({
        where: {
          productId,
          userId,
        },
      });
      return NextResponse.json({ isFavorited: !!favorite });
    }

    // Get all favorites for user
    const favorites = await prisma.favorite.findMany({
      where: { userId },
      include: {
        product: {
          include: {
            shop: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Parse images for each product
    const favoritesWithParsedImages = favorites.map((fav) => ({
      ...fav,
      product: {
        ...fav.product,
        images: (() => {
          try {
            return JSON.parse(fav.product.images || "[]");
          } catch {
            return [];
          }
        })(),
      },
    }));

    return NextResponse.json(favoritesWithParsedImages);
  } catch (error) {
    console.error("Error fetching favorites:", error);
    return NextResponse.json(
      { error: "Failed to fetch favorites" },
      { status: 500 }
    );
  }
}

