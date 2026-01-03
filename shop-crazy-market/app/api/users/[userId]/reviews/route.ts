import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

type Ctx = { params: Promise<{ userId: string }> };

/**
 * GET /api/users/[userId]/reviews
 * Get all reviews for a specific seller/user
 */
export async function GET(req: NextRequest, context: Ctx) {
  try {
    const { userId } = await context.params;

    const reviews = await prisma.review.findMany({
      where: {
        sellerId: userId, // Reviews for this seller
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
        order: {
          select: {
            id: true,
            listing: {
              select: {
                id: true,
                title: true,
                images: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(reviews);
  } catch (error: any) {
    console.error("Error fetching user reviews:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/users/[userId]/reviews
 * Create a review for a seller/user
 */
export async function POST(req: NextRequest, context: Ctx) {
  try {
    const { userId } = await context.params;
    const body = await req.json();
    const { reviewerId, rating, comment, orderId, photos } = body;

    if (!reviewerId || !rating) {
      return NextResponse.json(
        { error: "Reviewer ID and rating are required" },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5" },
        { status: 400 }
      );
    }

    // Verify the reviewer has purchased from this seller
    if (orderId) {
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        select: {
          userId: true,
          sellerId: true,
          paymentStatus: true,
        },
      });

      if (!order) {
        return NextResponse.json(
          { error: "Order not found" },
          { status: 404 }
        );
      }

      if (order.userId !== reviewerId) {
        return NextResponse.json(
          { error: "You can only review orders you purchased" },
          { status: 403 }
        );
      }

      if (order.sellerId !== userId) {
        return NextResponse.json(
          { error: "This order is not from this seller" },
          { status: 403 }
        );
      }

      if (order.paymentStatus !== "paid") {
        return NextResponse.json(
          { error: "You can only review paid orders" },
          { status: 400 }
        );
      }
    }

    // Check if user already reviewed this seller (only if orderId is provided)
    // Allow multiple general reviews without orderId, but only one per order
    if (orderId) {
      const existingReview = await prisma.review.findFirst({
        where: {
          sellerId: userId,
          userId: reviewerId,
          orderId: orderId,
        },
      });

      if (existingReview) {
        return NextResponse.json(
          { error: "You have already reviewed this order" },
          { status: 400 }
        );
      }
    }

    const review = await prisma.review.create({
      data: {
        userId: reviewerId,
        sellerId: userId,
        rating,
        comment: comment || null,
        orderId: orderId || null,
        photos: photos && Array.isArray(photos) ? photos : [],
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
        order: {
          select: {
            id: true,
            listing: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(review, { status: 201 });
  } catch (error: any) {
    console.error("Error creating review:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create review" },
      { status: 500 }
    );
  }
}

