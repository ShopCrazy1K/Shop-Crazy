import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/download?url=FILE_URL&listingId=LISTING_ID&userId=USER_ID
 * Secure download endpoint - only allows downloads for users who have paid for the listing
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const fileUrl = searchParams.get("url");
    const listingId = searchParams.get("listingId");
    const userId = searchParams.get("userId") || req.headers.get("x-user-id");

    if (!fileUrl) {
      return NextResponse.json(
        { error: "File URL is required" },
        { status: 400 }
      );
    }

    // SECURITY: Always require listingId and userId for digital file downloads
    if (!listingId) {
      return NextResponse.json(
        { error: "Listing ID is required for security verification" },
        { status: 400 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required. Please log in to download files." },
        { status: 401 }
      );
    }

    // Verify the file URL belongs to this listing
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      select: {
        id: true,
        digitalFiles: true,
        sellerId: true,
      },
    });

    if (!listing) {
      return NextResponse.json(
        { error: "Listing not found" },
        { status: 404 }
      );
    }

    // Check if the file URL is actually part of this listing's digital files
    const isValidFile = listing.digitalFiles.some((file: string) => file === fileUrl);
    if (!isValidFile) {
      return NextResponse.json(
        { error: "File not found in this listing" },
        { status: 403 }
      );
    }

    // Check if user has a paid order for this listing (or is the seller)
    const isSeller = listing.sellerId === userId;
    
    if (!isSeller) {
      const paidOrder = await prisma.order.findFirst({
        where: {
          listingId: listingId,
          userId: userId,
          paymentStatus: "paid",
        },
        select: {
          id: true,
          paymentStatus: true,
        },
      });

      if (!paidOrder) {
        return NextResponse.json(
          { 
            error: "You must purchase this listing before downloading files. Purchase the listing to access downloads." 
          },
          { status: 403 }
        );
      }
    }

    // Fetch the file
    const response = await fetch(fileUrl);
    
    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch file" },
        { status: 404 }
      );
    }

    // Get file content
    const fileBuffer = await response.arrayBuffer();
    
    // Extract filename from URL
    const urlPath = new URL(fileUrl).pathname;
    const fileName = urlPath.split('/').pop() || 'download';
    
    // Get content type from response or infer from extension
    const contentType = response.headers.get('content-type') || 'application/octet-stream';

    // Return file with download headers
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${encodeURIComponent(fileName)}"`,
        'Content-Length': fileBuffer.byteLength.toString(),
        'Cache-Control': 'no-cache',
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

