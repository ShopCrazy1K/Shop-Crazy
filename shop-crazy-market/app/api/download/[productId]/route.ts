import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { readFile } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

export async function GET(
  request: Request,
  { params }: { params: { productId: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get("orderId");
    // Get userId from request (could be in headers, body, or query)
    let userId = request.headers.get("x-user-id");
    
    // Try to get from query params as fallback
    if (!userId) {
      userId = searchParams.get("userId");
    }

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
          in: ["COMPLETED", "PAID"],
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
        { error: "Order not found or you don't have access to this file" },
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

    // Get file index from query params (for multiple files)
    const fileIndex = searchParams.get("fileIndex");
    
    // Parse images array to get all digital file URLs
    let fileUrls: string[] = [];
    try {
      const images = JSON.parse(orderItem.product.images || "[]");
      // For digital products, filter to get actual file URLs (those in /uploads/)
      fileUrls = images.filter((url: string) => url && url.startsWith("/uploads/"));
    } catch {
      return NextResponse.json(
        { error: "Digital files not found" },
        { status: 404 }
      );
    }

    if (fileUrls.length === 0) {
      return NextResponse.json(
        { error: "Digital file not found" },
        { status: 404 }
      );
    }

    // Get the specific file URL based on index, or first file if no index specified
    const fileIndexNum = fileIndex ? parseInt(fileIndex) : 0;
    if (fileIndexNum < 0 || fileIndexNum >= fileUrls.length) {
      return NextResponse.json(
        { error: "Invalid file index" },
        { status: 400 }
      );
    }

    const fileUrl = fileUrls[fileIndexNum];

    // Extract filename from URL (e.g., /uploads/123456_file.zip or uploads/123456_file.zip)
    let filename = fileUrl.split("/").pop() || fileUrl;
    if (!filename || filename === fileUrl) {
      // If no slash found, use the whole URL as filename
      filename = fileUrl.replace(/^\/+/, ""); // Remove leading slashes
    }

    // Files are stored in uploads/ directory (outside public folder)
    // First try uploads/, then fallback to public/uploads/ for backwards compatibility
    let filePath = join(process.cwd(), "uploads", filename);
    if (!existsSync(filePath)) {
      filePath = join(process.cwd(), "public", "uploads", filename);
    }

    if (!existsSync(filePath)) {
      return NextResponse.json(
        { error: "File not found on server" },
        { status: 404 }
      );
    }

    // Read and serve the file
    const fileBuffer = await readFile(filePath);
    const fileExtension = filename.split(".").pop()?.toLowerCase() || "";

    // Determine content type
    const contentTypes: Record<string, string> = {
      zip: "application/zip",
      pdf: "application/pdf",
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      png: "image/png",
      gif: "image/gif",
      mp3: "audio/mpeg",
      mp4: "video/mp4",
      txt: "text/plain",
      doc: "application/msword",
      docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    };

    const contentType =
      contentTypes[fileExtension] || "application/octet-stream";

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${orderItem.product.title}_${filename}"`,
        "Content-Length": fileBuffer.length.toString(),
      },
    });
  } catch (error: any) {
    console.error("Download error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to download file" },
      { status: 500 }
    );
  }
}

