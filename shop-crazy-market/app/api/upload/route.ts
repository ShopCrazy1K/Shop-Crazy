import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

/**
 * POST /api/upload
 * 
 * Handle file uploads using Supabase Storage
 */
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Validate file size
    const isImage = file.type.startsWith("image/");
    const maxSize = isImage ? 5 * 1024 * 1024 : 50 * 1024 * 1024; // 5MB for images, 50MB for other files
    
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: `File size exceeds ${isImage ? "5MB" : "50MB"} limit` },
        { status: 400 }
      );
    }

    // Check if Supabase is configured
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      // Fallback to data URL for small images if Supabase not configured
      if (isImage && file.size < 2 * 1024 * 1024) {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const base64 = buffer.toString('base64');
        const dataUrl = `data:${file.type};base64,${base64}`;
        
        return NextResponse.json({
          success: true,
          url: dataUrl,
          filename: file.name,
          size: file.size,
          warning: "Using data URL - configure Supabase Storage for better performance",
        });
      }

      return NextResponse.json(
        { 
          error: "Supabase Storage not configured. Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.",
          suggestion: "See UPLOAD_STORAGE_SETUP.md for setup instructions."
        },
        { status: 500 }
      );
    }

    // Upload to Supabase Storage
    try {
      const supabase = getSupabaseAdmin();
      
      // Determine bucket based on file type
      const bucket = isImage ? 'product-images' : 'digital-files';
      
      // Generate unique filename
      const timestamp = Date.now();
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
      const filename = `${timestamp}_${sanitizedName}`;
      const filePath = `${bucket}/${filename}`;

      // Convert file to buffer
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Upload to Supabase Storage
      const { data, error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, buffer, {
          contentType: file.type,
          upsert: false, // Don't overwrite existing files
        });

      if (uploadError) {
        // If bucket doesn't exist, try 'uploads' bucket as fallback
        if (uploadError.message.includes('not found')) {
          const { data: fallbackData, error: fallbackError } = await supabase.storage
            .from('uploads')
            .upload(`uploads/${filename}`, buffer, {
              contentType: file.type,
              upsert: false,
            });

          if (fallbackError) {
            console.error("Supabase upload error:", fallbackError);
            return NextResponse.json(
              { 
                error: `Failed to upload file: ${fallbackError.message}`,
                suggestion: "Make sure the storage bucket exists in Supabase. See UPLOAD_STORAGE_SETUP.md"
              },
              { status: 500 }
            );
          }

          // Get public URL
          const { data: urlData } = supabase.storage
            .from('uploads')
            .getPublicUrl(`uploads/${filename}`);

          return NextResponse.json({
            success: true,
            url: urlData.publicUrl,
            filename: file.name,
            size: file.size,
            path: `uploads/${filename}`,
          });
        }

        console.error("Supabase upload error:", uploadError);
        return NextResponse.json(
          { 
            error: `Failed to upload file: ${uploadError.message}`,
            suggestion: "Make sure the storage bucket exists in Supabase. See UPLOAD_STORAGE_SETUP.md"
          },
          { status: 500 }
        );
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      return NextResponse.json({
        success: true,
        url: urlData.publicUrl,
        filename: file.name,
        size: file.size,
        path: filePath,
      });
    } catch (storageError: any) {
      console.error("Storage error:", storageError);
      
      // Fallback to data URL for small images
      if (isImage && file.size < 2 * 1024 * 1024) {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const base64 = buffer.toString('base64');
        const dataUrl = `data:${file.type};base64,${base64}`;
        
        return NextResponse.json({
          success: true,
          url: dataUrl,
          filename: file.name,
          size: file.size,
          warning: "Using data URL fallback - Supabase Storage error occurred",
        });
      }

      return NextResponse.json(
        { 
          error: `Storage error: ${storageError.message}`,
          suggestion: "Check Supabase Storage configuration. See UPLOAD_STORAGE_SETUP.md"
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("File upload error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to upload file" },
      { status: 500 }
    );
  }
}
