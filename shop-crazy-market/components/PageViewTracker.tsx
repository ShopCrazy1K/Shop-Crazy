"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

/**
 * Tracks page views by sending requests to the API
 * This component should be added to the root layout
 */
export default function PageViewTracker() {
  const pathname = usePathname();
  const { user } = useAuth();

  useEffect(() => {
    // Don't track admin pages to avoid inflating numbers
    if (pathname?.startsWith('/admin')) {
      return;
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
            userId: user?.id || null,
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
  }, [pathname, user?.id]);

  return null; // This component doesn't render anything
}