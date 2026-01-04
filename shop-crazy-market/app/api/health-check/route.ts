import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const hasDatabaseUrl = !!process.env.DATABASE_URL;
    
    let dbConnected = false;
    if (hasDatabaseUrl) {
      try {
        const { prisma } = await import("@/lib/prisma");
        await prisma.$queryRaw`SELECT 1`;
        dbConnected = true;
      } catch (error) {
        dbConnected = false;
      }
    }

    return NextResponse.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      database: {
        configured: hasDatabaseUrl,
        connected: dbConnected,
      },
    });
  } catch (error: any) {
    return NextResponse.json({
      status: "error",
      error: error.message,
    }, { status: 500 });
  }
}
