import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * POST /api/upload/chunk
 * Upload a single chunk
 */
export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const chunk = formData.get("chunk") as File;
    const uploadId = formData.get("uploadId") as string;
    const chunkIndex = parseInt(formData.get("chunkIndex") as string);
    const totalChunks = parseInt(formData.get("totalChunks") as string);

    if (!chunk || !uploadId || chunkIndex === undefined || totalChunks === undefined) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();
    const bucket = "digital-files"; // Use digital-files bucket for chunked uploads

    // Store chunk with uploadId and chunkIndex in path
    const chunkPath = `chunks/${uploadId}/${chunkIndex}`;

    const arrayBuffer = await chunk.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(chunkPath, buffer, {
        contentType: chunk.type,
        upsert: true, // Allow overwriting if retrying
      });

    if (uploadError) {
      console.error("[CHUNK UPLOAD] Error uploading chunk:", uploadError);
      return NextResponse.json(
        { error: uploadError.message || "Failed to upload chunk" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      chunkIndex,
      totalChunks,
    });
  } catch (error: any) {
    console.error("[CHUNK UPLOAD] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to upload chunk" },
      { status: 500 }
    );
  }
}

