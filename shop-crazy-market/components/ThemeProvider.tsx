"use client";

import { getMonthlyTheme } from "@/lib/theme";
import { useEffect, useState } from "react";

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState(getMonthlyTheme());

  // Update theme on mount and periodically to ensure it stays current
  useEffect(() => {
    // Update theme immediately on mount
    setTheme(getMonthlyTheme());

    // Check for theme updates every hour (in case date changes)
    const interval = setInterval(() => {
      const newTheme = getMonthlyTheme();
      setTheme((currentTheme) => {
        // Only update if theme actually changed
        if (currentTheme.name !== newTheme.name) {
          return newTheme;
        }
        return currentTheme;
      });
    }, 60 * 60 * 1000); // Check every hour

    // Also check when the day changes (at midnight)
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const msUntilMidnight = tomorrow.getTime() - now.getTime();

    let dailyInterval: NodeJS.Timeout | null = null;

    const midnightTimeout = setTimeout(() => {
      setTheme(getMonthlyTheme());
      // After first midnight check, set up daily checks
      dailyInterval = setInterval(() => {
        setTheme(getMonthlyTheme());
      }, 24 * 60 * 60 * 1000); // Check every 24 hours
    }, msUntilMidnight);

    return () => {
      clearInterval(interval);
      clearTimeout(midnightTimeout);
      if (dailyInterval) {
        clearInterval(dailyInterval);
      }
    };
  }, []);

  return (
    <div
      className={`${theme.bg} ${theme.font} min-h-screen transition-all duration-700`}
      data-theme={theme.name}
    >
      {children}
    </div>
  );
}
