"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { usePathname } from "next/navigation";
import OnboardingTutorial from "./OnboardingTutorial";

export default function TutorialWrapper({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorialChecked, setTutorialChecked] = useState(false);
  const checkedRef = useRef(false); // Use ref to persist across re-renders

  useEffect(() => {
    // Only check tutorial on client side after auth loads, and only once
    if (loading || !user?.id || checkedRef.current) return;

    checkTutorialStatus();
  }, [user?.id, loading]); // Only depend on user.id and loading

  async function checkTutorialStatus() {
    if (!user?.id || checkedRef.current) return;
    
    checkedRef.current = true; // Mark as checked immediately to prevent multiple calls

    try {
      // First check localStorage to avoid unnecessary API calls
      if (typeof window !== 'undefined') {
        try {
          const storedUser = localStorage.getItem("user");
          if (storedUser) {
            const userData = JSON.parse(storedUser);
            // Check if tutorial is already marked as completed in localStorage
            if (userData.tutorialCompleted === true) {
              setTutorialChecked(true);
              return; // Tutorial already completed, don't show
            }
          }
        } catch (error) {
          console.error("Error reading localStorage:", error);
        }
      }

      // Check with API to get the latest status
      const response = await fetch(`/api/users/${user.id}/tutorial`, {
        headers: { "x-user-id": user.id },
        cache: 'no-store',
      });

      if (response.ok) {
        const data = await response.json();
        
        // If tutorial is completed in database, update localStorage and don't show
        if (data.tutorialCompleted === true) {
          if (typeof window !== 'undefined') {
            try {
              const storedUser = localStorage.getItem("user");
              if (storedUser) {
                const userData = JSON.parse(storedUser);
                userData.tutorialCompleted = true;
                localStorage.setItem("user", JSON.stringify(userData));
              }
            } catch (error) {
              console.error("Error updating localStorage:", error);
            }
          }
          setTutorialChecked(true);
          return;
        }

        // Show tutorial only if not completed
        // Check if this is a new user (created recently)
        const userCreatedAt = new Date((user as any).createdAt || Date.now());
        const daysSinceCreation = (Date.now() - userCreatedAt.getTime()) / (1000 * 60 * 60 * 24);
        
        // Show tutorial for users created within last 7 days
        if (daysSinceCreation < 7 && !data.tutorialCompleted) {
          // Delay showing tutorial slightly for better UX
          setTimeout(() => {
            setShowTutorial(true);
          }, 1500);
        }
      }
    } catch (error) {
      console.error("Error checking tutorial status:", error);
      checkedRef.current = false; // Reset on error so it can try again
    } finally {
      setTutorialChecked(true);
    }
  }

  async function handleTutorialComplete() {
    setShowTutorial(false);
    
    // Mark as completed immediately in localStorage
    if (typeof window !== 'undefined') {
      try {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          userData.tutorialCompleted = true;
          localStorage.setItem("user", JSON.stringify(userData));
        }
        // Also set a separate flag for extra safety
        localStorage.setItem(`tutorial_completed_${user?.id}`, "true");
      } catch (error) {
        console.error("Error updating user in localStorage:", error);
      }
    }

    // Update in database
    if (user?.id) {
      try {
        await fetch(`/api/users/${user.id}/tutorial`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "x-user-id": user.id,
          },
          body: JSON.stringify({ completed: true }),
        });
      } catch (error) {
        console.error("Error updating tutorial status in database:", error);
        // Don't prevent completion if API call fails - localStorage is already updated
      }
    }
  }

  function handleTutorialSkip() {
    setShowTutorial(false);
    // Mark as completed when skipped
    handleTutorialComplete();
  }

  // Don't show tutorial on certain pages
  const hideTutorialPages = ["/login", "/signup", "/reset-password"];
  const shouldHide = hideTutorialPages.some((page) => pathname?.startsWith(page));

  // Double-check localStorage before rendering tutorial
  if (typeof window !== 'undefined' && user?.id) {
    try {
      const tutorialCompleted = localStorage.getItem(`tutorial_completed_${user.id}`);
      const storedUser = localStorage.getItem("user");
      if (tutorialCompleted === "true" || (storedUser && JSON.parse(storedUser).tutorialCompleted === true)) {
        if (showTutorial) {
          setShowTutorial(false);
        }
      }
    } catch (error) {
      // Ignore localStorage errors
    }
  }

  if (shouldHide || !showTutorial || !user?.id) {
    return <>{children}</>;
  }

  return (
    <>
      {children}
      <OnboardingTutorial
        isOpen={showTutorial}
        onComplete={handleTutorialComplete}
        onSkip={handleTutorialSkip}
        userId={user.id}
      />
    </>
  );
}
