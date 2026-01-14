"use client";

import * as React from "react";

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";

import {
  arrayMove,
  SortableContext,
  useSortable,
  rectSortingStrategy,
} from "@dnd-kit/sortable";

import { CSS } from "@dnd-kit/utilities";

type ImageItem = {
  id: string;      // unique id for DnD
  url: string;     // public url (or render url)
  path?: string;   // optional storage path you store in DB
};

function SortableImageCard({
  item,
  onRemove,
  isFirst = false,
}: {
  item: ImageItem;
  onRemove: (id: string) => void;
  isFirst?: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: item.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.7 : 1,
    cursor: "grab",
    userSelect: "none",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative rounded-xl border bg-white overflow-hidden"
      {...attributes}
      {...listeners}
      title="Drag to reorder"
    >
      <img
        src={item.url}
        alt="Product image"
        className="h-40 w-full object-cover"
        draggable={false}
      />

      {/* Main/Cover badge for first image */}
      {isFirst && (
        <div className="absolute left-2 top-2 rounded-full bg-purple-600 px-2 py-1 text-xs font-semibold text-white shadow-lg">
          Main
        </div>
      )}

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onRemove(item.id);
        }}
        className="absolute right-2 top-2 rounded-full bg-white/90 hover:bg-white px-2 py-1 text-xs border shadow-sm"
      >
        Remove
      </button>
    </div>
  );
}

export default function ImageReorderGrid({
  items,
  onChange,
  maxImages = 10,
}: {
  items: ImageItem[];
  onChange: (next: ImageItem[]) => void;
  maxImages?: number;
}) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = items.findIndex((i) => i.id === active.id);
    const newIndex = items.findIndex((i) => i.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;

    onChange(arrayMove(items, oldIndex, newIndex));
  }

  function remove(id: string) {
    onChange(items.filter((i) => i.id !== id));
  }

  return (
    <div className="space-y-2">
      <div className="text-sm text-gray-600">
        Drag images to reorder. First image becomes the cover.
        <span className="ml-2 text-gray-400">({items.length}/{maxImages})</span>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={items.map((i) => i.id)} strategy={rectSortingStrategy}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {items.map((item, index) => (
              <SortableImageCard key={item.id} item={item} onRemove={remove} isFirst={index === 0} />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}

