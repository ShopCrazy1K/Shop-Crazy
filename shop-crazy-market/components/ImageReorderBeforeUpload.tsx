"use client";

import { useState, useEffect } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { createImagePreview } from "@/lib/upload-utils";

interface ImageFile {
  id: string;
  file: File;
  preview?: string;
}

interface ImageReorderBeforeUploadProps {
  files: File[];
  onReorder: (files: File[]) => void;
  onRemove: (index: number) => void;
}

function SortableImageItem({ image, index, onRemove }: { image: ImageFile; index: number; onRemove: (index: number) => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: image.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative border-2 rounded-lg p-3 bg-white ${
        isDragging ? "border-purple-500 shadow-lg" : "border-gray-200"
      }`}
    >
      <div className="flex items-center gap-4">
        {/* Drag Handle */}
        <div
          {...attributes}
          {...listeners}
          className="cursor-move text-gray-400 hover:text-gray-600 text-xl"
        >
          ⋮⋮
        </div>

        {/* Image Preview */}
        {image.preview ? (
          <img
            src={image.preview}
            alt={image.file.name}
            className="w-20 h-20 object-cover rounded-lg"
          />
        ) : (
          <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
            📷
          </div>
        )}

        {/* File Info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate">{image.file.name}</p>
          <p className="text-xs text-gray-500">
            {(image.file.size / 1024 / 1024).toFixed(2)} MB
          </p>
        </div>

        {/* Position Badge */}
        <div className="flex-shrink-0">
          <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">
            #{index + 1}
          </span>
        </div>

        {/* Remove Button */}
        <button
          onClick={() => onRemove(index)}
          className="flex-shrink-0 text-red-600 hover:text-red-800 text-lg"
          type="button"
        >
          ×
        </button>
      </div>
    </div>
  );
}

export default function ImageReorderBeforeUpload({
  files,
  onReorder,
  onRemove,
}: ImageReorderBeforeUploadProps) {
  const [imageFiles, setImageFiles] = useState<ImageFile[]>([]);
  const [previewsLoaded, setPreviewsLoaded] = useState(false);

  // Load previews when files change
  useState(() => {
    if (files.length === 0) {
      setImageFiles([]);
      setPreviewsLoaded(false);
      return;
    }

    const loadPreviews = async () => {
      const imageItems: ImageFile[] = await Promise.all(
        files.map(async (file, index) => {
          let preview: string | undefined;
          try {
            preview = await createImagePreview(file);
          } catch (error) {
            console.error("Failed to create preview:", error);
          }
          return {
            id: `image-${index}-${file.name}-${file.size}`,
            file,
            preview,
          };
        })
      );
      setImageFiles(imageItems);
      setPreviewsLoaded(true);
    };

    loadPreviews();
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = imageFiles.findIndex((item) => item.id === active.id);
      const newIndex = imageFiles.findIndex((item) => item.id === over.id);

      const newImageFiles = arrayMove(imageFiles, oldIndex, newIndex);
      setImageFiles(newImageFiles);

      // Update parent with reordered files
      const reorderedFiles = newImageFiles.map((item) => item.file);
      onReorder(reorderedFiles);
    }
  };

  if (files.length === 0) return null;

  return (
    <div className="space-y-3">
      <p className="text-sm font-semibold text-gray-700">
        Drag to reorder images (first image will be the main image):
      </p>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={imageFiles.map((item) => item.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2">
            {imageFiles.map((image, index) => (
              <SortableImageItem
                key={image.id}
                image={image}
                index={index}
                onRemove={onRemove}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}

