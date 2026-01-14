import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { createListingSchema, slugify } from "@/lib/validation";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log("[API LISTINGS POST] Received request body:", {
      hasSellerId: !!body.sellerId,
      sellerId: body.sellerId,
      title: body.title,
      hasImages: Array.isArray(body.images) && body.images.length > 0,
      hasDigitalFiles: Array.isArray(body.digitalFiles) && body.digitalFiles.length > 0,
    });
    
    const parsed = createListingSchema.safeParse(body);
    
    if (!parsed.success) {
      console.error("[API LISTINGS POST] Validation failed:", parsed.error.flatten().fieldErrors);
      return NextResponse.json(
        { ok: false, message: "Validation failed", fieldErrors: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    
    // Get sellerId from request body (sent from client)
    const sellerId = body.sellerId as string;
    if (!sellerId || typeof sellerId !== 'string' || sellerId.trim().length === 0) {
      console.error("[API LISTINGS POST] Missing or invalid sellerId:", sellerId);
      return NextResponse.json(
        { ok: false, message: "Missing or invalid sellerId. Please log in and try again." },
        { status: 401 }
      );
    }
    
    // Verify user exists
    try {
      const user = await prisma.user.findUnique({
        where: { id: sellerId },
        select: { id: true, email: true },
      });
      if (!user) {
        console.error("[API LISTINGS POST] User not found:", sellerId);
        return NextResponse.json(
          { ok: false, message: "User not found. Please log in and try again." },
          { status: 401 }
        );
      }
    } catch (userCheckError: any) {
      console.error("[API LISTINGS POST] Error checking user:", userCheckError);
      return NextResponse.json(
        { ok: false, message: "Authentication error. Please log in and try again." },
        { status: 401 }
      );
    }
    
    const data = parsed.data;
    const baseSlug = slugify(data.title);
    
    // Ensure slug is unique
    let slug = baseSlug;
    let i = 2;
    while (await prisma.listing.findUnique({ where: { slug }, select: { id: true } })) {
      slug = `${baseSlug}-${i++}`;
    }

    // Use priceCents directly (form sends priceCents, validation ensures it exists)
    const priceCents = data.priceCents;

    console.log("[API LISTINGS] Creating listing with data:", {
      sellerId,
      title: data.title,
      slug,
      priceCents: priceCents,
      imagesCount: data.images?.length || 0,
      digitalFilesCount: data.digitalFiles?.length || 0,
      isDigital: (data.digitalFiles?.length || 0) > 0,
    });

    // Create listing (using unchecked input to avoid TypeScript issues)
    const listing = await prisma.listing.create({
      data: {
        sellerId: sellerId,
        title: data.title,
        description: data.description,
        slug: slug,
        priceCents: priceCents,
        currency: data.currency ?? "usd",
        category: data.category ?? null,
        images: data.images ?? [],
        digitalFiles: Array.isArray(data.digitalFiles) ? data.digitalFiles : (data.digitalFiles ? [data.digitalFiles] : []),
        isActive: false,
      } as any,
      select: { id: true },
    });
    
    console.log("[API LISTINGS] Listing created successfully:", listing.id);
    
    return NextResponse.json({ ok: true, id: listing.id }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating listing:", error);
    
    // Handle Prisma errors
    if (error.code === 'P2002') {
      return NextResponse.json(
        { ok: false, message: "A listing with this slug already exists" },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { ok: false, message: error.message || "Failed to create listing" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    console.log("[API LISTINGS GET] Request received");
    
    // Check if DATABASE_URL is available
    if (!process.env.DATABASE_URL) {
      console.error("[API LISTINGS GET] DATABASE_URL is not set!");
      return NextResponse.json(
        { 
          error: "Database configuration error. Please contact support.",
          details: "DATABASE_URL environment variable is missing.",
          fix: "Please add DATABASE_URL to Vercel environment variables and redeploy.",
        },
        { status: 500 }
      );
    }

    // Test database connection first
    try {
      await prisma.$queryRaw`SELECT 1`;
    } catch (dbTestError: any) {
      console.error("[API LISTINGS GET] Database connection test failed:", dbTestError);
      return NextResponse.json(
        { 
          error: "Database connection failed.",
          details: dbTestError.message || "Cannot connect to database.",
          fix: "Please check DATABASE_URL in Vercel environment variables and ensure the database is accessible.",
        },
        { status: 503 }
      );
    }
    
    const { searchParams } = new URL(request.url);
    const isActive = searchParams.get("isActive");
    const userId = searchParams.get("userId") || request.headers.get("x-user-id");
    const excludeUserId = searchParams.get("excludeUserId"); // New: exclude user's own listings
    const search = searchParams.get("search") || searchParams.get("q");
    const category = searchParams.get("category");
    
    const where: any = {};
    
    // Always filter by isActive if specified, otherwise default to active for marketplace
    if (isActive !== null && isActive !== undefined) {
      where.isActive = isActive === "true";
    } else {
      // Default to active listings for marketplace view
      where.isActive = true;
    }
    
    // Exclude user's own listings if excludeUserId is provided (for marketplace view)
    // This will be filtered in memory after fetching to avoid Prisma type issues
    
    // Add category filter if provided
    if (category && category !== "all") {
      where.category = category;
    }
    
    // Add search filter if provided
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }
    
    let listings: any[];
    try {
      // Type assertion needed due to Prisma's type inference limitations with dynamic where clauses
      const result = await prisma.listing.findMany({
        where: where as any,
        include: {
          seller: {
            select: {
              id: true,
              email: true,
              username: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });
      listings = result as any;
    } catch (error: any) {
      // If error is about missing category column, try query without category filter
      if (error.message?.includes("category") || error.message?.includes("Unknown column")) {
        console.log("[API LISTINGS] Category column not found, retrying without category filter");
        const whereWithoutCategory = { ...where };
        delete whereWithoutCategory.category;
        // Type assertion needed due to Prisma's type inference limitations with dynamic where clauses
        const result2 = await prisma.listing.findMany({
          where: whereWithoutCategory as any,
          include: {
            seller: {
              select: {
                id: true,
                email: true,
                username: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        });
        listings = result2 as any;
        // Filter by category in memory if needed
        if (category && category !== "all" && listings) {
          listings = listings.filter((listing: any) => listing.category === category);
        }
      } else {
        throw error;
      }
    }
    
    console.log("[API LISTINGS] Total listings found:", listings.length);
    console.log("[API LISTINGS] isActive filter:", where.isActive);
    console.log("[API LISTINGS] excludeUserId:", excludeUserId);
    console.log("[API LISTINGS] userId:", userId);
    
    // Exclude user's own listings if excludeUserId is provided (for marketplace view)
    if (excludeUserId) {
      const beforeExclude = listings.length;
      listings = listings.filter((listing: any) => 
        listing.sellerId !== excludeUserId && listing.seller?.id !== excludeUserId
      );
      console.log("[API LISTINGS] After excluding user listings:", listings.length, "(removed", beforeExclude - listings.length, ")");
    }
    
    // CRITICAL: Remove digital files from images arrays for all listings
    // Digital files should NEVER appear in thumbnails
    listings = listings.map((listing: any) => {
      const digitalFiles = Array.isArray(listing.digitalFiles) ? listing.digitalFiles : [];
      const images = Array.isArray(listing.images) ? listing.images : [];
      
      // Create a set of digital file URLs (case-insensitive)
      const digitalFilesSet = new Set(digitalFiles.map((f: string) => f.toLowerCase()));
      
      // Filter out any images that are actually digital files
      const filteredImages = images.filter((img: string) => {
        if (!img || typeof img !== 'string') return false;
        const imgLower = img.toLowerCase();
        if (digitalFilesSet.has(imgLower)) {
          console.warn("[API LISTINGS] Removed digital file from images array:", img);
          return false;
        }
        return true;
      });
      
      return {
        ...listing,
        images: filteredImages,
        digitalFiles: digitalFiles,
      };
    });
    
    // If user is authenticated, filter out inactive listings that don't belong to them
    if (userId) {
      const beforeActiveFilter = listings.length;
      const filteredListings = listings.filter((listing: any) => 
        listing.isActive || listing.sellerId === userId || listing.seller?.id === userId
      );
      console.log("[API LISTINGS] After active filter:", filteredListings.length, "(removed", beforeActiveFilter - filteredListings.length, ")");
      return NextResponse.json(filteredListings);
    }
    
    console.log("[API LISTINGS] Returning", listings.length, "listings");
    return NextResponse.json(listings);
  } catch (error: any) {
    console.error("[API LISTINGS GET] Error fetching listings:", error);
    console.error("[API LISTINGS GET] Error name:", error?.name);
    console.error("[API LISTINGS GET] Error code:", error?.code);
    console.error("[API LISTINGS GET] Error message:", error?.message);
    
    // Handle Prisma client errors
    if (error.code?.startsWith('P')) {
      return NextResponse.json(
        { 
          error: "Database error occurred.",
          details: error.message || "An error occurred while querying the database.",
          code: error.code,
          fix: "Please check database configuration and connectivity.",
        },
        { status: 500 }
      );
    }
    
    // Handle prepared statement errors (PgBouncer)
    if (error.message?.includes("prepared statement") || error.message?.includes("42P05")) {
      return NextResponse.json(
        { 
          error: "Database connection issue. Please try again in a moment.",
          details: "The database connection pooler is experiencing issues.",
          fix: "Retry the request. If it persists, check DATABASE_URL configuration.",
        },
        { status: 503 }
      );
    }
    
    return NextResponse.json(
      { 
        error: error.message || "Failed to fetch listings",
        details: "An unexpected error occurred while fetching listings.",
        fix: "Please try again or contact support if the problem persists.",
      },
      { status: 500 }
    );
  }
}

