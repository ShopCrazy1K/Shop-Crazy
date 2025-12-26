import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/debug-database-url
 * 
 * Debug endpoint to see exactly what DATABASE_URL Prisma is receiving
 * This helps diagnose "pattern mismatch" errors
 */
export async function GET() {
  try {
    const dbUrl = process.env.DATABASE_URL;
    
    if (!dbUrl) {
      return NextResponse.json({
        error: "DATABASE_URL is not set",
      }, { status: 500 });
    }

    // Parse URL to show components (hide password)
    let urlInfo: any = {
      raw: dbUrl.substring(0, 50) + '...',
      length: dbUrl.length,
      startsWithPostgresql: dbUrl.startsWith('postgresql://'),
      hasAtSymbol: dbUrl.includes('@'),
      hasColon: dbUrl.includes(':'),
    };

    try {
      const url = new URL(dbUrl);
      urlInfo.parsed = {
        protocol: url.protocol,
        username: url.username,
        password: url.password ? '***' : 'none',
        hostname: url.hostname,
        port: url.port || 'default (5432)',
        pathname: url.pathname,
        search: url.search,
        hash: url.hash,
      };
      
      // Check for special characters in password
      if (url.password) {
        const hasSpecialChars = /[#\$@%&]/.test(url.password);
        const isEncoded = url.password.includes('%');
        urlInfo.passwordInfo = {
          hasSpecialChars,
          isEncoded,
          length: url.password.length,
          firstChar: url.password[0],
          lastChar: url.password[url.password.length - 1],
        };
      }
    } catch (parseError: any) {
      urlInfo.parseError = parseError.message;
    }

    // Try to match Prisma's expected pattern
    const prismaPattern = /^postgresql:\/\/([^:]+):([^@]+)@([^:]+)(?::(\d+))?(\/.*)?$/;
    const matches = dbUrl.match(prismaPattern);
    
    if (matches) {
      urlInfo.prismaPatternMatch = {
        success: true,
        username: matches[1],
        passwordLength: matches[2].length,
        host: matches[3],
        port: matches[4] || 'default',
        path: matches[5] || '/postgres',
      };
    } else {
      urlInfo.prismaPatternMatch = {
        success: false,
        reason: "URL does not match Prisma's expected pattern",
      };
    }

    // Try to actually test Prisma connection
    let prismaTest: any = { tested: false };
    try {
      const { prisma } = await import("@/lib/prisma");
      // Try a simple query to test actual connection
      await prisma.$queryRaw`SELECT 1 as test`;
      prismaTest = {
        tested: true,
        success: true,
        message: "Prisma connection successful",
      };
    } catch (prismaError: any) {
      prismaTest = {
        tested: true,
        success: false,
        error: prismaError.message || String(prismaError),
        includesPattern: prismaError.message?.includes('pattern') || prismaError.message?.includes('expected'),
      };
    }

    // Show URL with password hidden for logging
    const urlForLogging = dbUrl.replace(/:([^:@]+)@/, ':****@');
    
    return NextResponse.json({
      success: true,
      urlInfo,
      urlForLogging: urlForLogging.substring(0, 100),
      prismaTest,
      recommendation: matches 
        ? (prismaTest.success 
          ? "URL format looks correct and Prisma connection is working."
          : "URL format looks correct but Prisma connection failed. Check Vercel logs for details.")
        : "URL format does not match Prisma's expected pattern. Use: postgresql://user:password@host:port/database",
    });
  } catch (error: any) {
    return NextResponse.json({
      error: error.message || "Failed to debug DATABASE_URL",
    }, { status: 500 });
  }
}

