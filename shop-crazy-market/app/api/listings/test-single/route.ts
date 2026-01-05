import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const listingId = searchParams.get("id");

  if (!listingId) {
    return NextResponse.json(
      { error: "Missing listing ID parameter. Use ?id=LISTING_ID" },
      { status: 400 }
    );
  }

  const results: any = {
    timestamp: new Date().toISOString(),
    listingId,
    checks: {},
  };

  // Check 1: DATABASE_URL exists
  results.checks.databaseUrl = {
    configured: !!process.env.DATABASE_URL,
    hasValue: !!process.env.DATABASE_URL?.trim(),
  };

  // Check 2: Test database connection
  try {
    await prisma.$queryRaw`SELECT 1`;
    results.checks.databaseConnection = {
      connected: true,
      error: null,
    };
  } catch (error: any) {
    results.checks.databaseConnection = {
      connected: false,
      error: error.message || 'Unknown error',
      code: error.code,
    };
    return NextResponse.json(results, { status: 503 });
  }

  // Check 3: Try to fetch the specific listing
  try {
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      select: {
        id: true,
        title: true,
        isActive: true,
        sellerId: true,
      },
    });

    results.checks.listingQuery = {
      success: true,
      found: !!listing,
      listing: listing || null,
      error: null,
    };
  } catch (error: any) {
    results.checks.listingQuery = {
      success: false,
      found: false,
      error: error.message || 'Unknown error',
      code: error.code,
    };
  }

  // Overall status
  const allPassed = 
    results.checks.databaseUrl?.configured &&
    results.checks.databaseConnection?.connected &&
    results.checks.listingQuery?.success;

  results.status = allPassed ? 'ok' : 'error';

  return NextResponse.json(results, {
    status: allPassed ? 200 : 500,
  });
}
