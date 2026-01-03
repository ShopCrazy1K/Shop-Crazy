import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// In a real app, you'd store these in a database
// For now, we'll use environment variables or a simple storage
// This is a placeholder - you should create a Settings model in Prisma

/**
 * GET /api/admin/settings
 * Get marketplace settings (admin only)
 */
export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    await requireAdmin(userId);

    // For now, return default settings
    // In production, fetch from database
    const settings = {
      marketplaceName: process.env.MARKETPLACE_NAME || "Shop Crazy Market",
      platformFeePercent: 5,
      processingFeePercent: 2,
      adFeePercent: 15,
    };

    return NextResponse.json({ settings });
  } catch (error: any) {
    console.error("Error fetching settings:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch settings" },
      { status: error.message === "Admin access required" ? 403 : 500 }
    );
  }
}

/**
 * POST /api/admin/settings
 * Update marketplace settings (admin only)
 */
export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    await requireAdmin(userId);

    const body = await req.json();
    const { marketplaceName, platformFeePercent, processingFeePercent, adFeePercent } = body;

    // Validate
    if (platformFeePercent < 0 || platformFeePercent > 100) {
      return NextResponse.json(
        { error: "Platform fee must be between 0 and 100" },
        { status: 400 }
      );
    }

    if (processingFeePercent < 0 || processingFeePercent > 100) {
      return NextResponse.json(
        { error: "Processing fee must be between 0 and 100" },
        { status: 400 }
      );
    }

    if (adFeePercent < 0 || adFeePercent > 100) {
      return NextResponse.json(
        { error: "Ad fee must be between 0 and 100" },
        { status: 400 }
      );
    }

    // In production, save to database
    // For now, we'll just log it
    console.log("[ADMIN SETTINGS] Updated:", {
      marketplaceName,
      platformFeePercent,
      processingFeePercent,
      adFeePercent,
      updatedBy: userId,
    });

    // TODO: Save to database (create Settings model in Prisma)

    return NextResponse.json({
      success: true,
      message: "Settings saved successfully",
    });
  } catch (error: any) {
    console.error("Error saving settings:", error);
    return NextResponse.json(
      { error: error.message || "Failed to save settings" },
      { status: error.message === "Admin access required" ? 403 : 500 }
    );
  }
}

