import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * POST /api/admin/promote
 * Promote a user to admin (one-time setup endpoint)
 * 
 * SECURITY NOTE: This endpoint should be removed or protected after initial setup.
 * For production, use a secret key or restrict to localhost only.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, secretKey } = body;

    // Simple secret key protection (change this in production!)
    // You can set this in your .env file as ADMIN_PROMOTE_SECRET
    const requiredSecret = process.env.ADMIN_PROMOTE_SECRET || "CHANGE_THIS_IN_PRODUCTION";
    
    if (secretKey !== requiredSecret) {
      return NextResponse.json(
        { error: "Invalid secret key" },
        { status: 403 }
      );
    }

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, role: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    if (user.role === "ADMIN") {
      return NextResponse.json(
        { message: "User is already an admin" },
        { status: 200 }
      );
    }

    // Promote to admin
    await prisma.user.update({
      where: { id: user.id },
      data: { role: "ADMIN" },
    });

    return NextResponse.json({
      success: true,
      message: `User ${email} has been promoted to admin`,
    });
  } catch (error: any) {
    console.error("Error promoting user to admin:", error);
    return NextResponse.json(
      { error: error.message || "Failed to promote user" },
      { status: 500 }
    );
  }
}

