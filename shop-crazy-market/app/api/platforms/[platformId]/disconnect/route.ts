import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * DELETE /api/platforms/[platformId]/disconnect
 * 
 * Disconnect a platform from a shop
 */
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ platformId: string }> }
) {
  try {
    const { platformId } = await params;

    const connection = await prisma.platformConnection.findUnique({
      where: { id: platformId },
    });

    if (!connection) {
      return NextResponse.json(
        { error: "Platform connection not found" },
        { status: 404 }
      );
    }

    // Deactivate connection instead of deleting (preserve product links)
    await prisma.platformConnection.update({
      where: { id: platformId },
      data: { isActive: false, syncEnabled: false },
    });

    // Disable sync on all connected products
    await prisma.product.updateMany({
      where: { platformConnectionId: platformId },
      data: { syncEnabled: false },
    });

    return NextResponse.json({
      success: true,
      message: "Platform disconnected successfully",
    });
  } catch (error: any) {
    console.error("Error disconnecting platform:", error);
    return NextResponse.json(
      { error: error.message || "Failed to disconnect platform" },
      { status: 500 }
    );
  }
}

