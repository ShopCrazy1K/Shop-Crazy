import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

type Ctx = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, context: Ctx) {
  try {
    const { id } = await context.params;

    const body = await req.json().catch(() => ({}));
    const images = body?.images as unknown;

    if (!Array.isArray(images) || images.some((x) => typeof x !== "string" || !x.trim())) {
      return NextResponse.json(
        { ok: false, message: "Invalid images array" },
        { status: 400 }
      );
    }

    // Verify listing exists
    const existingListing = await prisma.listing.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existingListing) {
      return NextResponse.json(
        { ok: false, message: "Listing not found" },
        { status: 404 }
      );
    }

    const listing = await prisma.listing.update({
      where: { id },
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

