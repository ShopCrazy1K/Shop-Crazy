import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

/**
 * POST /api/upload
 * 
 * Handle file uploads to Supabase Storage
 */
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    console.log("[UPLOAD] Starting file upload...");
    
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      console.error("[UPLOAD] No file provided");
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    console.log("[UPLOAD] File received:", {
      name: file.name,
      size: file.size,
      type: file.type,
    });

    // Validate file size
    const isImage = file.type.startsWith("image/");
    const maxSize = isImage ? 5 * 1024 * 1024 : 50 * 1024 * 1024; // 5MB for images, 50MB for other files
    
    if (file.size > maxSize) {
      console.error("[UPLOAD] File too large:", file.size);
      return NextResponse.json(
        { error: `File size exceeds ${isImage ? "5MB" : "50MB"} limit` },
        { status: 400 }
      );
    }

    // Determine bucket based on file type
    const bucket = isImage ? "product-images" : "digital-files";
    const supabase = getSupabaseAdmin();

    // Generate unique filename
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 15);
    const fileExt = file.name.split('.').pop() || 'bin';
    const fileName = `${timestamp}-${randomStr}.${fileExt}`;
    const filePath = `${bucket}/${fileName}`;

    console.log("[UPLOAD] Uploading to Supabase Storage:", {
      bucket,
      filePath,
    });

    // Convert File to ArrayBuffer then to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error("[UPLOAD] Supabase upload error:", uploadError);
      
      // If bucket doesn't exist, provide helpful error
      if (uploadError.message?.includes("Bucket not found")) {
        return NextResponse.json(
          { 
            error: `Storage bucket "${bucket}" not found. Please create it in Supabase Storage.`,
            details: uploadError.message,
          },
          { status: 400 }
        );
      }
      
      return NextResponse.json(
        { 
          error: "Failed to upload file to storage",
          details: uploadError.message,
        },
        { status: 500 }
      );
    }

    console.log("[UPLOAD] Upload successful:", uploadData);

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    const publicUrl = urlData.publicUrl;

    console.log("[UPLOAD] Public URL generated:", publicUrl);

    return NextResponse.json({
      success: true,
      url: publicUrl,
      filename: file.name,
      size: file.size,
      type: file.type,
      bucket,
      path: filePath,
    });
  } catch (error: any) {
    console.error("[UPLOAD] Unexpected error:", error);
    return NextResponse.json(
      { 
        error: error.message || "Failed to upload file",
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
