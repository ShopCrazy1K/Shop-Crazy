import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { createListingSchema, slugify } from "@/lib/validation";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = createListingSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, message: "Validation failed", fieldErrors: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    // TODO: replace with your auth user
    const sellerId = body.sellerId as string;
    if (!sellerId) {
      return NextResponse.json({ ok: false, message: "Missing sellerId" }, { status: 401 });
    }

    const data = parsed.data;
    const baseSlug = slugify(data.title);

    let slug = baseSlug;
    let i = 2;
    while (await prisma.listing.findUnique({ where: { slug }, select: { id: true } })) {
      slug = `${baseSlug}-${i++}`;
    }

    // Create listing first (inactive until fee subscription active)
    console.log("[LISTING CREATE] Creating listing with data:", {
      sellerId,
      title: data.title,
      slug,
      priceCents: data.priceCents,
      imagesCount: data.images?.length || 0,
      digitalFilesCount: data.digitalFiles?.length || 0,
    });
    
    const listing = await prisma.listing.create({
      data: {
        sellerId,
        title: data.title,
        description: data.description,
        slug,
        priceCents: data.priceCents,
        currency: data.currency ?? "usd",
        category: data.category ?? null,
        images: data.images ?? [],
        digitalFiles: data.digitalFiles,
        isActive: false,
      },
    });
    
    console.log("[LISTING CREATE] Listing created successfully:", listing.id);

    // Create Stripe customer (one per listing is fine; or you can reuse per seller)
    const customer = await stripe.customers.create({
      metadata: { sellerId },
    });

    // IMPORTANT: Replace this with a real Stripe Price ID for $0.20/month
    // Create it in Stripe Dashboard as recurring monthly: $0.20
    const LISTING_FEE_PRICE_ID = process.env.STRIPE_LISTING_FEE_PRICE_ID!;
    if (!LISTING_FEE_PRICE_ID) {
      return NextResponse.json(
        { ok: false, message: "Missing STRIPE_LISTING_FEE_PRICE_ID in env" },
        { status: 500 }
      );
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customer.id,
      line_items: [{ price: LISTING_FEE_PRICE_ID, quantity: 1 }],
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL || process.env.APP_URL || "https://shopcrazymarket.com"}/listings/${listing.id}?fee=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || process.env.APP_URL || "https://shopcrazymarket.com"}/listings/${listing.id}?fee=cancel`,
      metadata: {
        type: "listing_fee",
        listingId: listing.id,
        sellerId,
      },
      subscription_data: {
        metadata: {
          type: "listing_fee",
          listingId: listing.id,
          sellerId,
        },
      },
    });

    // Save customer + session now; subscription id comes from webhook
    await prisma.listing.update({
      where: { id: listing.id },
      data: {
        feeCustomerId: customer.id,
      },
    });

    return NextResponse.json({ ok: true, listingId: listing.id, checkoutUrl: session.url }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ ok: false, message: e?.message ?? "Server error" }, { status: 500 });
  }
}

