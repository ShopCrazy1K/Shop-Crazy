import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      title,
      description,
      price,
      quantity,
      category,
      type,
      condition,
      zone,
      images,
      digitalFileUrls, // Array of digital file URLs for digital products
      userId, // Get userId from request body (sent from client)
    } = body;

    // Validate userId
    if (!userId) {
      return NextResponse.json(
        { error: "User ID required. Please log in." },
        { status: 401 }
      );
    }

    // Validate required fields
    if (!title || !description || !price) {
      return NextResponse.json(
        { error: "Title, description, and price are required" },
        { status: 400 }
      );
    }

    // Find or create shop for user
    let shop = await prisma.shop.findFirst({
      where: { ownerId: userId },
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
          name: `${user.username || user.email}'s Shop`,
          ownerId: userId,
        },
      });
    }

    // For digital products, combine digitalFileUrls with images
    // digitalFileUrls come first (the actual files), then preview images
    let finalImages = images && Array.isArray(images) ? images : [];
    
    if (type === "DIGITAL" && digitalFileUrls && Array.isArray(digitalFileUrls)) {
      // Digital files go first, then preview images
      finalImages = [...digitalFileUrls, ...finalImages.filter(url => !digitalFileUrls.includes(url))];
    }

    // Create product
    const product = await prisma.product.create({
      data: {
        title,
        description,
        price: parseInt(price),
        quantity: quantity ? parseInt(quantity) : 1,
        category: category || null,
        type: type || "PHYSICAL",
        condition: condition || "NEW",
        zone: zone || "SHOP_4_US",
        images: JSON.stringify(finalImages),
        shopId: shop.id,
      },
    });

    return NextResponse.json(product);
  } catch (error: any) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create product" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const zone = searchParams.get("zone");
    const category = searchParams.get("category");
    const type = searchParams.get("type");
    const trending = searchParams.get("trending");
    const search = searchParams.get("search");

    const where: any = {
      hidden: false, // Only show non-hidden products
    };

    if (zone) {
      where.zone = zone;
    }

    if (category) {
      where.category = category;
    }

    if (type) {
      where.type = type;
    }

    // Search functionality
    if (search && search.length >= 2) {
      const searchTerm = search.trim();
      // Note: SQLite doesn't support case-insensitive mode
      where.OR = [
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
      ];
    }

    const products = await prisma.product.findMany({
      where,
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
      orderBy: trending === "true" 
        ? { createdAt: "desc" } // For trending, show newest first
        : { createdAt: "desc" },
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

