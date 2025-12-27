"use client";

import { useEffect, useState } from "react";

export default function WinterDecorations() {
  const [showDecorations, setShowDecorations] = useState(false);

  useEffect(() => {
    // Check if Winter theme is active
    const checkTheme = () => {
      const themeElement = document.querySelector('[data-theme="winter-snow"]');
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

  // Create multiple snowflakes - more than Christmas for winter feel
  const snowflakes = Array.from({ length: 30 }, (_, i) => {
    // Distribute across the screen
    const left = Math.random() * 100;
    return (
      <div
        key={i}
        className="winter-snowflake"
        style={{
          left: `${left}%`,
          animationDelay: `${Math.random() * 5}s`,
          animationDuration: `${5 + Math.random() * 10}s`,
          fontSize: `${12 + Math.random() * 15}px`,
          pointerEvents: 'none',
          zIndex: 1,
        }}
      >
        ❄️
      </div>
    );
  });

  // Create additional smaller snow particles
  const snowParticles = Array.from({ length: 20 }, (_, i) => {
    const left = Math.random() * 100;
    return (
      <div
        key={`particle-${i}`}
        className="winter-snow-particle"
        style={{
          left: `${left}%`,
          animationDelay: `${Math.random() * 3}s`,
          animationDuration: `${3 + Math.random() * 5}s`,
          fontSize: `${8 + Math.random() * 6}px`,
          pointerEvents: 'none',
          zIndex: 1,
        }}
      >
        •
      </div>
    );
  });

  return (
    <>
      {snowflakes}
      {snowParticles}
      {/* Snow-covered trees */}
      <div
        className="fixed bottom-32 left-10 text-4xl opacity-70 pointer-events-none"
        style={{
          animation: "winter-tree-sway 4s ease-in-out infinite",
          zIndex: 1,
          filter: "drop-shadow(0 2px 4px rgba(255, 255, 255, 0.5))",
        }}
      >
        🌲
      </div>
      <div
        className="fixed top-40 right-16 text-3xl opacity-60 pointer-events-none"
        style={{
          animation: "winter-tree-sway 4.5s ease-in-out infinite",
          zIndex: 1,
          filter: "drop-shadow(0 2px 4px rgba(255, 255, 255, 0.5))",
        }}
      >
        🌲
      </div>
      {/* Snowmen */}
      <div
        className="fixed bottom-40 right-16 text-3xl opacity-70 pointer-events-none"
        style={{
          animation: "winter-snowman-bounce 3s ease-in-out infinite",
          zIndex: 1,
        }}
      >
        ⛄
      </div>
      <div
        className="fixed top-60 left-20 text-2xl opacity-60 pointer-events-none"
        style={{
          animation: "winter-snowman-bounce 3.5s ease-in-out infinite",
          zIndex: 1,
        }}
      >
        ⛄
      </div>
      {/* Icicles */}
      <div
        className="fixed top-20 left-1/4 text-2xl opacity-50 pointer-events-none"
        style={{
          animation: "winter-icicle-drip 2s ease-in-out infinite",
          zIndex: 1,
        }}
      >
        🧊
      </div>
      <div
        className="fixed top-32 right-1/4 text-xl opacity-40 pointer-events-none"
        style={{
          animation: "winter-icicle-drip 2.5s ease-in-out infinite",
          zIndex: 1,
        }}
      >
        🧊
      </div>
    </>
  );
}

