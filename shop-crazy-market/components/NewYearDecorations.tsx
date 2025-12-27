"use client";

import { useEffect, useState } from "react";

export default function NewYearDecorations() {
  const [showDecorations, setShowDecorations] = useState(false);

  useEffect(() => {
    // Check if New Year theme is active
    const checkTheme = () => {
      const themeElement = document.querySelector('[data-theme="new-year"]');
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

  // Create confetti/party emojis
  const confetti = Array.from({ length: 20 }, (_, i) => {
    const emojis = ['🎊', '🎉', '✨', '⭐', '💫', '🌟'];
    const left = Math.random() * 100;
    return (
      <div
        key={i}
        className="new-year-confetti"
        style={{
          left: `${left}%`,
          animationDelay: `${Math.random() * 3}s`,
          animationDuration: `${3 + Math.random() * 4}s`,
          fontSize: `${15 + Math.random() * 15}px`,
          pointerEvents: 'none',
          zIndex: 1,
        }}
      >
        {emojis[Math.floor(Math.random() * emojis.length)]}
      </div>
    );
  });

  // Create sparkles
  const sparkles = Array.from({ length: 12 }, (_, i) => {
    const left = Math.random() * 100;
    return (
      <div
        key={`sparkle-${i}`}
        className="new-year-sparkle"
        style={{
          left: `${left}%`,
          top: `${Math.random() * 100}%`,
          animationDelay: `${Math.random() * 2}s`,
          animationDuration: `${1.5 + Math.random() * 1.5}s`,
          pointerEvents: 'none',
          zIndex: 1,
        }}
      >
        ✨
      </div>
    );
  });

  return (
    <>
      {confetti}
      {sparkles}
      {/* Party poppers */}
      <div
        className="fixed top-20 left-10 text-5xl opacity-70 pointer-events-none"
        style={{
          animation: "party-pop 2s ease-in-out infinite",
          zIndex: 1,
        }}
      >
        🎊
      </div>
      <div
        className="fixed top-32 right-16 text-4xl opacity-60 pointer-events-none"
        style={{
          animation: "party-pop 2.5s ease-in-out infinite",
          zIndex: 1,
        }}
      >
        🎉
      </div>
      {/* Fireworks */}
      <div
        className="fixed bottom-32 left-20 text-4xl opacity-80 pointer-events-none"
        style={{
          animation: "firework-burst 3s ease-in-out infinite",
          zIndex: 1,
        }}
      >
        🎆
      </div>
      <div
        className="fixed bottom-40 right-20 text-3xl opacity-70 pointer-events-none"
        style={{
          animation: "firework-burst 3.5s ease-in-out infinite",
          zIndex: 1,
        }}
      >
        🎇
      </div>
      {/* Clock/Countdown */}
      <div
        className="fixed top-60 left-1/2 transform -translate-x-1/2 text-3xl opacity-60 pointer-events-none"
        style={{
          animation: "pulse-glow 2s ease-in-out infinite",
          zIndex: 1,
        }}
      >
        🕐
      </div>
    </>
  );
}

