/**
 * Chunked upload utilities for large files (>50MB)
 */

const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB chunks
const LARGE_FILE_THRESHOLD = 50 * 1024 * 1024; // 50MB

export interface ChunkUploadProgress {
  file: File;
  chunkIndex: number;
  totalChunks: number;
  progress: number;
  uploadedChunks: number;
}

export interface ChunkUploadOptions {
  onProgress?: (progress: ChunkUploadProgress) => void;
  onComplete?: (file: File, url: string) => void;
  onError?: (file: File, error: string) => void;
  chunkSize?: number;
}

/**
 * Upload a large file in chunks
 */
export async function uploadFileInChunks(
  file: File,
  options: ChunkUploadOptions = {}
): Promise<string> {
  const chunkSize = options.chunkSize || CHUNK_SIZE;
  const totalChunks = Math.ceil(file.size / chunkSize);

  // Check if file is large enough to warrant chunked upload
  if (file.size < LARGE_FILE_THRESHOLD) {
    // Use regular upload for smaller files
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Upload failed");
    }

    const data = await response.json();
    return data.url;
  }

  // Initialize chunked upload session
  const sessionResponse = await fetch("/api/upload/chunk/init", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      totalChunks,
      chunkSize,
    }),
  });

  if (!sessionResponse.ok) {
    const errorData = await sessionResponse.json();
    throw new Error(errorData.error || "Failed to initialize chunked upload");
  }

  const { uploadId } = await sessionResponse.json();

  // Upload chunks
  const uploadedChunks: number[] = [];

  for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
    const start = chunkIndex * chunkSize;
    const end = Math.min(start + chunkSize, file.size);
    const chunk = file.slice(start, end);

    const chunkFormData = new FormData();
    chunkFormData.append("chunk", chunk);
    chunkFormData.append("uploadId", uploadId);
    chunkFormData.append("chunkIndex", chunkIndex.toString());
    chunkFormData.append("totalChunks", totalChunks.toString());

    let retries = 3;
    let success = false;

    while (retries > 0 && !success) {
      try {
        const chunkResponse = await fetch("/api/upload/chunk", {
          method: "POST",
          body: chunkFormData,
        });

        if (!chunkResponse.ok) {
          const errorData = await chunkResponse.json();
          throw new Error(errorData.error || `Failed to upload chunk ${chunkIndex + 1}`);
        }

        uploadedChunks.push(chunkIndex);
        success = true;

        // Report progress
        options.onProgress?.({
          file,
          chunkIndex,
          totalChunks,
          progress: ((uploadedChunks.length / totalChunks) * 100),
          uploadedChunks: uploadedChunks.length,
        });
      } catch (error: any) {
        retries--;
        if (retries === 0) {
          options.onError?.(file, error.message || `Failed to upload chunk ${chunkIndex + 1}`);
          throw error;
        }
        // Wait before retry (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, 1000 * (3 - retries)));
      }
    }
  }

  // Finalize upload
  const finalizeResponse = await fetch("/api/upload/chunk/finalize", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ uploadId }),
  });

  if (!finalizeResponse.ok) {
    const errorData = await finalizeResponse.json();
    throw new Error(errorData.error || "Failed to finalize upload");
  }

  const { url } = await finalizeResponse.json();
  options.onComplete?.(file, url);
  return url;
}

/**
 * Check if file should use chunked upload
 */
export function shouldUseChunkedUpload(file: File): boolean {
  return file.size >= LARGE_FILE_THRESHOLD;
}

