"use client";

import { useEffect, useState } from "react";

export default function NewYearDecorations() {
  const [showDecorations, setShowDecorations] = useState(false);
  const [isNewYearsDay, setIsNewYearsDay] = useState(false);

  useEffect(() => {
    // Check if it's January 1st
    const checkNewYearsDay = () => {
      const now = new Date();
      const month = now.getMonth(); // 0-11, where 0 is January
      const date = now.getDate(); // 1-31
      const isJan1 = month === 0 && date === 1;
      setIsNewYearsDay(isJan1);
    };

    checkNewYearsDay();
    
    // Check every minute to handle day changes
    const interval = setInterval(checkNewYearsDay, 60000);

    // Check if New Year theme is active
    const checkTheme = () => {
      const themeElement = document.querySelector('[data-theme="new-year"]');
      setShowDecorations(!!themeElement || isNewYearsDay);
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
      clearInterval(interval);
      observer.disconnect();
    };
  }, [isNewYearsDay]);

  if (!showDecorations && !isNewYearsDay) return null;

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

  // Use a much lower z-index to prevent interference with app functionality
  // z-index of 1 ensures decorations stay in background and don't block interactions
  return (
    <div 
      style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        width: '100%', 
        height: '100%', 
        pointerEvents: 'none', 
        zIndex: 1,
        isolation: 'isolate' // Create new stacking context
      }}
    >
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
      {/* Fireworks - Enhanced for New Year's Day */}
      {isNewYearsDay && (
        <>
          {/* Reduced number of fireworks to prevent performance issues */}
          {Array.from({ length: 6 }, (_, i) => {
            const positions = [
              { top: '10%', left: '15%' },
              { top: '20%', right: '20%' },
              { bottom: '25%', left: '10%' },
              { bottom: '35%', right: '15%' },
              { top: '5%', left: '70%' },
              { bottom: '10%', left: '80%' },
            ];
            const pos = positions[i % positions.length];
            return (
              <div
                key={`firework-${i}`}
                className="fixed text-4xl opacity-70 pointer-events-none"
                style={{
                  ...pos,
                  animation: `new-year-firework ${2 + Math.random() * 2}s ease-in-out infinite`,
                  animationDelay: `${i * 0.4}s`,
                  zIndex: 1,
                  fontSize: `${30 + Math.random() * 20}px`,
                }}
              >
                {i % 2 === 0 ? '🎆' : '🎇'}
              </div>
            );
          })}
          
          {/* Reduced sparkle effects */}
          {Array.from({ length: 10 }, (_, i) => (
            <div
              key={`sparkle-firework-${i}`}
              className="fixed text-2xl opacity-60 pointer-events-none"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animation: `new-year-sparkle ${1.5 + Math.random() * 1.5}s ease-in-out infinite`,
                animationDelay: `${Math.random() * 3}s`,
                zIndex: 1,
              }}
            >
              ✨
            </div>
          ))}
        </>
      )}
      
      {/* Regular fireworks (when not New Year's Day) */}
      {!isNewYearsDay && (
        <>
          <div
            className="fixed bottom-32 left-20 text-4xl opacity-60 pointer-events-none"
            style={{
              animation: "firework-burst 3s ease-in-out infinite",
              zIndex: 1,
            }}
          >
            🎆
          </div>
          <div
            className="fixed bottom-40 right-20 text-3xl opacity-50 pointer-events-none"
            style={{
              animation: "firework-burst 3.5s ease-in-out infinite",
              zIndex: 1,
            }}
          >
            🎇
          </div>
        </>
      )}
      {/* Clock/Countdown */}
      <div
        className="fixed top-60 left-1/2 transform -translate-x-1/2 text-3xl opacity-50 pointer-events-none"
        style={{
          animation: "pulse-glow 2s ease-in-out infinite",
          zIndex: 1,
        }}
      >
        🕐
      </div>
    </div>
  );
}

