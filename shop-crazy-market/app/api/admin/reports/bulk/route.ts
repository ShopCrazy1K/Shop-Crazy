import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendStrikeNotification } from "@/lib/email";

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { reportIds, action, status } = body;

    if (!reportIds || !Array.isArray(reportIds) || reportIds.length === 0) {
      return NextResponse.json(
        { error: "Report IDs are required" },
        { status: 400 }
      );
    }

    if (!action || !status) {
      return NextResponse.json(
        { error: "Action and status are required" },
        { status: 400 }
      );
    }

    // Update all reports
    const updatedReports = await Promise.all(
      reportIds.map((reportId: string) =>
        prisma.copyrightReport.update({
          where: { id: reportId },
          data: { status, updatedAt: new Date() },
          include: {
            product: {
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
            },
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
        })
      )
    );

    // Handle bulk actions
    if (action === "remove" && status === "APPROVED") {
      // Hide all products (legacy)
      const productIds = updatedReports
        .map((r) => r.productId)
        .filter((id) => id);

      // Filter out null values and ensure we have valid product IDs
      const validProductIds = productIds.filter((id): id is string => id !== null);
      
      if (validProductIds.length > 0) {
        await prisma.product.updateMany({
          where: { id: { in: validProductIds } },
          data: { hidden: true },
        });
      }

      // Deactivate all listings (new schema)
      const listingIds = updatedReports
        .map((r) => r.listingId)
        .filter((id) => id);

      // Filter out null values and ensure we have valid listing IDs
      const validListingIds = listingIds.filter((id): id is string => id !== null);
      
      if (validListingIds.length > 0) {
        await prisma.listing.updateMany({
          where: { id: { in: validListingIds } },
          data: { isActive: false },
        });
      }
    }

    if (action === "restore" && status === "RESOLVED") {
      // Restore all products
      const productIds = updatedReports
        .map((r) => r.productId)
        .filter((id) => id);

      // Filter out null values and ensure we have valid product IDs
      const validProductIds = productIds.filter((id): id is string => id !== null);
      
      if (validProductIds.length > 0) {
        await prisma.product.updateMany({
          where: { id: { in: validProductIds } },
          data: { hidden: false },
        });
      }

      // Restore all listings (deactivate them)
      const listingIds = updatedReports
        .map((r) => r.listingId)
        .filter((id) => id);

      // Filter out null values and ensure we have valid listing IDs
      const validListingIds = listingIds.filter((id): id is string => id !== null);
      
      if (validListingIds.length > 0) {
        await prisma.listing.updateMany({
          where: { id: { in: validListingIds } },
          data: { isActive: true },
        });
      }
    }

    // Create strikes for approved reports
    if (status === "APPROVED") {
      for (const report of updatedReports) {
        let shopId: string | null = null;
        let sellerEmail: string | null = null;

        // Handle legacy product-based reports
        if (report.product?.shop) {
          shopId = report.product.shop.id;
          sellerEmail = report.product.shop.owner?.email || null;
        }
        // Handle new listing-based reports
        else if (report.listing?.seller) {
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

          // Send strike notification
          if (sellerEmail) {
            await sendStrikeNotification(
              sellerEmail,
              strike.reason,
              strike.id
            );
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      updated: updatedReports.length,
      message: `Successfully ${action}ed ${updatedReports.length} report(s)`,
    });
  } catch (error: any) {
    console.error("Error in bulk update:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update reports" },
      { status: 500 }
    );
  }
}

