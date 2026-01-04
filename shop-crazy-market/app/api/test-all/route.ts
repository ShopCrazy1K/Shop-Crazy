import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET() {
  const results: any = {
    timestamp: new Date().toISOString(),
    checks: {},
  };

  // Check 1: DATABASE_URL
  results.checks.databaseUrl = {
    configured: !!process.env.DATABASE_URL,
    hasValue: !!process.env.DATABASE_URL?.trim(),
    length: process.env.DATABASE_URL?.length || 0,
  };

  // Check 2: Database Connection
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
  }

  // Check 3: NEXTAUTH_SECRET
  results.checks.nextAuthSecret = {
    configured: !!process.env.NEXTAUTH_SECRET,
    hasValue: !!process.env.NEXTAUTH_SECRET?.trim(),
  };

  // Check 4: NEXTAUTH_URL
  results.checks.nextAuthUrl = {
    configured: !!process.env.NEXTAUTH_URL,
    value: process.env.NEXTAUTH_URL || 'NOT SET',
  };

  // Check 5: Test listing query
  try {
    const listingCount = await prisma.listing.count({
      where: { isActive: true },
    });
    results.checks.listingsQuery = {
      success: true,
      activeListings: listingCount,
    };
  } catch (error: any) {
    results.checks.listingsQuery = {
      success: false,
      error: error.message,
    };
  }

  // Check 6: Test notification query
  try {
    const notificationCount = await prisma.notification.count();
    results.checks.notificationsQuery = {
      success: true,
      totalNotifications: notificationCount,
    };
  } catch (error: any) {
    results.checks.notificationsQuery = {
      success: false,
      error: error.message,
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
    canQueryNotifications: results.checks.notificationsQuery?.success,
  };

  return NextResponse.json(results, {
    status: allPassed ? 200 : 500,
  });
}
