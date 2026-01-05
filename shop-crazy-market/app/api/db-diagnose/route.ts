import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

export const dynamic = 'force-dynamic';

export async function GET() {
  const results: any = {
    timestamp: new Date().toISOString(),
    checks: {},
  };

  // Check 1: DATABASE_URL exists in environment
  results.checks.envVar = {
    exists: !!process.env.DATABASE_URL,
    length: process.env.DATABASE_URL?.length || 0,
    startsWithPostgres: process.env.DATABASE_URL?.startsWith('postgresql://') || process.env.DATABASE_URL?.startsWith('postgres://'),
    hasPooler: process.env.DATABASE_URL?.includes('pooler'),
    hasPgbouncer: process.env.DATABASE_URL?.includes('pgbouncer'),
    preview: process.env.DATABASE_URL ? 
      `${process.env.DATABASE_URL.substring(0, 30)}...${process.env.DATABASE_URL.substring(process.env.DATABASE_URL.length - 20)}` : 
      'NOT_SET',
  };

  if (!process.env.DATABASE_URL) {
    results.status = 'error';
    results.message = 'DATABASE_URL environment variable is not set';
    results.fix = 'Go to Vercel → Settings → Environment Variables → Add DATABASE_URL';
    return NextResponse.json(results, { status: 500 });
  }

  // Check 2: Try to create Prisma client
  let prisma: PrismaClient | null = null;
  try {
    prisma = new PrismaClient({
      log: ['error'],
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
    });
    results.checks.prismaClient = {
      created: true,
      error: null,
    };
  } catch (error: any) {
    results.checks.prismaClient = {
      created: false,
      error: error.message || 'Unknown error',
      code: error.code,
    };
    results.status = 'error';
    results.message = 'Failed to create Prisma client';
    results.fix = 'Check DATABASE_URL format - it might be invalid';
    return NextResponse.json(results, { status: 500 });
  }

  // Check 3: Test database connection with a simple query
  if (prisma) {
    try {
      const startTime = Date.now();
      await prisma.$queryRaw`SELECT 1 as test`;
      const queryTime = Date.now() - startTime;
      
      results.checks.connection = {
        success: true,
        queryTime: `${queryTime}ms`,
        error: null,
      };
    } catch (error: any) {
      results.checks.connection = {
        success: false,
        error: error.message || 'Unknown error',
        code: error.code,
        name: error.name,
        meta: error.meta,
      };
      results.status = 'error';
      results.message = 'Database connection failed';
      
      // Provide specific error messages based on error code
      if (error.code === 'P1001') {
        results.fix = 'Cannot reach database server. Check if DATABASE_URL is correct and database is accessible.';
        results.suggestion = 'Try using direct connection URL (port 5432) instead of pooler (port 6543)';
      } else if (error.code === 'P1000') {
        results.fix = 'Authentication failed. Check DATABASE_URL username and password.';
      } else if (error.message?.includes('timeout')) {
        results.fix = 'Connection timeout. Database might be slow or unreachable.';
        results.suggestion = 'Check network connectivity or try again in a moment';
      } else if (error.message?.includes('prepared statement')) {
        results.fix = 'PgBouncer issue. Try adding ?pgbouncer=true to DATABASE_URL or use direct connection.';
      } else {
        results.fix = 'Unknown database error. Check DATABASE_URL format and database status.';
      }
      
      return NextResponse.json(results, { status: 503 });
    } finally {
      // Clean up Prisma client
      try {
        await prisma.$disconnect();
      } catch (e) {}
    }
  }

  // Check 4: Test a simple query on a table
  if (prisma) {
    try {
      const count = await prisma.listing.count();
      results.checks.tableQuery = {
        success: true,
        listingCount: count,
        error: null,
      };
    } catch (error: any) {
      results.checks.tableQuery = {
        success: false,
        error: error.message || 'Unknown error',
        code: error.code,
      };
    } finally {
      try {
        await prisma.$disconnect();
      } catch (e) {}
    }
  }

  results.status = 'ok';
  results.message = 'Database connection is working!';
  
  return NextResponse.json(results, { status: 200 });
}
