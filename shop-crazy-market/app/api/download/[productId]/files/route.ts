import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { productId: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get("orderId");
    const userId = searchParams.get("userId") || request.headers.get("x-user-id");

    if (!orderId || !userId) {
      return NextResponse.json(
        { error: "Order ID and user authentication required" },
        { status: 401 }
      );
    }

    // Verify the user purchased this product
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId: userId,
        status: {
          in: ["PAID", "COMPLETED"],
        },
        items: {
          some: {
            productId: params.productId,
          },
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Order not found or you don't have access to these files" },
        { status: 403 }
      );
    }

    // Get the product
    const orderItem = order.items.find(
      (item) => item.productId === params.productId
    );

    if (!orderItem || orderItem.product.type !== "DIGITAL") {
      return NextResponse.json(
        { error: "This product is not a digital download" },
        { status: 400 }
      );
    }

    // Parse images array to get all digital file URLs
    let fileUrls: string[] = [];
    try {
      const images = JSON.parse(orderItem.product.images || "[]");
      // For digital products, all items in images array are downloadable files
      // (preview images would be separate, but for now we'll return all)
      fileUrls = images.filter((url: string) => url && url.startsWith("/uploads/"));
    } catch {
      return NextResponse.json(
        { error: "Digital files not found" },
        { status: 404 }
      );
    }

    if (fileUrls.length === 0) {
      return NextResponse.json(
        { error: "No digital files found for this product" },
        { status: 404 }
      );
    }

    // Return list of files with download URLs
    const files = fileUrls.map((url, index) => {
      const filename = url.split("/").pop() || `file-${index + 1}`;
      return {
        url: `/api/download/${params.productId}?orderId=${orderId}&userId=${userId}&fileIndex=${index}`,
        filename,
        index,
      };
    });

    return NextResponse.json({
      productTitle: orderItem.product.title,
      files,
      totalFiles: files.length,
    });
  } catch (error: any) {
    console.error("Download files list error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to get file list" },
      { status: 500 }
    );
  }
}

