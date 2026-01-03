"use client";

import { useState, useCallback } from "react";
import { uploadFilesParallel, createImagePreview, validateFile, type UploadProgress } from "@/lib/upload-utils";

interface UploadWithProgressProps {
  files: File[];
  isImage: boolean;
  onUploadComplete: (urls: string[]) => void;
  onUploadError?: (errors: string[]) => void;
  onRemoveFile?: (file: File) => void;
  maxConcurrent?: number;
}

export default function UploadWithProgress({
  files,
  isImage,
  onUploadComplete,
  onUploadError,
  onRemoveFile,
  maxConcurrent = 3,
}: UploadWithProgressProps) {
  const [uploadProgress, setUploadProgress] = useState<Map<File, UploadProgress>>(new Map());
  const [previews, setPreviews] = useState<Map<File, string>>(new Map());
  const [uploading, setUploading] = useState(false);

  // Create previews for images
  useState(() => {
    if (isImage) {
      files.forEach(async (file) => {
        if (!previews.has(file)) {
          try {
            const preview = await createImagePreview(file);
            setPreviews(prev => new Map(prev).set(file, preview));
          } catch (error) {
            console.error("Failed to create preview:", error);
          }
        }
      });
    }
  });

  const handleUpload = useCallback(async () => {
    if (files.length === 0) return;

    // Validate all files first
    const validationErrors: string[] = [];
    const validFiles: File[] = [];

    files.forEach(file => {
      const validation = validateFile(file, isImage);
      if (!validation.valid) {
        validationErrors.push(`${file.name}: ${validation.error}`);
      } else {
        validFiles.push(file);
      }
    });

    if (validationErrors.length > 0) {
      onUploadError?.(validationErrors);
      return;
    }

    setUploading(true);
    
    // Initialize progress tracking
    const progressMap = new Map<File, UploadProgress>();
    validFiles.forEach(file => {
      progressMap.set(file, {
        file,
        progress: 0,
        status: 'pending',
        retryCount: 0,
      });
    });
    setUploadProgress(progressMap);

    const urls: string[] = [];
    const errors: string[] = [];

    try {
      const results = await uploadFilesParallel(
        validFiles,
        {
          onProgress: (file, progress) => {
            setUploadProgress(prev => {
              const updated = new Map(prev);
              const current = updated.get(file);
              if (current) {
                updated.set(file, {
                  ...current,
                  progress,
                  status: 'uploading',
                });
              }
              return updated;
            });
          },
          onComplete: (file, url) => {
            setUploadProgress(prev => {
              const updated = new Map(prev);
              const current = updated.get(file);
              if (current) {
                updated.set(file, {
                  ...current,
                  progress: 100,
                  status: 'success',
                  url,
                });
              }
              return updated;
            });
            urls.push(url);
          },
          onError: (file, error) => {
            setUploadProgress(prev => {
              const updated = new Map(prev);
              const current = updated.get(file);
              if (current) {
                updated.set(file, {
                  ...current,
                  status: 'error',
                  error,
                });
              }
              return updated;
            });
            errors.push(`${file.name}: ${error}`);
          },
        },
        maxConcurrent
      );

      // Process results
      results.forEach((result, file) => {
        if (result.url) {
          urls.push(result.url);
        } else if (result.error) {
          errors.push(`${file.name}: ${result.error}`);
        }
      });

      if (urls.length > 0) {
        onUploadComplete(urls);
      }

      if (errors.length > 0) {
        onUploadError?.(errors);
      }
    } catch (error: any) {
      onUploadError?.([error.message || "Upload failed"]);
    } finally {
      setUploading(false);
    }
  }, [files, isImage, onUploadComplete, onUploadError, maxConcurrent]);

  const handleRetry = useCallback(async (file: File) => {
    // Reset progress for this file
    setUploadProgress(prev => {
      const updated = new Map(prev);
      updated.set(file, {
        file,
        progress: 0,
        status: 'pending',
        retryCount: 0,
      });
      return updated;
    });

    // Retry upload for this single file
    await handleUpload();
  }, [handleUpload]);

  if (files.length === 0) return null;

  return (
    <div className="space-y-3">
      {files.map((file) => {
        const progress = uploadProgress.get(file);
        const preview = previews.get(file);
        const isSuccess = progress?.status === 'success';
        const isError = progress?.status === 'error';
        const isUploading = progress?.status === 'uploading' || progress?.status === 'pending';

        return (
          <div
            key={`${file.name}-${file.size}`}
            className="border-2 border-gray-200 rounded-lg p-4 bg-white"
          >
            <div className="flex items-start gap-4">
              {/* Preview (for images) */}
              {isImage && preview && (
                <div className="flex-shrink-0">
                  <img
                    src={preview}
                    alt={file.name}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                </div>
              )}

              {/* File Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold truncate">{file.name}</p>
                  <span className="text-xs text-gray-500 ml-2">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </span>
                </div>

                {/* Progress Bar */}
                {isUploading && (
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                    <div
                      className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress?.progress || 0}%` }}
                    />
                  </div>
                )}

                {/* Status */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {isSuccess && (
                      <span className="text-green-600 text-sm">✅ Uploaded</span>
                    )}
                    {isError && (
                      <span className="text-red-600 text-sm">
                        ❌ {progress?.error || "Upload failed"}
                      </span>
                    )}
                    {isUploading && (
                      <span className="text-purple-600 text-sm">
                        {progress?.progress ? `${Math.round(progress.progress)}%` : "Uploading..."}
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {isError && (
                      <button
                        onClick={() => handleRetry(file)}
                        className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded hover:bg-purple-200"
                      >
                        Retry
                      </button>
                    )}
                    {onRemoveFile && (
                      <button
                        onClick={() => onRemoveFile(file)}
                        className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* Upload Button */}
      {!uploading && files.length > 0 && (
        <button
          onClick={handleUpload}
          className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors"
        >
          Upload {files.length} file{files.length > 1 ? 's' : ''}
        </button>
      )}
    </div>
  );
}

