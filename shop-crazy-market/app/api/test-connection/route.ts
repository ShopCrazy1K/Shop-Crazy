import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/test-connection
 * 
 * Test database connection and Prisma client
 */
export async function GET() {
  try {
    console.log('[TEST] Testing database connection...');
    console.log('[TEST] DATABASE_URL present:', !!process.env.DATABASE_URL);
    console.log('[TEST] DATABASE_URL length:', process.env.DATABASE_URL?.length || 0);
    console.log('[TEST] DATABASE_URL starts with:', process.env.DATABASE_URL?.substring(0, 30) || 'none');
    
    // Try a simple query
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    
    console.log('[TEST] ✅ Database connection successful!');
    
    return NextResponse.json({
      success: true,
      message: "Database connection successful",
      test: result,
    });
  } catch (error: any) {
    console.error('[TEST] ❌ Database connection failed:', error);
    console.error('[TEST] Error message:', error.message);
    console.error('[TEST] Error stack:', error.stack);
    
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Database connection failed",
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

