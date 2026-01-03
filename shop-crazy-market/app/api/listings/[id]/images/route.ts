import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

type Ctx = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, context: Ctx) {
  try {
    const { id } = await context.params;
    const userId = req.headers.get("x-user-id");

    if (!userId) {
      return NextResponse.json(
        { ok: false, message: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const images = body?.images as unknown;
    const setPrimaryIndex = body?.setPrimaryIndex as number | undefined;
    const thumbnailIndices = body?.thumbnailIndices as number[] | undefined;

    // Verify listing exists and user is the seller
    const existingListing = await prisma.listing.findUnique({
      where: { id },
      select: { id: true, sellerId: true, images: true, thumbnailIndices: true },
    });

    if (!existingListing) {
      return NextResponse.json(
        { ok: false, message: "Listing not found" },
        { status: 404 }
      );
    }

    // Check if user is the seller
    if (existingListing.sellerId !== userId) {
      return NextResponse.json(
        { ok: false, message: "Only the seller can update listing images" },
        { status: 403 }
      );
    }

    let updatedImages: string[] | undefined;
    let updatedThumbnailIndices: number[] | undefined;

    if (thumbnailIndices !== undefined) {
      // Set thumbnail indices (must be valid indices and max 4)
      if (!Array.isArray(thumbnailIndices) || thumbnailIndices.length > 4) {
        return NextResponse.json(
          { ok: false, message: "Thumbnail indices must be an array with maximum 4 items" },
          { status: 400 }
        );
      }

      const currentImages = Array.isArray(existingListing.images) 
        ? existingListing.images 
        : typeof existingListing.images === 'string' 
          ? JSON.parse(existingListing.images) 
          : [];

      // Validate all indices are within bounds
      if (thumbnailIndices.some((idx: number) => idx < 0 || idx >= currentImages.length)) {
        return NextResponse.json(
          { ok: false, message: "Invalid thumbnail index" },
          { status: 400 }
        );
      }

      updatedThumbnailIndices = thumbnailIndices;
    } else if (setPrimaryIndex !== undefined) {
      // Set primary image by moving selected image to first position
      const currentImages = Array.isArray(existingListing.images) 
        ? existingListing.images 
        : typeof existingListing.images === 'string' 
          ? JSON.parse(existingListing.images) 
          : [];
      
      if (setPrimaryIndex < 0 || setPrimaryIndex >= currentImages.length) {
        return NextResponse.json(
          { ok: false, message: "Invalid image index" },
          { status: 400 }
        );
      }

      // Reorder: move selected image to first position
      const selectedImage = currentImages[setPrimaryIndex];
      updatedImages = [
        selectedImage,
        ...currentImages.filter((_: string, idx: number) => idx !== setPrimaryIndex)
      ];
    } else if (Array.isArray(images)) {
      // Full images array update
      if (images.some((x) => typeof x !== "string" || !x.trim())) {
        return NextResponse.json(
          { ok: false, message: "Invalid images array" },
          { status: 400 }
        );
      }
      updatedImages = images;
    } else {
      return NextResponse.json(
        { ok: false, message: "Invalid request: provide either images array or setPrimaryIndex" },
        { status: 400 }
      );
    }

    const updateData: any = {};
    if (updatedImages !== undefined) {
      updateData.images = updatedImages;
    }
    if (updatedThumbnailIndices !== undefined) {
      updateData.thumbnailIndices = updatedThumbnailIndices;
    }

    const listing = await prisma.listing.update({
      where: { id },
      data: updateData,
      select: { id: true, images: true, thumbnailIndices: true },
    });

    return NextResponse.json({ ok: true, listing });
  } catch (error: any) {
    console.error("Error updating listing images:", error);
    return NextResponse.json(
      { ok: false, message: error.message || "Failed to update images" },
      { status: 500 }
    );
  }
}

