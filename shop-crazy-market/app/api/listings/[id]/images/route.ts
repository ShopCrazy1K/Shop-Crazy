import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const images = body?.images as string[] | undefined;

    if (!Array.isArray(images) || images.some((x) => typeof x !== "string" || !x.trim())) {
      return NextResponse.json(
        { ok: false, message: "Invalid images array" },
        { status: 400 }
      );
    }

    // Verify listing exists
    const existingListing = await prisma.listing.findUnique({
      where: { id: params.id },
      select: { id: true },
    });

    if (!existingListing) {
      return NextResponse.json(
        { ok: false, message: "Listing not found" },
        { status: 404 }
      );
    }

    const listing = await prisma.listing.update({
      where: { id: params.id },
      data: { images },
      select: { id: true, images: true },
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

