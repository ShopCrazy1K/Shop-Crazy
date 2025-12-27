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

    // Create listing (using unchecked input to avoid TypeScript issues)
    const listing = await prisma.listing.create({
      data: {
        sellerId: sellerId,
        title: data.title,
        description: data.description,
        slug: slug,
        priceCents: data.priceCents,
        currency: data.currency ?? "usd",
        images: data.images ?? [],
        digitalFiles: data.digitalFiles ?? [],
        isActive: false,
      } as any,
      select: { id: true },
    });
    
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

