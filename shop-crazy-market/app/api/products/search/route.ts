import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    if (!query || query.length < 2) {
      return NextResponse.json([]);
    }

    const searchTerm = query.toLowerCase().trim();

    // Search in title, description, and category
    // Note: SQLite doesn't support case-insensitive mode, so we'll use contains
    const products = await prisma.product.findMany({
      where: {
        hidden: false,
        OR: [
          {
            title: {
              contains: searchTerm,
            },
          },
          {
            description: {
              contains: searchTerm,
            },
          },
          {
            category: {
              contains: searchTerm,
            },
          },
        ],
      },
      include: {
        shop: {
          select: {
            name: true,
          },
        },
      },
      take: 20, // Limit results
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { error: "Failed to search products" },
      { status: 500 }
    );
  }
}

