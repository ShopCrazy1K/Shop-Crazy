import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/users/[userId]/policies
 * Get user's shop policies
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        shopAnnouncement: true,
        shopAbout: true,
        shippingPolicy: true,
        returnsPolicy: true,
        cancellationsPolicy: true,
        faqs: true,
        digitalDownloadsPolicy: true,
        paymentMethods: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Parse FAQs if it's a JSON string
    let faqs = null;
    if (user.faqs) {
      try {
        faqs = typeof user.faqs === 'string' ? JSON.parse(user.faqs) : user.faqs;
      } catch {
        faqs = [];
      }
    }

    return NextResponse.json({
      ...user,
      faqs,
    });
  } catch (error: any) {
    console.error("Error fetching shop policies:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch shop policies" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/users/[userId]/policies
 * Update user's shop policies
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const body = await req.json();
    const currentUserId = req.headers.get("x-user-id");

    if (!currentUserId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    if (currentUserId !== userId) {
      return NextResponse.json(
        { error: "You can only update your own shop policies" },
        { status: 403 }
      );
    }

    // Convert FAQs array to JSON string if provided
    const updateData: any = {};
    if (body.shopAnnouncement !== undefined) updateData.shopAnnouncement = body.shopAnnouncement || null;
    if (body.shopAbout !== undefined) updateData.shopAbout = body.shopAbout || null;
    if (body.shippingPolicy !== undefined) updateData.shippingPolicy = body.shippingPolicy || null;
    if (body.returnsPolicy !== undefined) updateData.returnsPolicy = body.returnsPolicy || null;
    if (body.cancellationsPolicy !== undefined) updateData.cancellationsPolicy = body.cancellationsPolicy || null;
    if (body.faqs !== undefined) {
      updateData.faqs = body.faqs && Array.isArray(body.faqs) ? JSON.stringify(body.faqs) : (body.faqs || null);
    }
    if (body.digitalDownloadsPolicy !== undefined) updateData.digitalDownloadsPolicy = body.digitalDownloadsPolicy || null;
    if (body.paymentMethods !== undefined) updateData.paymentMethods = body.paymentMethods || null;

    const updated = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        shopAnnouncement: true,
        shopAbout: true,
        shippingPolicy: true,
        returnsPolicy: true,
        cancellationsPolicy: true,
        faqs: true,
        digitalDownloadsPolicy: true,
        paymentMethods: true,
      },
    });

    // Parse FAQs for response
    let faqs = null;
    if (updated.faqs) {
      try {
        faqs = typeof updated.faqs === 'string' ? JSON.parse(updated.faqs) : updated.faqs;
      } catch {
        faqs = [];
      }
    }

    return NextResponse.json({
      success: true,
      ...updated,
      faqs,
    });
  } catch (error: any) {
    console.error("Error updating shop policies:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update shop policies" },
      { status: 500 }
    );
  }
}

