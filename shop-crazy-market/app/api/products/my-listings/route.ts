import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Find the user's shop
    const shop = await prisma.shop.findFirst({
      where: { ownerId: userId },
    });

    if (!shop) {
      return NextResponse.json({ products: [], count: 0 });
    }

    // Fetch products for this shop
    const products = await prisma.product.findMany({
      where: {
        shopId: shop.id,
      },
      include: {
        shop: {
          include: {
            owner: {
              select: {
                username: true,
                email: true,
              },
            },
          },
        },
        reviews: {
          select: {
            rating: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Parse images for each product
    const productsWithParsedImages = products.map((product) => {
      let images: string[] = [];
      try {
        images = JSON.parse(product.images || "[]");
      } catch {
        images = [];
      }
      return {
        ...product,
        images,
      };
    });

    return NextResponse.json({
      products: productsWithParsedImages,
      count: products.length,
    });
  } catch (error) {
    console.error("Error fetching user listings:", error);
    return NextResponse.json(
      { error: "Failed to fetch listings" },
      { status: 500 }
    );
  }
}

