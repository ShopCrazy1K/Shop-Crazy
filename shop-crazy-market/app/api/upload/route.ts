import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { rateLimit } from "@/lib/rate-limit";
import sharp from "sharp";

/**
 * POST /api/upload
 * 
 * Enhanced file upload handler with security, compression, and optimization
 */
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Allowed file types
const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
];

const ALLOWED_DIGITAL_FILE_TYPES = [
  'application/pdf',
  'application/zip',
  'application/x-zip-compressed',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];

const ALLOWED_IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
const ALLOWED_DIGITAL_EXTENSIONS = ['.pdf', '.zip', '.doc', '.docx', '.txt', '.xls', '.xlsx'];

// File size limits
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB (before compression)
const MAX_DIGITAL_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const MAX_IMAGE_DIMENSION = 2000; // Max width or height in pixels

const RATE_LIMIT_MAX = 20; // Max uploads per window
const RATE_LIMIT_WINDOW = 60; // 1 minute in seconds

/**
 * Validate file type by checking MIME type and extension
 */
function validateFileType(file: File, isImage: boolean): { valid: boolean; error?: string } {
  const allowedTypes = isImage ? ALLOWED_IMAGE_TYPES : ALLOWED_DIGITAL_FILE_TYPES;
  const allowedExtensions = isImage ? ALLOWED_IMAGE_EXTENSIONS : ALLOWED_DIGITAL_EXTENSIONS;
  
  // Check MIME type
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `File type "${file.type}" is not allowed. Allowed types: ${allowedTypes.join(', ')}`,
    };
  }
  
  // Check file extension
  const fileExt = '.' + (file.name.split('.').pop()?.toLowerCase() || '');
  if (!allowedExtensions.includes(fileExt)) {
    return {
      valid: false,
      error: `File extension "${fileExt}" is not allowed. Allowed extensions: ${allowedExtensions.join(', ')}`,
    };
  }
  
  return { valid: true };
}

/**
 * Sanitize filename to prevent path traversal and other attacks
 */
function sanitizeFilename(filename: string): string {
  // Remove path components
  const basename = filename.split('/').pop() || filename;
  const name = basename.split('\\').pop() || basename;
  
  // Remove special characters except dots, hyphens, and underscores
  const sanitized = name.replace(/[^a-zA-Z0-9._-]/g, '_');
  
  // Limit length
  const maxLength = 255;
  if (sanitized.length > maxLength) {
    const ext = sanitized.split('.').pop();
    const nameWithoutExt = sanitized.substring(0, maxLength - (ext?.length || 0) - 1);
    return `${nameWithoutExt}.${ext}`;
  }
  
  return sanitized;
}

/**
 * Compress and resize image
 */
async function optimizeImage(buffer: Buffer, fileType: string): Promise<Buffer> {
  try {
    let image = sharp(buffer);
    const metadata = await image.metadata();
    
    // Resize if too large
    if (metadata.width && metadata.height) {
      if (metadata.width > MAX_IMAGE_DIMENSION || metadata.height > MAX_IMAGE_DIMENSION) {
        image = image.resize(MAX_IMAGE_DIMENSION, MAX_IMAGE_DIMENSION, {
          fit: 'inside',
          withoutEnlargement: true,
        });
      }
    }
    
    // Convert to WebP for better compression (fallback to original format)
    if (fileType === 'image/jpeg' || fileType === 'image/jpg') {
      return await image.jpeg({ quality: 85, mozjpeg: true }).toBuffer();
    } else if (fileType === 'image/png') {
      return await image.png({ quality: 85, compressionLevel: 9 }).toBuffer();
    } else if (fileType === 'image/gif') {
      // GIFs are harder to optimize, just resize if needed
      return await image.toBuffer();
    } else if (fileType === 'image/webp') {
      return await image.webp({ quality: 85 }).toBuffer();
    }
    
    // Default: return optimized buffer
    return await image.toBuffer();
  } catch (error) {
    console.error("[UPLOAD] Image optimization error:", error);
    // Return original buffer if optimization fails
    return buffer;
  }
}

