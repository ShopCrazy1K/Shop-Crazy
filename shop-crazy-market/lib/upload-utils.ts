/**
 * Enhanced upload utilities with progress tracking, retry logic, and parallel uploads
 */

export interface UploadProgress {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error' | 'cancelled';
  url?: string;
  error?: string;
  retryCount: number;
}

export interface UploadOptions {
  maxRetries?: number;
  retryDelay?: number;
  onProgress?: (file: File, progress: number) => void;
  onComplete?: (file: File, url: string) => void;
  onError?: (file: File, error: string) => void;
}

const DEFAULT_OPTIONS: Required<UploadOptions> = {
  maxRetries: 3,
  retryDelay: 1000,
  onProgress: () => {},
  onComplete: () => {},
  onError: () => {},
};

/**
 * Upload a single file with progress tracking and retry logic
 * Automatically uses chunked upload for large files (>50MB)
 */
export async function uploadFileWithProgress(
  file: File,
  options: UploadOptions = {}
): Promise<string> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  // Use chunked upload for large files
  if (shouldUseChunkedUpload(file)) {
    try {
      const { uploadFileInChunks } = await import("@/lib/chunked-upload");
      return await uploadFileInChunks(file, {
        onProgress: (progress) => {
          opts.onProgress(file, progress.progress);
        },
        onComplete: (file, url) => {
          opts.onComplete(file, url);
        },
        onError: (file, error) => {
          opts.onError(file, error);
        },
      });
    } catch (error: any) {
      opts.onError(file, error.message || "Chunked upload failed");
      throw error;
    }
  }

  // Regular upload for smaller files
  let retryCount = 0;

  while (retryCount <= opts.maxRetries) {
    try {
      const formData = new FormData();
      formData.append("file", file);

      // Create XMLHttpRequest for progress tracking
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        // Track upload progress
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const progress = (e.loaded / e.total) * 100;
            opts.onProgress(file, progress);
          }
        });

        // Handle completion
        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const data = JSON.parse(xhr.responseText);
              if (data.url) {
                opts.onComplete(file, data.url);
                resolve(data.url);
              } else {
                throw new Error("Upload succeeded but no URL returned");
              }
            } catch (error: any) {
              reject(new Error(error.message || "Failed to parse upload response"));
            }
          } else {
            try {
              const errorData = JSON.parse(xhr.responseText);
              reject(new Error(errorData.error || `Upload failed with status ${xhr.status}`));
            } catch {
              reject(new Error(`Upload failed with status ${xhr.status}`));
            }
          }
        });

        // Handle errors
        xhr.addEventListener('error', () => {
          reject(new Error("Network error during upload"));
        });

        // Handle timeout
        xhr.addEventListener('timeout', () => {
          reject(new Error("Upload timeout"));
        });

        // Set timeout (60 seconds)
        xhr.timeout = 60000;

        // Start upload
        xhr.open('POST', '/api/upload');
        xhr.send(formData);
      });
    } catch (error: any) {
      retryCount++;
      
      if (retryCount > opts.maxRetries) {
        opts.onError(file, error.message || "Upload failed after retries");
        throw error;
      }

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, opts.retryDelay * retryCount));
      console.log(`[UPLOAD] Retrying upload (attempt ${retryCount + 1}/${opts.maxRetries + 1}):`, file.name);
    }
  }

  throw new Error("Upload failed after all retries");
}

/**
 * Upload multiple files in parallel with progress tracking
 */
export async function uploadFilesParallel(
  files: File[],
  options: UploadOptions = {},
  maxConcurrent: number = 3
): Promise<Map<File, { url?: string; error?: string }>> {
  const results = new Map<File, { url?: string; error?: string }>();
  const queue = [...files];
  const inProgress = new Set<Promise<void>>();

  const processNext = async (): Promise<void> => {
    if (queue.length === 0) return;

    const file = queue.shift()!;
    const promise = uploadFileWithProgress(file, options)
      .then(url => {
        results.set(file, { url });
      })
      .catch(error => {
        results.set(file, { error: error.message });
      })
      .finally(() => {
        inProgress.delete(promise);
        // Process next file
        if (queue.length > 0) {
          const nextPromise = processNext();
          inProgress.add(nextPromise);
        }
      });

    inProgress.add(promise);
  };

  // Start initial batch
  const initialBatch = Math.min(maxConcurrent, files.length);
  for (let i = 0; i < initialBatch; i++) {
    const promise = processNext();
    inProgress.add(promise);
  }

  // Wait for all uploads to complete
  await Promise.all(Array.from(inProgress));

  return results;
}

/**
 * Create image preview URL from file
 */
export function createImagePreview(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        resolve(e.target.result as string);
      } else {
        reject(new Error("Failed to create preview"));
      }
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

/**
 * Validate file before upload
 */
export function validateFile(file: File, isImage: boolean): { valid: boolean; error?: string } {
  // Check file size (allow larger files for chunked upload)
  const maxSize = isImage ? 10 * 1024 * 1024 : 200 * 1024 * 1024; // 10MB for images, 200MB for files (chunked)
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File size exceeds ${isImage ? "10MB" : "200MB"} limit`,
    };
  }

  // Check if empty
  if (file.size === 0) {
    return {
      valid: false,
      error: "File is empty",
    };
  }

  // Check file type
  if (isImage) {
    const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedImageTypes.includes(file.type)) {
      return {
        valid: false,
        error: `Image type "${file.type}" is not allowed`,
      };
    }
  }

  return { valid: true };
}

/**
 * Check if file should use chunked upload
 * Files larger than 50MB should use chunked upload
 */
export function shouldUseChunkedUpload(file: File): boolean {
  const CHUNKED_UPLOAD_THRESHOLD = 50 * 1024 * 1024; // 50MB
  return file.size > CHUNKED_UPLOAD_THRESHOLD;
}

