import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Helper to safely execute Prisma queries with pattern error handling
async function safePrismaQuery<T>(
  queryFn: () => Promise<T>,
  errorContext: string
): Promise<T> {
  try {
    return await queryFn();
  } catch (error: any) {
    const errorMessage = error.message || String(error);
    
    // Check for pattern validation errors
    if (errorMessage.includes('pattern') || errorMessage.includes('expected')) {
      console.error(`[API] Pattern error in ${errorContext}:`, errorMessage);
      throw new Error(
        `Database connection error. The database URL format is invalid. ` +
        `Please check your Vercel environment variables. ` +
        `Context: ${errorContext}`
      );
    }
    
    // Re-throw other errors
    throw error;
  }
}

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
    console.log('[API] DATABASE_URL check:', {
      present: !!process.env.DATABASE_URL,
      length: process.env.DATABASE_URL?.length || 0,
      startsWith: process.env.DATABASE_URL?.substring(0, 20) || 'none',
    });
    
    let shop;
    try {
      // Try to use Prisma - this will trigger client creation
      // If it fails, we'll catch the error and provide helpful feedback
      console.log('[API] Attempting to use Prisma (this will create client if needed)...');
      
      // Just try a simple query - this will trigger PrismaClient creation
      // and catch any URL validation errors
      try {
        // Test with a simple query that doesn't require connection
        // Actually, let's just try to find the shop - if PrismaClient creation fails,
        // it will throw an error before the query
        shop = await safePrismaQuery(
          () => prisma.shop.findFirst({
            where: { ownerId: userId },
          }),
          'finding shop (first attempt)'
        );
        console.log('[API] ✅ Prisma query successful, shop found:', shop ? 'yes' : 'no');
      } catch (prismaError: any) {
        const errorMsg = prismaError.message || String(prismaError);
        console.error('[API] ❌ Prisma error:', errorMsg);
        console.error('[API] Error type:', prismaError.constructor?.name);
        console.error('[API] Error code:', prismaError.code);
        console.error('[API] Error stack:', prismaError.stack?.substring(0, 500));
        
        // Check for pattern validation errors
        if (errorMsg.includes('pattern') || errorMsg.includes('expected') || errorMsg.includes('string did not match')) {
          console.error('[API] Pattern validation error detected!');
          console.error('[API] This means DATABASE_URL format is invalid');
          console.error('[API] Visit /api/debug-database-url to see what Prisma is receiving');
          
          return NextResponse.json(
            { 
              error: "Database connection error. The database URL format is invalid.",
              details: "The DATABASE_URL in Vercel does not match Prisma's expected format.",
              suggestion: "Please check your Vercel environment variables. Use the direct connection URL: postgresql://postgres:PASSWORD@db.hbufjpxdzmygjnbfsniu.supabase.co:5432/postgres",
              debugUrl: "/api/debug-database-url",
              testUrl: "/api/test-prisma-connection",
            },
            { status: 500 }
          );
        }
        
        // Check for authentication errors
        if (errorMsg.includes('authentication') || errorMsg.includes('password') || errorMsg.includes('credentials')) {
          return NextResponse.json(
            { 
              error: "Database authentication failed.",
              details: "The database credentials are incorrect.",
              suggestion: "Please check your DATABASE_URL password in Vercel environment variables.",
            },
            { status: 500 }
          );
        }
        
        // Check for connection errors
        if (errorMsg.includes('ECONNREFUSED') || errorMsg.includes("Can't reach") || errorMsg.includes('timeout')) {
          return NextResponse.json(
            { 
              error: "Cannot connect to database server.",
              details: "The database server is not reachable.",
              suggestion: "Please check your DATABASE_URL host and port in Vercel environment variables.",
            },
            { status: 500 }
          );
        }
        
        // Re-throw if it's not a known error type
        throw prismaError;
      }
      
      shop = await safePrismaQuery(
        () => prisma.shop.findFirst({
          where: { ownerId: userId },
        }),
        'finding shop'
      );
      console.log('[API] Shop found:', shop ? 'yes' : 'no');

      if (!shop) {
        // Create shop if it doesn't exist
        console.log('[API] Creating new shop...');
        const user = await safePrismaQuery(
          () => prisma.user.findUnique({
            where: { id: userId },
          }),
          'finding user'
        );

        if (!user) {
          console.error('[API] User not found:', userId);
          return NextResponse.json(
            { error: "User not found" },
            { status: 404 }
          );
        }

        shop = await safePrismaQuery(
          () => prisma.shop.create({
            data: {
              name: `${user.username || user.email}'s Shop`,
              ownerId: userId,
            },
          }),
          'creating shop'
        );
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
    
    const product = await safePrismaQuery(
      () => prisma.product.create({
        data: productData,
      }),
      'creating product'
    );

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