export async function POST(request: Request) {
  try {
    // Rate limiting with Redis (falls back to in-memory in development)
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown';
    
    const rateLimitResult = await rateLimit({
      identifier: `upload:${ip}`,
      limit: RATE_LIMIT_MAX,
      window: RATE_LIMIT_WINDOW,
    });
    
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { 
          error: "Too many upload requests. Please try again later.",
          retryAfter: rateLimitResult.retryAfter,
        },
        { 
          status: 429,
          headers: {
            'Retry-After': rateLimitResult.retryAfter?.toString() || '60',
          },
        }
      );
    }
    
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

    // Determine if file is an image
    const isImage = file.type.startsWith("image/");
    
    // Validate file type
    const typeValidation = validateFileType(file, isImage);
    if (!typeValidation.valid) {
      console.error("[UPLOAD] Invalid file type:", typeValidation.error);
      return NextResponse.json(
        { error: typeValidation.error || "Invalid file type" },
        { status: 400 }
      );
    }

    // Validate file size (before compression for images)
    const maxSize = isImage ? MAX_IMAGE_SIZE : MAX_DIGITAL_FILE_SIZE;
    if (file.size > maxSize) {
      console.error("[UPLOAD] File too large:", file.size);
      return NextResponse.json(
        { error: `File size exceeds ${isImage ? "10MB" : "50MB"} limit` },
        { status: 400 }
      );
    }

    // Check for empty files
    if (file.size === 0) {
      return NextResponse.json(
        { error: "File is empty" },
        { status: 400 }
      );
    }

    // Check Supabase environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("[UPLOAD] Missing Supabase environment variables");
      return NextResponse.json(
        { 
          error: "Supabase Storage not configured. Missing environment variables.",
          details: "Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in Vercel.",
        },
        { status: 500 }
      );
    }

    // Determine bucket based on file type
    const bucket = isImage ? "product-images" : "digital-files";
    
    let supabase;
    try {
      supabase = getSupabaseAdmin();
    } catch (error: any) {
      console.error("[UPLOAD] Failed to create Supabase client:", error);
      
      if (error.message?.includes("JWT") || error.message?.includes("key format")) {
        return NextResponse.json(
          { 
            error: "Invalid Supabase API key",
            details: error.message,
            help: "Please check your SUPABASE_SERVICE_ROLE_KEY in Vercel.",
          },
          { status: 500 }
        );
      }
      
      return NextResponse.json(
        { 
          error: "Failed to initialize Supabase client",
          details: error.message,
        },
        { status: 500 }
      );
    }

    // Sanitize and generate unique filename
    const sanitizedOriginalName = sanitizeFilename(file.name);
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 15);
    const fileExt = isImage && file.type !== 'image/gif' 
      ? 'webp' // Use WebP for optimized images (except GIFs)
      : (sanitizedOriginalName.split('.').pop()?.toLowerCase() || 'bin');
    const fileName = `${timestamp}-${randomStr}.${fileExt}`;
    const filePath = fileName;

    console.log("[UPLOAD] Processing file:", {
      bucket,
      filePath,
      originalName: sanitizedOriginalName,
      originalSize: file.size,
    });

    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer();
    let buffer = Buffer.from(arrayBuffer);
    let finalFileType = file.type;
    let finalSize = buffer.length;

    // Optimize images
    if (isImage) {
      try {
        const optimizedBuffer = await optimizeImage(buffer, file.type);
        const compressionRatio = ((1 - optimizedBuffer.length / buffer.length) * 100).toFixed(1);
        console.log(`[UPLOAD] Image optimized: ${compressionRatio}% size reduction`);
        buffer = optimizedBuffer;
        finalSize = buffer.length;
        // Update content type if converted to WebP
        if (fileExt === 'webp' && file.type !== 'image/webp') {
          finalFileType = 'image/webp';
        }
      } catch (error) {
        console.warn("[UPLOAD] Image optimization failed, using original:", error);
        // Continue with original buffer
      }
    }

    console.log("[UPLOAD] Uploading to Supabase Storage:", {
      bucket,
      filePath,
      size: finalSize,
      type: finalFileType,
    });

    // Upload to Supabase Storage with timeout
    const uploadPromise = supabase.storage
      .from(bucket)
      .upload(filePath, buffer, {
        contentType: finalFileType,
        upsert: false,
      });

    // Add timeout (60 seconds)
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Upload timeout")), 60000);
    });

    const { data: uploadData, error: uploadError } = await Promise.race([
      uploadPromise,
      timeoutPromise,
    ]) as any;

    if (uploadError) {
      console.error("[UPLOAD] Supabase upload error:", uploadError);
      
      if (uploadError.message?.includes("Bucket not found")) {
        return NextResponse.json(
          { 
            error: `Storage bucket "${bucket}" not found. Please create it in Supabase Storage.`,
            details: uploadError.message,
          },
          { status: 400 }
        );
      }
      
      if (uploadError.message?.includes("JWT") || uploadError.message?.includes("Invalid API key")) {
        return NextResponse.json(
          { 
            error: "Invalid Supabase API key. Please check your SUPABASE_SERVICE_ROLE_KEY.",
            details: uploadError.message,
          },
          { status: 401 }
        );
      }
      
      return NextResponse.json(
        { 
          error: "Failed to upload file to storage",
          details: uploadError.message || String(uploadError),
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
      filename: sanitizedOriginalName,
      size: finalSize,
      originalSize: file.size,
      type: finalFileType,
      bucket,
      path: filePath,
      optimized: isImage && finalSize < file.size,
      compressionRatio: isImage ? ((1 - finalSize / file.size) * 100).toFixed(1) : 0,
    });
  } catch (error: any) {
    console.error("[UPLOAD] Unexpected error:", error);
    
    // Handle timeout specifically
    if (error.message === "Upload timeout") {
      return NextResponse.json(
        { 
          error: "Upload timed out. Please try again with a smaller file or check your connection.",
        },
        { status: 408 }
      );
    }
    
    return NextResponse.json(
      { 
        error: error.message || "Failed to upload file",
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
