import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

type Ctx = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;

  // If already active, no-op
  const listing = await prisma.listing.findUnique({ 
    where: { id }, 
    select: { isActive: true } 
  });

  if (!listing) {
    return NextResponse.json(
      { ok: false, message: "Not found" },
      { status: 404 }
    );
  }

  if (listing.isActive) {
    return NextResponse.json({ ok: true, status: "ACTIVE" });
  }

  // Activate listing after Stripe payment
  await prisma.listing.update({
    where: { id },
    data: { isActive: true },
  });

  return NextResponse.json({ ok: true, status: "ACTIVE" });
}

