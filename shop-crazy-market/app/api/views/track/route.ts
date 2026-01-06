import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * Track a page view
 * This endpoint is called from the client to track page views
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { path, userId } = body;

    if (!path || typeof path !== 'string') {
      return NextResponse.json(
        { ok: false, error: "Path is required" },
        { status: 400 }
      );
    }

    // Get user agent and IP from headers
    const userAgent = request.headers.get('user-agent') || null;
    const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0] || 
                     request.headers.get('x-real-ip') || 
                     null;

    // Get current date (date only, no time)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Create or update page view record
    // We'll create a new record for each view to track multiple views per day
    await prisma.pageView.create({
      data: {
        date: today,
        path: path,
        userAgent: userAgent,
        ipAddress: ipAddress,
        userId: userId || null,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error("[API VIEWS TRACK] Error tracking view:", error);
    return NextResponse.json(
      { ok: false, error: error.message || "Failed to track view" },
      { status: 500 }
    );
  }
}