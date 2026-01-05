import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const listingId = searchParams.get("id");

  const results: any = {
    timestamp: new Date().toISOString(),
    listingId: listingId || "NOT_PROVIDED",
    checks: {},
  };

  // Check 1: DATABASE_URL
  results.checks.databaseUrl = {
    configured: !!process.env.DATABASE_URL,
    hasValue: !!process.env.DATABASE_URL?.trim(),
    length: process.env.DATABASE_URL?.length || 0,
    preview: process.env.DATABASE_URL ? 
      `${process.env.DATABASE_URL.substring(0, 50)}...` : 
      'NOT_SET',
  };

  // Check 2: Prisma client initialization
  try {
    results.checks.prismaClient = {
      initialized: true,
      error: null,
    };
  } catch (error: any) {
    results.checks.prismaClient = {
      initialized: false,
      error: error.message || 'Unknown error',
    };
  }

  // Check 3: Database connection
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
    results.status = 'error';
    return NextResponse.json(results, { status: 503 });
  }

  // Check 4: If listing ID provided, test fetching it
  if (listingId) {
    try {
      const startTime = Date.now();
      const listing = await prisma.listing.findUnique({
        where: { id: listingId },
        select: {
          id: true,
          title: true,
          isActive: true,
          sellerId: true,
        },
      });
      const queryTime = Date.now() - startTime;
      
      results.checks.listingFetch = {
        success: true,
        found: !!listing,
        queryTime: `${queryTime}ms`,
        listing: listing || null,
        error: null,
      };
    } catch (error: any) {
      results.checks.listingFetch = {
        success: false,
        found: false,
        error: error.message || 'Unknown error',
        code: error.code,
      };
    }
  }

  // Check 5: Test listings count
  try {
    const count = await prisma.listing.count();
    results.checks.listingsCount = {
      success: true,
      count: count,
      error: null,
    };
  } catch (error: any) {
    results.checks.listingsCount = {
      success: false,
      error: error.message || 'Unknown error',
    };
  }

  // Overall status
  const allPassed = 
    results.checks.databaseUrl?.configured &&
    results.checks.databaseConnection?.connected;

  results.status = allPassed ? 'ok' : 'error';
  results.summary = {
    databaseConfigured: results.checks.databaseUrl?.configured,
    databaseConnected: results.checks.databaseConnection?.connected,
    canFetchListings: results.checks.listingsCount?.success,
  };

  // Add recommendations
  if (!results.checks.databaseUrl?.configured) {
    results.recommendation = "DATABASE_URL is not set in Vercel. Go to Settings → Environment Variables → Add DATABASE_URL";
  } else if (!results.checks.databaseConnection?.connected) {
    results.recommendation = "DATABASE_URL is set but connection failed. Check the URL format and database accessibility.";
  } else if (listingId && !results.checks.listingFetch?.found) {
    results.recommendation = `Listing ${listingId} not found in database. Check if the ID is correct.`;
  } else {
    results.recommendation = "Database connection is working. Check browser console for client-side errors.";
  }

  return NextResponse.json(results, {
    status: allPassed ? 200 : 500,
  });
}
