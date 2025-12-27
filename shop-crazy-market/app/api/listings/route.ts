import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { createListingSchema, slugify } from "@/lib/validation";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate input
    const validatedData = createListingSchema.parse(body);
    
    // TODO: Get sellerId from authentication
    const sellerId = body.sellerId as string;
    if (!sellerId) {
      return NextResponse.json(
        { error: "Seller ID is required" },
        { status: 401 }
      );
    }
    
    // Generate slug from title
    const baseSlug = slugify(validatedData.title);
    
    // Ensure slug is unique
    let slug = baseSlug;
    let counter = 1;
    while (await prisma.listing.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    // Create listing
    const listing = await prisma.listing.create({
      data: {
        sellerId: sellerId,
        title: validatedData.title,
        description: validatedData.description,
        slug: slug,
        priceCents: validatedData.priceCents,
        currency: validatedData.currency || "usd",
        images: validatedData.images || [],
        digitalFiles: validatedData.digitalFiles,
        isActive: false,
      } as any, // Type assertion to work around TypeScript cache issue
    });
    
    return NextResponse.json(listing, { status: 201 });
  } catch (error: any) {
    console.error("Error creating listing:", error);
    
    // Handle Zod validation errors
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { 
          error: "Validation failed",
          details: error.errors,
        },
        { status: 400 }
      );
    }
    
    // Handle Prisma errors
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: "A listing with this slug already exists" },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: error.message || "Failed to create listing" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const isActive = searchParams.get("isActive");
    
    const where: any = {};
    
    if (isActive !== null) {
      where.isActive = isActive === "true";
    }
    
    const listings = await prisma.listing.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
    });
    
    return NextResponse.json(listings);
  } catch (error: any) {
    console.error("Error fetching listings:", error);
    return NextResponse.json(
      { error: "Failed to fetch listings" },
      { status: 500 }
    );
  }
}

