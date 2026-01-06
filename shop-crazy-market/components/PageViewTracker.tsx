"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Tracks page views by sending requests to the API
 * This component should be added to the root layout
 */
export default function PageViewTracker() {
  const pathname = usePathname();

  useEffect(() => {
    // Don't track admin pages to avoid inflating numbers
    if (pathname?.startsWith('/admin')) {
      return;
    }

    // Get user ID from localStorage if available (optional)
    let userId: string | null = null;
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        userId = user?.id || null;
      }
    } catch (e) {
      // Ignore localStorage errors
    }

    // Track page view
    const trackView = async () => {
      try {
        await fetch("/api/views/track", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            path: pathname || '/',
            userId: userId,
          }),
        });
      } catch (error) {
        // Silently fail - we don't want tracking to break the app
        console.debug("[PageViewTracker] Failed to track view:", error);
      }
    };

    // Small delay to ensure pathname is stable
    const timer = setTimeout(trackView, 500);
    
    return () => clearTimeout(timer);
  }, [pathname]);

  return null; // This component doesn't render anything
}