import { NextResponse } from "next/server";

/**
 * POST /api/upload
 * 
 * Handle file uploads - uses data URLs for now (works without cloud storage)
 * 
 * For production, configure cloud storage (Supabase Storage, Vercel Blob, Cloudinary, etc.)
 * 
 * Updated: Uses data URLs instead of filesystem (Vercel-compatible)
 * Deployed: $(date) - Ready for production
 */
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

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

    // For now, use data URLs (works without cloud storage setup)
    // This works for small to medium files
    const maxDataUrlSize = 10 * 1024 * 1024; // 10MB max for data URLs
    
    if (file.size > maxDataUrlSize) {
      return NextResponse.json(
        { 
          error: "File too large for data URL. Please configure cloud storage (Supabase Storage, Vercel Blob, or Cloudinary).",
          maxSize: "10MB for data URLs",
          suggestion: "See UPLOAD_STORAGE_SETUP.md for cloud storage setup."
        },
        { status: 400 }
      );
    }

    // Convert to base64 data URL
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString('base64');
    const dataUrl = `data:${file.type};base64,${base64}`;
    
    return NextResponse.json({
      success: true,
      url: dataUrl,
      filename: file.name,
      size: file.size,
      type: file.type,
      note: "Using data URL. Configure cloud storage for better performance.",
    });
  } catch (error: any) {
    console.error("File upload error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to upload file" },
      { status: 500 }
    );
  }
}
