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
    const search = searchParams.get("search") || searchParams.get("q");
    const category = searchParams.get("category");
    
    const where: any = {};
    
    // For guest users (no userId), default to only active listings
    // For authenticated users, respect the isActive parameter or show all
    if (!userId) {
      // Guest users can only see active listings
      where.isActive = true;
    } else if (isActive !== null) {
      // Authenticated users can filter by isActive if specified
      where.isActive = isActive === "true";
    }
    // If userId exists and isActive is not specified, show all listings (user can see their own inactive ones)
    
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
      listings = await (prisma.listing.findMany({
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
      }) as Promise<any[]>);
    } catch (error: any) {
      // If error is about missing category column, try query without category filter
      if (error.message?.includes("category") || error.message?.includes("Unknown column")) {
        console.log("[API LISTINGS] Category column not found, retrying without category filter");
        const whereWithoutCategory = { ...where };
        delete whereWithoutCategory.category;
        listings = await (prisma.listing.findMany({
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
        }) as Promise<any[]>);
        // Filter by category in memory if needed
        if (category && category !== "all" && listings) {
          listings = listings.filter((listing: any) => listing.category === category);
        }
      } else {
        throw error;
      }
    }
    
    // If user is authenticated, filter out inactive listings that don't belong to them
    if (userId) {
      const filteredListings = listings.filter((listing: any) => 
        listing.isActive || listing.sellerId === userId || listing.seller?.id === userId
      );
      return NextResponse.json(filteredListings);
    }
    
    return NextResponse.json(listings);
  } catch (error: any) {
    console.error("Error fetching listings:", error);
    return NextResponse.json(
      { error: "Failed to fetch listings" },
      { status: 500 }
    );
  }
}

