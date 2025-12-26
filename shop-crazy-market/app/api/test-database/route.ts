import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/test-database
 * 
 * Simple endpoint to test if database connection works
 * Returns detailed error information if it fails
 */
export async function GET() {
  try {
    // Test 1: Check if DATABASE_URL is set
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({
        success: false,
        error: "DATABASE_URL is not set",
        step: "environment_check",
      }, { status: 500 });
    }

    // Test 2: Try to use Prisma
    try {
      // Simple query to test connection
      const result = await prisma.$queryRaw`SELECT 1 as test`;
      
      return NextResponse.json({
        success: true,
        message: "Database connection successful",
        test: result,
        databaseUrl: {
          present: true,
          length: process.env.DATABASE_URL.length,
          startsWith: process.env.DATABASE_URL.substring(0, 30),
        },
      });
    } catch (prismaError: any) {
      const errorMsg = prismaError.message || String(prismaError);
      
      return NextResponse.json({
        success: false,
        error: errorMsg,
        step: "prisma_query",
        errorCode: prismaError.code,
        errorName: prismaError.name,
        details: {
          isPatternError: errorMsg.includes('pattern') || errorMsg.includes('expected') || errorMsg.includes('string did not match'),
          isConnectionError: errorMsg.includes('connect') || errorMsg.includes('reachable') || errorMsg.includes('ECONNREFUSED'),
          isAuthError: errorMsg.includes('authentication') || errorMsg.includes('password') || errorMsg.includes('credentials'),
        },
        databaseUrl: {
          present: true,
          length: process.env.DATABASE_URL.length,
          startsWith: process.env.DATABASE_URL.substring(0, 30),
        },
      }, { status: 500 });
    }
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message || "Unknown error",
      step: "general",
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    }, { status: 500 });
  }
}

