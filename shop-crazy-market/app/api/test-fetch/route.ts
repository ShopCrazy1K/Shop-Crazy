import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/test-fetch
 * 
 * Simple test endpoint to verify fetch works from client
 */
export async function GET() {
  return NextResponse.json({
    success: true,
    message: "Fetch is working!",
    timestamp: new Date().toISOString(),
  });
}

