"use client";

import { useEffect, useState } from "react";

export default function ChristmasDecorations() {
  const [showDecorations, setShowDecorations] = useState(false);

  useEffect(() => {
    // Check if Christmas theme is active
    const checkTheme = () => {
      const themeElement = document.querySelector('[data-theme="christmas-toon"]');
      setShowDecorations(!!themeElement);
    };
    
    // Check immediately
    checkTheme();
    
    // Also check after a short delay to ensure theme is applied
    const timeout = setTimeout(checkTheme, 100);
    
    // Listen for theme changes
    const observer = new MutationObserver(checkTheme);
    const body = document.body;
    if (body) {
      observer.observe(body, {
        attributes: true,
        attributeFilter: ['data-theme'],
        subtree: true,
      });
    }
    
    return () => {
      clearTimeout(timeout);
      observer.disconnect();
    };
  }, []);

  if (!showDecorations) return null;

  // Create multiple snowflakes - positioned to avoid image areas
  const snowflakes = Array.from({ length: 15 }, (_, i) => {
    // Avoid center area where images typically are
    const left = i % 3 === 0 ? Math.random() * 20 : (i % 3 === 1 ? 40 + Math.random() * 20 : 80 + Math.random() * 20);
    return (
      <div
        key={i}
        className="snowflake"
        style={{
          left: `${left}%`,
          animationDelay: `${Math.random() * 5}s`,
          animationDuration: `${5 + Math.random() * 10}s`,
          fontSize: `${10 + Math.random() * 10}px`,
          pointerEvents: 'none',
          zIndex: 1,
        }}
      >
        ❄️
      </div>
    );
  });

  return (
    <>
      {snowflakes}
      {/* Additional Christmas trees in different positions - lower z-index to stay behind images */}
      <div
        className="fixed bottom-32 left-10 text-4xl opacity-60 pointer-events-none"
        style={{
          animation: "tree-sway 3.5s ease-in-out infinite",
          zIndex: 1,
        }}
      >
        🎄
      </div>
      <div
        className="fixed top-40 right-16 text-3xl opacity-50 pointer-events-none"
        style={{
          animation: "tree-sway 4s ease-in-out infinite",
          zIndex: 1,
        }}
      >
        🎄
      </div>
      {/* Additional snowmen - lower z-index */}
      <div
        className="fixed bottom-40 right-16 text-3xl opacity-60 pointer-events-none"
        style={{
          animation: "snowman-bounce 2.5s ease-in-out infinite",
          zIndex: 1,
        }}
      >
        ⛄
      </div>
      <div
        className="fixed top-60 left-20 text-2xl opacity-50 pointer-events-none"
        style={{
          animation: "snowman-bounce 3s ease-in-out infinite",
          zIndex: 1,
        }}
      >
        ⛄
      </div>
    </>
  );
}

