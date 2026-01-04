import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET() {
  const results: any = {
    timestamp: new Date().toISOString(),
    checks: {},
  };

  // Check 1: DATABASE_URL exists
  results.checks.databaseUrl = {
    configured: !!process.env.DATABASE_URL,
    hasValue: !!process.env.DATABASE_URL?.trim(),
    length: process.env.DATABASE_URL?.length || 0,
    preview: process.env.DATABASE_URL ? `${process.env.DATABASE_URL.substring(0, 30)}...` : 'NOT SET',
  };

  // Check 2: Test database connection
  try {
    const startTime = Date.now();
    await prisma.$queryRaw`SELECT 1 as test`;
    const queryTime = Date.now() - startTime;
    
    results.checks.databaseConnection = {
      connected: true,
      queryTime: `${queryTime}ms`,
      error: null,
    };
  } catch (error: any) {
    results.checks.databaseConnection = {
      connected: false,
      error: error.message || 'Unknown error',
      code: error.code,
      name: error.name,
    };
  }

  // Check 3: Test listing query
  try {
    const startTime = Date.now();
    const count = await prisma.listing.count();
    const queryTime = Date.now() - startTime;
    
    results.checks.listingsQuery = {
      success: true,
      count: count,
      queryTime: `${queryTime}ms`,
      error: null,
    };
  } catch (error: any) {
    results.checks.listingsQuery = {
      success: false,
      error: error.message || 'Unknown error',
      code: error.code,
    };
  }

  // Overall status
  const allPassed = 
    results.checks.databaseUrl?.configured &&
    results.checks.databaseConnection?.connected &&
    results.checks.listingsQuery?.success;

  results.status = allPassed ? 'ok' : 'error';
  results.summary = {
    databaseConfigured: results.checks.databaseUrl?.configured,
    databaseConnected: results.checks.databaseConnection?.connected,
    canQueryListings: results.checks.listingsQuery?.success,
  };

  return NextResponse.json(results, {
    status: allPassed ? 200 : 500,
  });
}
