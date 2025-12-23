import { NextResponse } from "next/server";
import { PrismaClient } from '@prisma/client';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/test-prisma-connection
 * 
 * Test Prisma connection with detailed error reporting
 * This will show us exactly where the error occurs
 */
export async function GET() {
  try {
    const dbUrl = process.env.DATABASE_URL;
    
    if (!dbUrl) {
      return NextResponse.json({
        error: "DATABASE_URL is not set",
      }, { status: 500 });
    }

    const results: any = {
      step1_checkUrl: {
        present: !!dbUrl,
        length: dbUrl.length,
        startsWithPostgresql: dbUrl.startsWith('postgresql://'),
        first50Chars: dbUrl.substring(0, 50) + '...',
      },
    };

    // Step 2: Try to parse URL
    try {
      const url = new URL(dbUrl);
      results.step2_parseUrl = {
        success: true,
        protocol: url.protocol,
        username: url.username,
        hostname: url.hostname,
        port: url.port || 'default',
        pathname: url.pathname,
        passwordLength: url.password?.length || 0,
      };
    } catch (parseError: any) {
      results.step2_parseUrl = {
        success: false,
        error: parseError.message,
      };
      return NextResponse.json({ results, error: "Failed to parse URL" }, { status: 500 });
    }

    // Step 3: Check Prisma pattern
    const prismaPattern = /^postgresql:\/\/([^:]+):([^@]+)@([^:]+)(?::(\d+))?(\/.*)?$/;
    const matches = dbUrl.match(prismaPattern);
    results.step3_prismaPattern = {
      matches: !!matches,
      groups: matches ? {
        username: matches[1],
        passwordLength: matches[2].length,
        host: matches[3],
        port: matches[4] || 'default',
        path: matches[5] || '/postgres',
      } : null,
    };

    if (!matches) {
      return NextResponse.json({ 
        results, 
        error: "URL does not match Prisma's expected pattern",
        suggestion: "Check for extra spaces, wrong protocol, or unencoded special characters",
      }, { status: 500 });
    }

    // Step 4: Try to create PrismaClient
    try {
      console.log('[TEST] Attempting to create PrismaClient...');
      const prisma = new PrismaClient({
        log: ['error'],
      });
      results.step4_createClient = {
        success: true,
        message: "PrismaClient created successfully",
      };

      // Step 5: Try to connect
      try {
        console.log('[TEST] Attempting to connect...');
        await prisma.$connect();
        results.step5_connect = {
          success: true,
          message: "Connected successfully",
        };

        // Step 6: Try a simple query
        try {
          console.log('[TEST] Attempting simple query...');
          await prisma.$queryRaw`SELECT 1 as test`;
          results.step6_query = {
            success: true,
            message: "Query executed successfully",
          };

          await prisma.$disconnect();
          
          return NextResponse.json({
            success: true,
            message: "All tests passed! Prisma connection is working.",
            results,
          });
        } catch (queryError: any) {
          await prisma.$disconnect();
          results.step6_query = {
            success: false,
            error: queryError.message,
            code: queryError.code,
          };
          return NextResponse.json({ 
            results, 
            error: "Connection successful but query failed",
            details: queryError.message,
          }, { status: 500 });
        }
      } catch (connectError: any) {
        await prisma.$disconnect().catch(() => {});
        results.step5_connect = {
          success: false,
          error: connectError.message,
          code: connectError.code,
          includesPattern: connectError.message?.includes('pattern'),
          includesExpected: connectError.message?.includes('expected'),
        };
        return NextResponse.json({ 
          results, 
          error: "Failed to connect to database",
          details: connectError.message,
        }, { status: 500 });
      }
    } catch (clientError: any) {
      results.step4_createClient = {
        success: false,
        error: clientError.message,
        code: clientError.code,
        name: clientError.name,
        includesPattern: clientError.message?.includes('pattern'),
        includesExpected: clientError.message?.includes('expected'),
        includesString: clientError.message?.includes('string did not match'),
      };
      return NextResponse.json({ 
        results, 
        error: "Failed to create PrismaClient",
        details: clientError.message,
        suggestion: "This is likely a DATABASE_URL format validation error",
      }, { status: 500 });
    }
  } catch (error: any) {
    return NextResponse.json({
      error: error.message || "Failed to test Prisma connection",
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    }, { status: 500 });
  }
}

