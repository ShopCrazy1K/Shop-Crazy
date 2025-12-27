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
          zIndex: 0,
        }}
      >
        ❄️
      </div>
    );
  });

  return (
    <>
      {snowflakes}
    </>
  );
}

