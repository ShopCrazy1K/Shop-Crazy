import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/verify-env
 * 
 * Simple endpoint to verify DATABASE_URL is available in Vercel
 */
export async function GET() {
  const dbUrl = process.env.DATABASE_URL;
  
  // Check all environment variables that start with DATABASE
  const envVars = Object.keys(process.env)
    .filter(key => key.includes('DATABASE'))
    .reduce((acc, key) => {
      const value = process.env[key];
      // Mask the password in the URL
      const masked = value ? value.replace(/:([^:@]+)@/, ':****@') : 'not set';
      acc[key] = {
        exists: !!value,
        length: value?.length || 0,
        masked: masked.substring(0, 100),
        startsWithPostgresql: value?.startsWith('postgresql://') || false,
      };
      return acc;
    }, {} as Record<string, any>);

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    nodeEnv: process.env.NODE_ENV,
    vercelEnv: process.env.VERCEL_ENV,
    databaseUrl: {
      exists: !!dbUrl,
      length: dbUrl?.length || 0,
      masked: dbUrl ? dbUrl.replace(/:([^:@]+)@/, ':****@').substring(0, 100) : 'not set',
      startsWithPostgresql: dbUrl?.startsWith('postgresql://') || false,
    },
    allDatabaseEnvVars: envVars,
    recommendation: !dbUrl 
      ? "DATABASE_URL is not set. Go to Vercel Dashboard → Settings → Environment Variables and add it."
      : "DATABASE_URL is set! If you're still seeing errors, try redeploying.",
  });
}

