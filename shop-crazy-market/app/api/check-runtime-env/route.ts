import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/check-runtime-env
 * 
 * Check if DATABASE_URL is available at runtime (not just build time)
 */
export async function GET() {
  const dbUrl = process.env.DATABASE_URL;
  
  return NextResponse.json({
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    vercelEnv: process.env.VERCEL_ENV,
    databaseUrl: {
      exists: !!dbUrl,
      length: dbUrl?.length || 0,
      startsWithPostgresql: dbUrl?.startsWith('postgresql://') || false,
      hasPooler: dbUrl?.includes('pooler.supabase.com') || false,
      hasPgbouncer: dbUrl?.includes('pgbouncer=true') || false,
      // Show first 50 chars (without password)
      preview: dbUrl ? dbUrl.replace(/:([^:@]+)@/, ':****@').substring(0, 100) : 'not set',
    },
    allEnvVars: {
      nodeEnv: process.env.NODE_ENV,
      vercelEnv: process.env.VERCEL_ENV,
      vercelUrl: process.env.VERCEL_URL,
      hasDatabaseUrl: !!process.env.DATABASE_URL,
    },
    recommendation: !dbUrl 
      ? "❌ DATABASE_URL is NOT available at runtime. Check Vercel environment variables."
      : "✅ DATABASE_URL is available at runtime.",
  });
}

