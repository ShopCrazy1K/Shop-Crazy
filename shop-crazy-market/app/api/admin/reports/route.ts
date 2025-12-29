import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendStrikeNotification } from "@/lib/email";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const reports = await prisma.copyrightReport.findMany({
      where: status && status !== "ALL" ? { status } : undefined,
      include: {
        product: {
          select: {
            id: true,
            title: true,
          },
        },
        listing: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(reports);
  } catch (error: any) {
    console.error("Error fetching reports:", error);
    return NextResponse.json(
      { error: "Failed to fetch reports" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const reports = await prisma.copyrightReport.findMany();
    return NextResponse.json(reports);
  } catch (error: any) {
    console.error("Error fetching reports:", error);
    return NextResponse.json(
      { error: "Failed to fetch reports" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { reportId, status, action } = body;

    if (!reportId || !status) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Update report status
    const report = await prisma.copyrightReport.update({
      where: { id: reportId },
      data: {
        status,
        updatedAt: new Date(),
      },
      include: {
        product: true,
        listing: {
          include: {
            seller: {
              select: {
                email: true,
                id: true,
              },
            },
          },
        },
      },
    });

    // Handle actions
    if (action === "remove" && status === "APPROVED") {
      // Hide the product (legacy)
      if (report.productId) {
        await prisma.product.update({
          where: { id: report.productId },
          data: { hidden: true },
        });
        console.log(`Product ${report.productId} hidden`);
      }

      // Deactivate the listing (new schema)
      if (report.listingId) {
        await prisma.listing.update({
          where: { id: report.listingId },
          data: { isActive: false },
        });
        console.log(`Listing ${report.listingId} deactivated`);
      }
    }

    if (action === "restore" && status === "RESOLVED") {
      // Restore the product if it was hidden (legacy)
      if (report.productId) {
        await prisma.product.update({
          where: { id: report.productId },
          data: { hidden: false },
        });
        console.log(`Product ${report.productId} restored`);
      }

      // Reactivate the listing (new schema)
      if (report.listingId) {
        await prisma.listing.update({
          where: { id: report.listingId },
          data: { isActive: true },
        });
        console.log(`Listing ${report.listingId} reactivated`);
      }
    }

    // Add seller strike if approved
    if (status === "APPROVED") {
      let shopId: string | null = null;
      let sellerEmail: string | null = null;

      // Handle legacy product-based reports
      if (report.productId && report.product) {
        const product = await prisma.product.findUnique({
          where: { id: report.productId },
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

        if (product?.shop) {
          shopId = product.shop.id;
          sellerEmail = product.shop.owner?.email || null;
        }
      }
      // Handle new listing-based reports
      else if (report.listingId && report.listing) {
        // Get shop for the seller
        const shop = await prisma.shop.findUnique({
          where: { ownerId: report.listing.seller.id },
          select: { id: true },
        });
        if (shop) {
          shopId = shop.id;
          sellerEmail = report.listing.seller.email;
        }
      }

      if (shopId) {
        const strike = await prisma.sellerStrike.create({
          data: {
            sellerId: shopId,
            reason: `Copyright violation: ${report.reason}`,
            reportId: report.id,
            status: "ACTIVE",
          },
        });

        // Send strike notification email
        if (sellerEmail) {
          await sendStrikeNotification(
            sellerEmail,
            strike.reason,
            strike.id
          );
        }
      }
    }

    return NextResponse.json({
      success: true,
      report,
    });
  } catch (error: any) {
    console.error("Error updating report:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update report" },
      { status: 500 }
    );
  }
}

