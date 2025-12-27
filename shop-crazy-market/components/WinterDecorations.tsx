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
    </>
  );
}

