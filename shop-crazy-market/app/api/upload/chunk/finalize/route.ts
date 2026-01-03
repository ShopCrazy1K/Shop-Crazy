import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * POST /api/upload/chunk/finalize
 * Combine chunks and finalize upload
 */
export async function POST(req: Request) {
  try {
    const { uploadId } = await req.json();

    if (!uploadId) {
      return NextResponse.json(
        { error: "Missing uploadId" },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();
    const bucket = "digital-files";

    // List all chunks for this upload
    const { data: chunks, error: listError } = await supabase.storage
      .from(bucket)
      .list(`chunks/${uploadId}`, {
        sortBy: { column: "name", order: "asc" },
      });

    if (listError || !chunks || chunks.length === 0) {
      return NextResponse.json(
        { error: "No chunks found for this upload" },
        { status: 400 }
      );
    }

    // Download and combine chunks
    const chunkBuffers: Buffer[] = [];
    for (const chunk of chunks.sort((a, b) => parseInt(a.name) - parseInt(b.name))) {
      const chunkPath = `chunks/${uploadId}/${chunk.name}`;
      const { data: chunkData, error: downloadError } = await supabase.storage
        .from(bucket)
        .download(chunkPath);

      if (downloadError || !chunkData) {
        return NextResponse.json(
          { error: `Failed to download chunk ${chunk.name}` },
          { status: 500 }
        );
      }

      const arrayBuffer = await chunkData.arrayBuffer();
      chunkBuffers.push(Buffer.from(arrayBuffer));
    }

    // Combine chunks
    const combinedBuffer = Buffer.concat(chunkBuffers);

    // Generate final filename
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 15);
    const fileName = `${timestamp}-${randomStr}.bin`; // You might want to preserve original extension
    const filePath = fileName;

    // Upload combined file
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, combinedBuffer, {
        contentType: "application/octet-stream",
        upsert: false,
      });

    if (uploadError) {
      return NextResponse.json(
        { error: uploadError.message || "Failed to finalize upload" },
        { status: 500 }
      );
    }

    // Clean up chunks
    const chunkPaths = chunks.map(chunk => `chunks/${uploadId}/${chunk.name}`);
    await supabase.storage
      .from(bucket)
      .remove(chunkPaths);

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return NextResponse.json({
      success: true,
      url: urlData.publicUrl,
      path: filePath,
    });
  } catch (error: any) {
    console.error("[CHUNK UPLOAD] Finalize error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to finalize upload" },
      { status: 500 }
    );
  }
}

