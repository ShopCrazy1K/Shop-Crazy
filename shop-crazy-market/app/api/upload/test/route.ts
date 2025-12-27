import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

/**
 * GET /api/upload/test
 * 
 * Diagnostic endpoint to test Supabase Storage configuration
 */
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  try {
    const results: any = {
      timestamp: new Date().toISOString(),
      checks: {},
    };

    // Check 1: Environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    results.checks.envVars = {
      hasUrl: !!supabaseUrl,
      hasServiceKey: !!supabaseServiceKey,
      hasAnonKey: !!supabaseAnonKey,
      urlPreview: supabaseUrl ? supabaseUrl.substring(0, 30) + "..." : "missing",
      serviceKeyPreview: supabaseServiceKey ? supabaseServiceKey.substring(0, 20) + "..." : "missing",
    };

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({
        success: false,
        error: "Missing Supabase environment variables",
        results,
      }, { status: 500 });
    }

    // Check 2: Create Supabase client
    let supabase;
    try {
      supabase = getSupabaseAdmin();
      results.checks.clientCreated = { success: true };
    } catch (error: any) {
      results.checks.clientCreated = {
        success: false,
        error: error.message,
      };
      return NextResponse.json({
        success: false,
        error: "Failed to create Supabase client",
        results,
      }, { status: 500 });
    }

    // Check 3: List buckets
    try {
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
      
      results.checks.listBuckets = {
        success: !bucketsError,
        error: bucketsError?.message,
        buckets: buckets?.map(b => ({
          name: b.name,
          public: b.public,
          id: b.id,
        })) || [],
      };

      // Check 4: Verify required buckets exist
      const requiredBuckets = ["product-images", "digital-files"];
      const bucketNames = buckets?.map(b => b.name) || [];
      
      results.checks.requiredBuckets = {
        required: requiredBuckets,
        existing: bucketNames,
        missing: requiredBuckets.filter(b => !bucketNames.includes(b)),
        allExist: requiredBuckets.every(b => bucketNames.includes(b)),
      };

      // Check 5: Test upload (small test file)
      if (results.checks.requiredBuckets.allExist) {
        try {
          const testContent = Buffer.from("test file content");
          const testPath = `test-${Date.now()}.txt`;
          
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from("product-images")
            .upload(testPath, testContent, {
              contentType: "text/plain",
              upsert: false,
            });

          results.checks.testUpload = {
            success: !uploadError,
            error: uploadError?.message,
            path: uploadData?.path,
          };

          // Clean up test file
          if (uploadData?.path && !uploadError) {
            await supabase.storage
              .from("product-images")
              .remove([testPath]);
          }
        } catch (testError: any) {
          results.checks.testUpload = {
            success: false,
            error: testError.message,
          };
        }
      }

      return NextResponse.json({
        success: true,
        results,
        summary: {
          envVarsConfigured: results.checks.envVars.hasUrl && results.checks.envVars.hasServiceKey,
          clientWorking: results.checks.clientCreated.success,
          bucketsAccessible: results.checks.listBuckets.success,
          allBucketsExist: results.checks.requiredBuckets?.allExist || false,
          uploadWorking: results.checks.testUpload?.success || false,
        },
      });
    } catch (error: any) {
      results.checks.listBuckets = {
        success: false,
        error: error.message,
      };
      return NextResponse.json({
        success: false,
        error: "Failed to list buckets",
        results,
      }, { status: 500 });
    }
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message || "Unknown error",
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    }, { status: 500 });
  }
}

