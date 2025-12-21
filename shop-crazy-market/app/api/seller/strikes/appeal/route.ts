import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendAppealNotification } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { strikeId, appealReason, shopId } = body;

    if (!strikeId || !appealReason || !shopId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Verify the strike belongs to the shop
    const strike = await prisma.sellerStrike.findUnique({
      where: { id: strikeId },
    });

    if (!strike || strike.sellerId !== shopId) {
      return NextResponse.json(
        { error: "Strike not found or unauthorized" },
        { status: 404 }
      );
    }

    if (strike.status !== "ACTIVE") {
      return NextResponse.json(
        { error: "Strike is not active and cannot be appealed" },
        { status: 400 }
      );
    }

    // Get shop info for email
    const shop = await prisma.shop.findUnique({
      where: { id: shopId },
    });

    // Update strike with appeal
    const updatedStrike = await prisma.sellerStrike.update({
      where: { id: strikeId },
      data: {
        status: "APPEALED",
        appealReason,
        appealSubmittedAt: new Date(),
      },
    });

    // Send email notification to admin about the appeal
    const adminEmail = process.env.ADMIN_EMAIL || "admin@shopcrazymarket.com";
    await sendAppealNotification(
      adminEmail,
      strikeId,
      shop?.name || "Unknown Shop",
      appealReason
    );

    return NextResponse.json({
      success: true,
      strike: updatedStrike,
      message: "Appeal submitted successfully. We will review your appeal.",
    });
  } catch (error: any) {
    console.error("Error submitting appeal:", error);
    return NextResponse.json(
      { error: error.message || "Failed to submit appeal" },
      { status: 500 }
    );
  }
}

