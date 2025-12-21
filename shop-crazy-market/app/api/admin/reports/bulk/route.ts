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
          },
        })
      )
    );

    // Handle bulk actions
    if (action === "remove" && status === "APPROVED") {
      // Hide all products
      const productIds = updatedReports
        .map((r) => r.productId)
        .filter((id) => id);

      await prisma.product.updateMany({
        where: { id: { in: productIds } },
        data: { hidden: true },
      });
    }

    if (action === "restore" && status === "RESOLVED") {
      // Restore all products
      const productIds = updatedReports
        .map((r) => r.productId)
        .filter((id) => id);

      await prisma.product.updateMany({
        where: { id: { in: productIds } },
        data: { hidden: false },
      });
    }

    // Create strikes for approved reports
    if (status === "APPROVED") {
      for (const report of updatedReports) {
        if (report.product?.shop) {
          const strike = await prisma.sellerStrike.create({
            data: {
              sellerId: report.product.shop.id,
              reason: `Copyright violation: ${report.reason}`,
              reportId: report.id,
              status: "ACTIVE",
            },
          });

          // Send strike notification
          if (report.product.shop.owner?.email) {
            await sendStrikeNotification(
              report.product.shop.owner.email,
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

