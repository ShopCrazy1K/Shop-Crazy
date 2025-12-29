import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendAdminReportNotification, sendSellerNotification } from "@/lib/email";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { productId, listingId, reporterEmail, reason } = body;

    // Support both productId (legacy) and listingId (new)
    if ((!productId && !listingId) || !reporterEmail || !reason) {
      return NextResponse.json(
        { error: "Missing required fields. Please provide either productId or listingId, reporterEmail, and reason." },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(reporterEmail)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    let itemTitle = "";
    let sellerEmail = "";
    let itemId = "";

    // Check if listing exists (new schema)
    if (listingId) {
      const listing = await prisma.listing.findUnique({
        where: { id: listingId },
        include: {
          seller: {
            select: {
              email: true,
              username: true,
            },
          },
        },
      });

      if (!listing) {
        return NextResponse.json(
          { error: "Listing not found" },
          { status: 404 }
        );
      }

      itemTitle = listing.title;
      sellerEmail = listing.seller.email;
      itemId = listingId;
    } 
    // Legacy: Check if product exists
    else if (productId) {
      const product = await prisma.product.findUnique({
        where: { id: productId },
        include: {
          shop: {
            include: {
              owner: {
                select: {
                  email: true,
                },
              },
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

      itemTitle = product.title;
      sellerEmail = product.shop?.owner?.email || "";
      itemId = productId;
    }

    // Create copyright report
    const report = await prisma.copyrightReport.create({
      data: {
        productId: productId || null,
        listingId: listingId || null,
        reporterEmail,
        reason,
        status: "PENDING",
      },
    });

    console.log("🚩 Copyright report created:", report.id);

    // Send email notification to admin
    await sendAdminReportNotification({
      id: report.id,
      productId: report.productId || undefined,
      listingId: report.listingId || undefined,
      productTitle: itemTitle,
      reporterEmail: report.reporterEmail,
      reason: report.reason,
    });

    // Send notification to seller
    if (sellerEmail) {
      await sendSellerNotification(
        sellerEmail,
        itemTitle,
        reason
      );
    }

    // Auto-hide listing/product if it has 3+ pending reports
    const reportCount = await prisma.copyrightReport.count({
      where: {
        OR: [
          listingId ? { listingId, status: "PENDING" } : {},
          productId ? { productId, status: "PENDING" } : {},
        ],
      },
    });

    if (reportCount >= 3) {
      if (listingId) {
        await prisma.listing.update({
          where: { id: listingId },
          data: { isActive: false },
        });
        console.log(`⚠️ Listing ${listingId} auto-deactivated due to ${reportCount} reports`);
      } else if (productId) {
        await prisma.product.update({
          where: { id: productId },
          data: { hidden: true },
        });
        console.log(`⚠️ Product ${productId} auto-hidden due to ${reportCount} reports`);
      }
    }

    return NextResponse.json({
      success: true,
      reportId: report.id,
      message: "Copyright report submitted successfully. We will review your report.",
    });
  } catch (error: any) {
    console.error("Error creating copyright report:", error);
    return NextResponse.json(
      { error: error.message || "Failed to submit report" },
      { status: 500 }
    );
  }
}

