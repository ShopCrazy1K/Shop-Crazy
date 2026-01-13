import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { createListingSchema, slugify } from "@/lib/validation";
import { checkListingForBannedWords } from "@/lib/banned-words";
import { sendListingFlaggedEmail } from "@/lib/email";
import { notifyListingFlagged } from "@/lib/notification-helper";

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

    // Check for banned words and auto-flag
    const flagCheck = checkListingForBannedWords(
      data.title,
      data.description,
      data.brand ?? undefined,
      data.tags ?? undefined
    );
    
    // Determine copyright status and active status based on flag check
    let copyrightStatus = "CLEAR";
    let isActiveAfterFlag = !data.isDraft; // Only active if not draft and not flagged
    
    if (flagCheck.flagged) {
      if (flagCheck.severity === "AUTO_HIDE") {
        copyrightStatus = "HIDDEN";
        isActiveAfterFlag = false;
      } else if (flagCheck.severity === "AUTO_FLAG") {
        copyrightStatus = "FLAGGED";
        isActiveAfterFlag = false; // Don't activate flagged listings
      } else {
        copyrightStatus = "FLAGGED";
        // WARNING severity can still be active but flagged
      }
    }
    
    // Create listing first (inactive until fee subscription active)
    console.log("[LISTING CREATE] Creating listing with data:", {
      sellerId,
      title: data.title,
      slug,
      priceCents: data.priceCents,
      imagesCount: data.images?.length || 0,
      digitalFilesCount: data.digitalFiles?.length || 0,
      flagged: flagCheck.flagged,
      copyrightStatus,
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
        thumbnails: data.thumbnails ?? [],
        digitalFiles: data.digitalFiles,
        // SEO & Discovery
        tags: data.tags ?? [],
        searchKeywords: data.searchKeywords ?? null,
        metaDescription: data.metaDescription ?? null,
        // Product Attributes
        sku: data.sku ?? null,
        brand: data.brand ?? null,
        materials: data.materials ?? null,
        dimensions: data.dimensions ?? null,
        weight: data.weight ?? null,
        color: data.color ?? null,
        countryOfOrigin: data.countryOfOrigin ?? null,
        // Shipping
        shippingCostCents: data.shippingCostCents ?? null,
        processingTime: data.processingTime ?? null,
        shippingMethods: data.shippingMethods ?? [],
        // Policies
        returnPolicy: data.returnPolicy ?? null,
        returnWindowDays: data.returnWindowDays ?? null,
        warrantyInfo: data.warrantyInfo ?? null,
        careInstructions: data.careInstructions ?? null,
        // Copyright/IP Protection
        copyrightStatus,
        flaggedWords: flagCheck.flaggedWords.map(w => w.word),
        flaggedAt: flagCheck.flagged ? new Date() : null,
        flaggedReason: flagCheck.message ?? null,
        // Draft
        isDraft: data.isDraft ?? false,
        isActive: data.isDraft ? false : isActiveAfterFlag, // Drafts are never active, flagged listings are inactive
      } as any,
    });
    
    console.log("[LISTING CREATE] Listing created successfully:", listing.id);

    // Send email notification if listing was flagged
    if (flagCheck.flagged && flagCheck.severity !== "WARNING") {
      const seller = await prisma.user.findUnique({
        where: { id: sellerId },
        select: { email: true },
      });
      
      if (seller?.email) {
        await sendListingFlaggedEmail(
          seller.email,
          data.title,
          flagCheck.flaggedWords.map(w => w.word),
          flagCheck.message || "Listing contains potentially copyrighted or trademarked terms."
        ).catch(err => console.error("Failed to send flagged listing email:", err));
      }
      
      // Create in-app notification
      await notifyListingFlagged(
        sellerId,
        data.title,
        flagCheck.flaggedWords.map(w => w.word)
      ).catch(err => console.error("Failed to create flagged notification:", err));
    }

    // If it's a draft, skip Stripe checkout
    if (data.isDraft) {
      return NextResponse.json({ ok: true, listingId: listing.id, isDraft: true }, { status: 201 });
    }

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

