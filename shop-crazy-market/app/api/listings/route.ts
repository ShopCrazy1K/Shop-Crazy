import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { createListingSchema, slugify } from "@/lib/validation/listing";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate input
    const validatedData = createListingSchema.parse(body);
    
    // Generate slug from title if not provided
    const slug = validatedData.slug || slugify(validatedData.title);
    
    // Ensure slug is unique
    const existingListing = await prisma.listing.findUnique({
      where: { slug },
    });
    
    if (existingListing) {
      // Append a number to make it unique
      let uniqueSlug = slug;
      let counter = 1;
      while (await prisma.listing.findUnique({ where: { slug: uniqueSlug } })) {
        uniqueSlug = `${slug}-${counter}`;
        counter++;
      }
      validatedData.slug = uniqueSlug;
    } else {
      validatedData.slug = slug;
    }
    
    // Prepare images array
    let images: string[] = [];
    if (validatedData.images && Array.isArray(validatedData.images)) {
      images = validatedData.images;
    } else if (validatedData.imageUrl) {
      images = [validatedData.imageUrl];
    }
    
    // Create listing
    const listing = await prisma.listing.create({
      data: {
        title: validatedData.title,
        description: validatedData.description,
        slug: validatedData.slug,
        price: validatedData.price,
        images: images,
        isActive: false,
        feePaid: false,
      },
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

