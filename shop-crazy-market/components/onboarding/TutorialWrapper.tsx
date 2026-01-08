"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { usePathname } from "next/navigation";
import OnboardingTutorial from "./OnboardingTutorial";

export default function TutorialWrapper({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorialChecked, setTutorialChecked] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);

  useEffect(() => {
    // Only check tutorial on client side after auth loads
    if (loading || !user?.id || tutorialChecked) return;

    checkTutorialStatus();
  }, [user, loading, tutorialChecked]);

  async function checkTutorialStatus() {
    if (!user?.id) return;

    try {
      const response = await fetch(`/api/users/${user.id}/tutorial`, {
        headers: { "x-user-id": user.id },
      });

      if (response.ok) {
        const data = await response.json();
        // Show tutorial if not completed
        if (!data.tutorialCompleted) {
          // Check if this is a new user (created recently)
          const userCreatedAt = new Date((user as any).createdAt || Date.now());
          const daysSinceCreation = (Date.now() - userCreatedAt.getTime()) / (1000 * 60 * 60 * 24);
          
          // Show tutorial for users created within last 7 days, or if explicitly not completed
          if (daysSinceCreation < 7 || !data.tutorialCompleted) {
            setIsNewUser(daysSinceCreation < 1);
            // Delay showing tutorial slightly for better UX
            setTimeout(() => {
              setShowTutorial(true);
            }, 1000);
          }
        }
      }
    } catch (error) {
      console.error("Error checking tutorial status:", error);
    } finally {
      setTutorialChecked(true);
    }
  }

  async function handleTutorialComplete() {
    setShowTutorial(false);
    // Update local user state
    if (typeof window !== 'undefined') {
      try {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          userData.tutorialCompleted = true;
          localStorage.setItem("user", JSON.stringify(userData));
        }
      } catch (error) {
        console.error("Error updating user in localStorage:", error);
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
