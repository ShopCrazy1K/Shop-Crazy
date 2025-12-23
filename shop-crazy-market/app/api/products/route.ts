import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('[API] Creating product, body keys:', Object.keys(body));
    
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

    console.log('[API] userId:', userId ? 'present' : 'missing');
    console.log('[API] title:', title);
    console.log('[API] type:', type);

    // Validate userId
    if (!userId) {
      console.error('[API] Missing userId');
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
    console.log('[API] Finding or creating shop for userId:', userId);
    let shop;
    try {
      shop = await prisma.shop.findFirst({
        where: { ownerId: userId },
      });
      console.log('[API] Shop found:', shop ? 'yes' : 'no');

      if (!shop) {
        // Create shop if it doesn't exist
        console.log('[API] Creating new shop...');
        const user = await prisma.user.findUnique({
          where: { id: userId },
        });

        if (!user) {
          console.error('[API] User not found:', userId);
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
        console.log('[API] Shop created:', shop.id);
      }
    } catch (shopError: any) {
      console.error('[API] Error with shop:', shopError);
      throw new Error(`Shop error: ${shopError.message}`);
    }

    // For digital products, combine digitalFileUrls with images
    // digitalFileUrls come first (the actual files), then preview images
    let finalImages = images && Array.isArray(images) ? images : [];
    
    if (type === "DIGITAL" && digitalFileUrls && Array.isArray(digitalFileUrls)) {
      // Digital files go first, then preview images
      finalImages = [...digitalFileUrls, ...finalImages.filter(url => !digitalFileUrls.includes(url))];
    }

    // Create product
    console.log('[API] Creating product with shopId:', shop.id);
    console.log('[API] Final images count:', finalImages.length);
    
    const productData = {
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
    };
    
    console.log('[API] Product data:', {
      ...productData,
      images: `[${finalImages.length} images]`,
    });
    
    const product = await prisma.product.create({
      data: productData,
    });

    console.log('[API] Product created successfully:', product.id);
    return NextResponse.json(product);
  } catch (error: any) {
    console.error("[API] Error creating product:", error);
    console.error("[API] Error stack:", error.stack);
    console.error("[API] Error name:", error.name);
    
    // Provide more detailed error message
    let errorMessage = error.message || "Failed to create product";
    
    // Check for specific Prisma errors
    if (error.code === 'P2002') {
      errorMessage = "A product with this information already exists";
    } else if (error.code === 'P2003') {
      errorMessage = "Invalid reference (shop or user not found)";
    } else if (error.message?.includes('pattern')) {
      errorMessage = "Database connection error. Please try again.";
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
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

