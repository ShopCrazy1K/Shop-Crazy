"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface TutorialStep {
  id: string;
  title: string;
  description: string;
  emoji: string;
  action?: {
    text: string;
    href: string;
    onClick?: () => void;
  };
}

interface Props {
  isOpen: boolean;
  onComplete: () => void;
  onSkip: () => void;
  userId: string;
}

export default function OnboardingTutorial({ isOpen, onComplete, onSkip, userId }: Props) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const router = useRouter();

  const steps: TutorialStep[] = [
    {
      id: "welcome",
      title: "Welcome to Shop Crazy Market! 🎉",
      description: "You're about to discover an amazing marketplace. Let's get you started with a quick tour of the key features.",
      emoji: "👋",
    },
    {
      id: "profile",
      title: "Complete Your Profile",
      description: "Add your username, avatar, and bio to help buyers get to know you. A complete profile builds trust and increases sales!",
      emoji: "👤",
      action: {
        text: "Go to Profile",
        href: "/profile",
      },
    },
    {
      id: "marketplace",
      title: "Explore the Marketplace",
      description: "Browse thousands of unique products from sellers worldwide. Use filters and search to find exactly what you're looking for.",
      emoji: "🛍️",
      action: {
        text: "Browse Marketplace",
        href: "/marketplace",
      },
    },
    {
      id: "sell",
      title: "Start Selling",
      description: "Ready to sell? Create your first listing in minutes! Add photos, set your price, and start making sales.",
      emoji: "💰",
      action: {
        text: "Create Listing",
        href: "/listings/new",
      },
    },
    {
      id: "favorites",
      title: "Save Your Favorites",
      description: "Found something you love? Click the heart icon to save it to your favorites and come back later.",
      emoji: "❤️",
    },
    {
      id: "dashboard",
      title: "Track Your Sales",
      description: "Use the Seller Dashboard to see your analytics, manage inventory, view orders, and export financial reports.",
      emoji: "📊",
      action: {
        text: "View Dashboard",
        href: "/seller/dashboard",
      },
    },
    {
      id: "complete",
      title: "You're All Set! 🎊",
      description: "You now know the basics. Start exploring and making the most of Shop Crazy Market! Need help? Check out our help center anytime.",
      emoji: "✨",
    },
  ];

  useEffect(() => {
    if (!isOpen) return;
    // Reset to first step when tutorial opens
    setCurrentStep(0);
    setCompletedSteps(new Set());
  }, [isOpen]);

  async function handleComplete() {
    // Mark as completed in localStorage immediately
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(`tutorial_completed_${userId}`, "true");
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

    // Update in database
    try {
      const response = await fetch(`/api/users/${userId}/tutorial`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": userId,
        },
        body: JSON.stringify({ completed: true }),
      });

      if (response.ok) {
        onComplete();
      } else {
        // Still complete even if API fails - localStorage is the source of truth
        onComplete();
      }
    } catch (error) {
      console.error("Error completing tutorial:", error);
      onComplete(); // Still close tutorial even if API call fails - localStorage is updated
    }
  }

  function handleNext() {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      setCompletedSteps(new Set([...completedSteps, steps[currentStep].id]));
    } else {
      handleComplete();
    }
  }

  function handlePrevious() {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  }

  function handleStepClick(index: number) {
    setCurrentStep(index);
  }

  if (!isOpen) return null;

  const currentStepData = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Progress Bar */}
        <div className="h-2 bg-gray-200">
          <div
            className="h-full bg-gradient-to-r from-purple-600 to-pink-600 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Step Indicators */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-center gap-2">
          {steps.map((step, index) => (
            <button
              key={step.id}
              onClick={() => handleStepClick(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentStep
                  ? "bg-purple-600 w-8"
                  : index < currentStep
                  ? "bg-green-500"
                  : "bg-gray-300"
              }`}
              title={step.title}
            />
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="text-center">
            <div className="text-6xl mb-4 animate-bounce">{currentStepData.emoji}</div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {currentStepData.title}
            </h2>
            <p className="text-lg text-gray-600 mb-6 max-w-lg mx-auto">
              {currentStepData.description}
            </p>

            {/* Action Button */}
            {currentStepData.action && (
              <div className="mt-8">
                {currentStepData.action.href ? (
                  <Link
                    href={currentStepData.action.href}
                    onClick={() => {
                      setCompletedSteps(new Set([...completedSteps, currentStepData.id]));
                      setTimeout(() => {
                        handleNext();
                      }, 500);
                    }}
                    className="inline-block px-8 py-3 bg-purple-600 text-white rounded-lg font-bold text-lg hover:bg-purple-700 transition-colors shadow-lg"
                  >
                    {currentStepData.action.text} →
                  </Link>
                ) : (
                  <button
                    onClick={currentStepData.action.onClick}
                    className="px-8 py-3 bg-purple-600 text-white rounded-lg font-bold text-lg hover:bg-purple-700 transition-colors shadow-lg"
                  >
                    {currentStepData.action.text}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <div className="p-6 border-t border-gray-200 flex items-center justify-between">
          <button
            onClick={onSkip}
            className="px-6 py-2 text-gray-600 hover:text-gray-800 font-semibold transition-colors"
          >
            Skip Tutorial
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              ← Previous
            </button>
            <button
              onClick={handleNext}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors"
            >
              {currentStep === steps.length - 1 ? "Get Started! 🚀" : "Next →"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
