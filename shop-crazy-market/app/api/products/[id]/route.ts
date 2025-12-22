import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const product = await prisma.product.findUnique({
      where: { id: params.id },
      include: {
        shop: {
          include: {
            owner: {
              select: {
                id: true,
                username: true,
                email: true,
              },
            },
          },
        },
        reviews: {
          include: {
            user: {
              select: {
                username: true,
                email: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    // Parse images from JSON string
    let images: string[] = [];
    try {
      images = JSON.parse(product.images || "[]");
    } catch {
      images = [];
    }

    return NextResponse.json({
      ...product,
      images,
    });
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId") || request.headers.get("x-user-id");

    if (!userId) {
      return NextResponse.json(
        { error: "User authentication required" },
        { status: 401 }
      );
    }

    // Get the product with shop owner info
    const product = await prisma.product.findUnique({
      where: { id: params.id },
      include: {
        shop: {
          include: {
            owner: true,
          },
        },
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    // Verify the user owns this product
    if (product.shop.ownerId !== userId) {
      return NextResponse.json(
        { error: "You don't have permission to delete this product" },
        { status: 403 }
      );
    }

    // Check if product has been ordered (has order items)
    // We can't delete products with order items due to foreign key constraints
    const orderItemsCount = await prisma.orderItem.count({
      where: { productId: params.id },
    });

    if (orderItemsCount > 0) {
      // If product has been ordered, hide it instead of deleting
      await prisma.product.update({
        where: { id: params.id },
        data: {
          hidden: true,
        },
      });

      // Delete related records that can be safely removed
      await prisma.review.deleteMany({
        where: { productId: params.id },
      });

      await prisma.favorite.deleteMany({
        where: { productId: params.id },
      });

      await prisma.listingFee.deleteMany({
        where: { productId: params.id },
      });

      await prisma.copyrightReport.deleteMany({
        where: { productId: params.id },
      });

      return NextResponse.json({
        success: true,
        message: "Product hidden successfully (cannot be deleted as it has been ordered)",
        hidden: true,
      });
    }

    // If no orders exist, we can safely delete everything
    // Delete all related records first (to avoid foreign key constraint errors)
    await prisma.review.deleteMany({
      where: { productId: params.id },
    });

    await prisma.favorite.deleteMany({
      where: { productId: params.id },
    });

    await prisma.listingFee.deleteMany({
      where: { productId: params.id },
    });

    await prisma.copyrightReport.deleteMany({
      where: { productId: params.id },
    });
    
    // Delete the product
    await prisma.product.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error: any) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete product" },
      { status: 500 }
    );
  }
}

