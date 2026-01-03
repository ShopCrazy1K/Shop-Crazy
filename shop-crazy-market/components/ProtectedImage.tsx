"use client";

import { useEffect, useRef } from "react";

interface ProtectedImageProps {
  src: string;
  alt: string;
  className?: string;
  onError?: (e: React.SyntheticEvent<HTMLImageElement, Event>) => void;
  onClick?: () => void;
  style?: React.CSSProperties;
}

/**
 * ProtectedImage component that prevents right-click downloads and other common download methods
 * Note: Complete protection is impossible, but this makes it much harder for casual users
 */
export default function ProtectedImage({
  src,
  alt,
  className = "",
  onError,
  onClick,
  style,
}: ProtectedImageProps) {
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const img = imgRef.current;
    const container = containerRef.current;
    if (!img || !container) return;

    // Prevent right-click context menu
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    // Prevent drag and drop
    const handleDragStart = (e: DragEvent) => {
      e.preventDefault();
      return false;
    };

    // Prevent image selection
    const handleSelectStart = (e: Event) => {
      e.preventDefault();
      return false;
    };

    // Prevent common keyboard shortcuts (Ctrl+S, Ctrl+A, etc.)
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent Ctrl+S (Save), Ctrl+A (Select All), Ctrl+C (Copy) when focused on image
      if (
        (e.ctrlKey || e.metaKey) &&
        (e.key === "s" || e.key === "S" || e.key === "a" || e.key === "A" || e.key === "c" || e.key === "C")
      ) {
        e.preventDefault();
        return false;
      }
    };

    // Add event listeners
    img.addEventListener("contextmenu", handleContextMenu);
    img.addEventListener("dragstart", handleDragStart);
    img.addEventListener("selectstart", handleSelectStart);
    container.addEventListener("contextmenu", handleContextMenu);
    container.addEventListener("dragstart", handleDragStart);
    container.addEventListener("selectstart", handleSelectStart);
    document.addEventListener("keydown", handleKeyDown);

    // CSS to prevent selection
    img.style.userSelect = "none";
    img.style.webkitUserSelect = "none";
    (img.style as any).MozUserSelect = "none";
    (img.style as any).msUserSelect = "none";
    (img.style as any).webkitUserDrag = "none";
    (img.style as any).khtmlUserDrag = "none";
    (img.style as any).userDrag = "none";
    img.style.pointerEvents = "auto";

    // Add watermark overlay effect (subtle)
    const watermark = document.createElement("div");
    watermark.style.position = "absolute";
    watermark.style.top = "0";
    watermark.style.left = "0";
    watermark.style.width = "100%";
    watermark.style.height = "100%";
    watermark.style.pointerEvents = "none";
    watermark.style.background = "transparent";
    watermark.style.zIndex = "1";
    container.style.position = "relative";

    return () => {
      img.removeEventListener("contextmenu", handleContextMenu);
      img.removeEventListener("dragstart", handleDragStart);
      img.removeEventListener("selectstart", handleSelectStart);
      container.removeEventListener("contextmenu", handleContextMenu);
      container.removeEventListener("dragstart", handleDragStart);
      container.removeEventListener("selectstart", handleSelectStart);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full h-full"
      style={{ position: "relative", display: "block" }}
      onClick={onClick}
    >
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        className={`select-none ${className}`}
        style={{
          userSelect: "none",
          WebkitUserSelect: "none",
          MozUserSelect: "none" as any,
          msUserSelect: "none" as any,
          WebkitUserDrag: "none" as any,
          KhtmlUserDrag: "none" as any,
          userDrag: "none" as any,
          pointerEvents: "auto",
          width: "100%",
          height: "100%",
          display: "block",
          ...style,
        } as React.CSSProperties}
        onError={onError}
        draggable={false}
        onContextMenu={(e) => e.preventDefault()}
        onDragStart={(e) => e.preventDefault()}
      />
    </div>
  );
}

