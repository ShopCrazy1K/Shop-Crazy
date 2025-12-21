import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendAdminReportNotification, sendSellerNotification } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { productId, reporterEmail, reason } = body;

    if (!productId || !reporterEmail || !reason) {
      return NextResponse.json(
        { error: "Missing required fields" },
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

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    // Create copyright report
    const report = await prisma.copyrightReport.create({
      data: {
        productId,
        reporterEmail,
        reason,
        status: "PENDING",
      },
      include: {
        product: {
          select: {
            title: true,
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
    });

    console.log("🚩 Copyright report created:", report.id);

    // Send email notification to admin
    await sendAdminReportNotification({
      id: report.id,
      productId: report.productId,
      productTitle: report.product?.title,
      reporterEmail: report.reporterEmail,
      reason: report.reason,
    });

    // Send notification to seller
    if (report.product?.shop?.owner?.email) {
      await sendSellerNotification(
        report.product.shop.owner.email,
        report.product.title,
        report.reason
      );
    }

    // Auto-hide product if it has 3+ pending reports
    const reportCount = await prisma.copyrightReport.count({
      where: {
        productId,
        status: "PENDING",
      },
    });

    if (reportCount >= 3) {
      await prisma.product.update({
        where: { id: productId },
        data: { hidden: true },
      });
      console.log(`⚠️ Product ${productId} auto-hidden due to ${reportCount} reports`);
    }

    return NextResponse.json({
      success: true,
      reportId: report.id,
      message: "Report submitted successfully",
    });
  } catch (error: any) {
    console.error("Error creating copyright report:", error);
    return NextResponse.json(
      { error: error.message || "Failed to submit report" },
      { status: 500 }
    );
  }
}

