import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * POST /api/upload/chunk/init
 * Initialize a chunked upload session
 */
export async function POST(req: Request) {
  try {
    const { fileName, fileSize, fileType, totalChunks, chunkSize } = await req.json();

    if (!fileName || !fileSize || !totalChunks) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Generate unique upload ID
    const uploadId = crypto.randomBytes(16).toString("hex");

    // Store upload session (you might want to use Redis for this in production)
    // For now, we'll use a simple in-memory store or database
    // In production, use Redis with expiration
    
    // Create upload session record
    // Note: You might want to add a ChunkUploadSession model to your Prisma schema
    // For now, we'll return the uploadId and store it client-side
    
    return NextResponse.json({
      uploadId,
      chunkSize,
      totalChunks,
    });
  } catch (error: any) {
    console.error("[CHUNK UPLOAD] Init error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to initialize chunked upload" },
      { status: 500 }
    );
  }
}

