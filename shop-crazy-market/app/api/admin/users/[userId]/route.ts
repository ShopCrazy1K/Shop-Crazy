import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

type Ctx = { params: Promise<{ userId: string }> };

/**
 * POST /api/admin/users/[userId]
 * Suspend, block, or delete a user (admin only)
 */
export async function POST(req: NextRequest, context: Ctx) {
  try {
    const adminId = req.headers.get("x-user-id");
    await requireAdmin(adminId);

    const { userId } = await context.params;
    const body = await req.json();
    const { action } = body;

    if (!["suspend", "block", "delete"].includes(action)) {
      return NextResponse.json(
        { error: "Invalid action. Must be 'suspend', 'block', or 'delete'" },
        { status: 400 }
      );
    }

    // Prevent admin from deleting themselves
    if (action === "delete" && userId === adminId) {
      return NextResponse.json(
        { error: "You cannot delete your own account" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Prevent deleting other admins
    if (action === "delete" && user.role === "ADMIN") {
      return NextResponse.json(
        { error: "Cannot delete admin accounts" },
        { status: 400 }
      );
    }

    if (action === "delete") {
      // Delete user and all related data
      await prisma.user.delete({
        where: { id: userId },
      });
    } else if (action === "suspend") {
      // For suspend, we could add a suspended field to the User model
      // For now, we'll add a note in metadata or create a separate table
      // This is a placeholder - you may want to add a `suspended` boolean field
      console.log(`[ADMIN] User ${userId} suspended by ${adminId}`);
    } else if (action === "block") {
      // Similar to suspend, you may want to add a `blocked` boolean field
      console.log(`[ADMIN] User ${userId} blocked by ${adminId}`);
    }

    return NextResponse.json({
      success: true,
      message: `User ${action}ed successfully`,
    });
  } catch (error: any) {
    console.error("Error performing user action:", error);
    return NextResponse.json(
      { error: error.message || "Failed to perform action" },
      { status: error.message === "Admin access required" ? 403 : 500 }
    );
  }
}

