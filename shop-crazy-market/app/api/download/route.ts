import { NextRequest, NextResponse } from "next/server";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/download?url=FILE_URL
 * Proxy download endpoint that forces file download with proper headers
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const fileUrl = searchParams.get("url");

    if (!fileUrl) {
      return NextResponse.json(
        { error: "File URL is required" },
        { status: 400 }
      );
    }

    // Fetch the file
    const response = await fetch(fileUrl);
    
    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch file" },
        { status: 404 }
      );
    }

    // Get file content
    const fileBuffer = await response.arrayBuffer();
    
    // Extract filename from URL
    const urlPath = new URL(fileUrl).pathname;
    const fileName = urlPath.split('/').pop() || 'download';
    
    // Get content type from response or infer from extension
    const contentType = response.headers.get('content-type') || 'application/octet-stream';

    // Return file with download headers
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${encodeURIComponent(fileName)}"`,
        'Content-Length': fileBuffer.byteLength.toString(),
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error: any) {
    console.error("Download error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to download file" },
      { status: 500 }
    );
  }
}

