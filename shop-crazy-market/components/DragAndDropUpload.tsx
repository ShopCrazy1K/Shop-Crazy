"use client";

import { useState, useCallback, useRef, DragEvent } from "react";

interface DragAndDropUploadProps {
  onFilesSelected: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  maxFiles?: number;
  maxSize?: number; // in bytes
  isImage?: boolean;
  children?: React.ReactNode;
  className?: string;
}

export default function DragAndDropUpload({
  onFilesSelected,
  accept,
  multiple = true,
  maxFiles,
  maxSize,
  isImage = false,
  children,
  className = "",
}: DragAndDropUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragError, setDragError] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFiles = useCallback((files: File[]): { valid: File[]; errors: string[] } => {
    const valid: File[] = [];
    const errors: string[] = [];

    // Check max files
    if (maxFiles && files.length > maxFiles) {
      errors.push(`Maximum ${maxFiles} file${maxFiles > 1 ? 's' : ''} allowed`);
      return { valid, errors };
    }

    files.forEach((file) => {
      // Check file size
      if (maxSize && file.size > maxSize) {
        errors.push(`${file.name}: File size exceeds ${(maxSize / 1024 / 1024).toFixed(0)}MB`);
        return;
      }

      // Check file type for images
      if (isImage && !file.type.startsWith("image/")) {
        errors.push(`${file.name}: Not an image file`);
        return;
      }

      valid.push(file);
    });

    return { valid, errors };
  }, [maxFiles, maxSize, isImage]);

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    const { valid, errors } = validateFiles(fileArray);

    if (errors.length > 0) {
      setDragError(errors.join(", "));
      setTimeout(() => setDragError(""), 5000);
    }

    if (valid.length > 0) {
      onFilesSelected(valid);
    }
  }, [validateFiles, onFilesSelected]);

  const handleDragEnter = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    setDragError("");
  }, []);

  const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    handleFiles(files);
  }, [handleFiles]);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
    // Reset input so same file can be selected again
    if (e.target) {
      e.target.value = "";
    }
  }, [handleFiles]);

  const handleClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  return (
    <div className={className}>
      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleClick}
        className={`
          relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer
          transition-all duration-200
          ${isDragging 
            ? "border-purple-500 bg-purple-50 scale-105" 
            : "border-gray-300 bg-gray-50 hover:border-purple-400 hover:bg-purple-50"
          }
          ${dragError ? "border-red-400 bg-red-50" : ""}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileInputChange}
          className="hidden"
        />

        {children || (
          <div className="space-y-4">
            <div className="text-4xl">
              {isDragging ? "📥" : "📤"}
            </div>
            <div>
              <p className="text-lg font-semibold text-gray-700">
                {isDragging ? "Drop files here" : "Drag and drop files here"}
              </p>
              <p className="text-sm text-gray-500 mt-2">
                or click to browse
              </p>
            </div>
            {maxSize && (
              <p className="text-xs text-gray-400">
                Max size: {(maxSize / 1024 / 1024).toFixed(0)}MB per file
              </p>
            )}
            {maxFiles && (
              <p className="text-xs text-gray-400">
                Max files: {maxFiles}
              </p>
            )}
          </div>
        )}

        {dragError && (
          <div className="mt-4 p-3 bg-red-100 border border-red-300 rounded-lg">
            <p className="text-sm text-red-700">{dragError}</p>
          </div>
        )}
      </div>
    </div>
  );
}

