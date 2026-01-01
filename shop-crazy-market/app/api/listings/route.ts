import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { createListingSchema, slugify } from "@/lib/validation";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const parsed = createListingSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, message: "Validation failed", fieldErrors: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    
    // TODO: Get sellerId from authentication
    const sellerId = body.sellerId as string;
    if (!sellerId) {
      return NextResponse.json(
        { ok: false, message: "Missing sellerId" },
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

    console.log("[API LISTINGS] Creating listing with data:", {
      sellerId,
      title: data.title,
      slug,
      priceCents: data.priceCents,
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
        priceCents: data.priceCents,
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
    console.error("Error fetching listings:", error);
    return NextResponse.json(
      { error: "Failed to fetch listings" },
      { status: 500 }
    );
  }
}

