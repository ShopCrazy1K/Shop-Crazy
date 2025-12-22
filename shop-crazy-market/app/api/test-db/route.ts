import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/test-db
 * 
 * Test database connection and verify tables exist
 */
export const dynamic = 'force-dynamic';
export async function GET() {
  try {
    // Test 1: Basic connection
    await prisma.$connect();
    
    // Test 2: Check if User table exists by trying to count
    const userCount = await prisma.user.count();
    
    // Test 3: Try a simple query
    const testQuery = await prisma.$queryRaw`SELECT 1 as test`;
    
    return NextResponse.json({
      success: true,
      message: "Database connection successful!",
      details: {
        connected: true,
        userTableExists: true,
        userCount,
        testQuery: testQuery,
        databaseUrl: process.env.DATABASE_URL
          ? `${process.env.DATABASE_URL.substring(0, 30)}...` // Mask full URL
          : "Not set",
      },
    });
  } catch (error: any) {
    console.error("Database test error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Database connection failed",
        details: {
          errorCode: error.code,
          errorName: error.name,
          databaseUrl: process.env.DATABASE_URL
            ? `${process.env.DATABASE_URL.substring(0, 30)}...`
            : "Not set",
        },
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

